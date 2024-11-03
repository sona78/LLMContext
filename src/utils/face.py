import os
import cv2
import mediapipe as mp
import boto3
import datetime
import logging
from configuration import VIDEO_BUCKET_NAME, IMAGE_BUCKET_NAME, AWS_ACCESS_KEY, AWS_SECRET_ACCESSKEY, FACE_DETECTION_AWS_REGION
from server.utils.file_utils import get_tmp_directory_path

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize AWS clients for S3 and Rekognition
s3 = boto3.client('s3', region_name=FACE_DETECTION_AWS_REGION, aws_access_key_id=AWS_ACCESS_KEY, aws_secret_access_key=AWS_SECRET_ACCESSKEY)
rekognition = boto3.client('rekognition', region_name=FACE_DETECTION_AWS_REGION)

# Constants for file extension  
FILE_EXTENSION = 'mp4'

# Construct S3 key for uploading images
def mount_s3_key(identity_id, file_id, filename):
    return f'private/{identity_id}/{file_id}/{filename}'
    

# Download video from S3 to local directory
async def download_video_from_s3(VIDEO_BUCKET_NAME, identity_id, file_id):
    tmp_directory = get_tmp_directory_path()
    local_path = os.path.join(tmp_directory, f'{identity_id}_{file_id}.{FILE_EXTENSION}')
    s3_key = f'private/{identity_id}/{file_id}.{FILE_EXTENSION}'
    logger.info(f"Downloading from S3: bucket={VIDEO_BUCKET_NAME}, key={s3_key}, local_path={local_path}")
    
    try: 
        # Check output directory exists 
        os.makedirs(tmp_directory, exist_ok=True)
        logger.info(f"Output directory exists at: {tmp_directory}")

        # Download file from S3 to local directory
        response = s3.get_object(Bucket=VIDEO_BUCKET_NAME, Key=s3_key)
        with open(local_path, 'wb') as file:
            file.write(response['Body'].read())
        
        logger.info(f'Downloaded {s3_key} to {local_path}')
    except Exception as e:
        logger.error(f'Failed to download {s3_key} from S3: {e}')
    return local_path

# Upload images of detect faces to S3
async def upload_faces_to_s3(identity_id, file_id, IMAGE_BUCKET_NAME, images):
    image_keys = [] # List to store S3 keys of uploaded images
    for i, (image_path, timestamp) in enumerate(images):
        face_number = i + 1
        filename = f'face_{face_number}.jpg'
        image_key = mount_s3_key(identity_id, file_id, filename)
        try:
            # Upload image to S3
            s3.upload_file(image_path, IMAGE_BUCKET_NAME, image_key)
            image_keys.append((image_key, timestamp)) # Store S3 key and timestamp
            logger.info(f'Uploaded {image_path} to {IMAGE_BUCKET_NAME}/{image_key}')
          
        except Exception as e:
            logger.error(f'Failed to upload {image_path}: {e}') 
    return image_keys

async def process_detected_faces(local_path, timestamp, identity_id, file_id, unique_faces, face_ids, face_timestamps, image_keys, similarity_threshold):
    # Get face confidence using Rekognition
    face_details = await detect_faces_with_rekognition(local_path)
    if not face_details:
        logger.info(f"No faces detected in {local_path}, not uploading.")
        return

    confidence = face_details[0]['Confidence']
    logger.info(f"Detected face with confidence: {confidence}")

    match_found = False
    # Compare face with previously identified unique faces
    for face_id, (face_file, face_confidence, face_metadata) in unique_faces.items():
        matches = await compare_faces_for_similarity(face_file, local_path, similarity_threshold)
        if matches:
            logger.info(f"Match found with unique face: {face_id}")
            # Check if the new face has higher confidence
            if confidence > face_confidence:
                # Update with higher confidence face
                unique_faces[face_id] = (local_path, confidence, {'first_appearance': timestamp})

                # Upload the new higher confidence face to S3
                filename = f'{face_id}.jpg'
                s3_key = mount_s3_key(identity_id, file_id, filename)
                try:
                    s3.upload_file(local_path, IMAGE_BUCKET_NAME, s3_key)
                    image_keys.append(s3_key)
                    logger.info(f'Uploaded {local_path} to S3 as {s3_key}')
                except Exception as e:
                    logger.error(f'Failed to upload {local_path} to S3: {e}')

            face_ids[local_path] = face_id
            face_timestamps.setdefault(face_id, []).append(timestamp)
            match_found = True
            break

    if not match_found:
        # No match found, this is a new unique face
        face_id = f"Face {len(unique_faces) + 1}"
        unique_faces[face_id] = (local_path, confidence, {'first_appearance': timestamp})
        face_ids[local_path] = face_id
        face_timestamps[face_id] = [timestamp]

        # Upload image to S3
        s3_key = mount_s3_key(identity_id, file_id, local_path)
        try:
            s3.upload_file(local_path, IMAGE_BUCKET_NAME, s3_key)
            image_keys.append(s3_key)
            logger.info(f'Uploaded {local_path} to S3 as {s3_key}')
        except Exception as e:
            logger.error(f'Failed to upload {local_path} to S3: {e}')

        logger.info(f"New unique face detected: {local_path} as {face_id}")

# Convert frame to acceptable format for MediaPipe Face Detection, then convert back for OpenCV
def convert_frame_for_mediapipe(frame, face_detection):
    # Convert frame from BGR (used by OpenCV) to the RGB color space (used by MediaPipe's face detection model)
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    # Process the frame using MediaPipe Face Detection
    results = face_detection.process(frame_rgb)
    # Convert the frame back to BGR 
    frame = cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR)
    return frame, results

# Get bounding box coordinates of detected face
def get_bounding_box_coordinates(bboxC, frame):
    x_min = int(bboxC.xmin * frame.shape[1])
    y_min = int(bboxC.ymin * frame.shape[0])
    x_max = x_min + int(bboxC.width * frame.shape[1])
    y_max = y_min + int(bboxC.height * frame.shape[0])

    x_min = max(0, x_min)
    y_min = max(0, y_min)
    x_max = min(frame.shape[1], x_max)
    y_max = min(frame.shape[0], y_max)
    
    return x_min, y_min, x_max, y_max

# Process face detections and save face images
async def get_cropped_face_images(detections, frame, frame_count, tmp_directory, detected_faces, timestamp_str):
    for detection in detections:
        bboxC = detection.location_data.relative_bounding_box
        x_min, y_min, x_max, y_max = get_bounding_box_coordinates(bboxC, frame)

        if x_max > x_min and y_max > y_min:
            face_image = frame[y_min:y_max, x_min:x_max]
            face_file = os.path.join(tmp_directory, f'face_{frame_count}_{x_min}_{y_min}.jpg')
            cv2.imwrite(face_file, face_image) # Save face image to local directory
            detected_faces.append((face_file, timestamp_str)) # Append face image and timestamp
        else:
            logger.info(f"Skipped empty face image for frame {frame_count}")


# Process video, detect faces, and save face images
async def process_video(video_path, skip_frames=30, min_detection_confidence=0.6):
    # Initialize MediaPipe Face Detection
    mp_face_detection = mp.solutions.face_detection
    face_detection = mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=min_detection_confidence)

    # Open the video file
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        logger.error(f"Error: Could not open video {video_path}")
        return

    frame_count = 0 # Frame counter
    detected_faces = [] # List to store detected faces
    MILLISECONDS_TO_SECONDS = 1000.0 # Conversion factor for milliseconds to seconds for timestamps

    tmp_directory = get_tmp_directory_path()
    os.makedirs(tmp_directory, exist_ok=True)

    while cap.isOpened():
        # Process each frame in the video
        success, frame = cap.read()
        if not success:
            logger.info("Ignoring empty camera frame or end of video.")
            break

        if frame_count % skip_frames == 0:
            # Calculate the timestamp of the frame
            timestamp = cap.get(cv2.CAP_PROP_POS_MSEC) / MILLISECONDS_TO_SECONDS
            timestamp_str = str(datetime.timedelta(seconds=timestamp))
            logger.info(f"Processing frame {frame_count}, timestamp {timestamp_str}")

            # Convert frame to accepted format for MediaPipe Face Detection
            frame, results = convert_frame_for_mediapipe(frame, face_detection)

            # Get cropped images of faces detected in the frame
            if results.detections:
                await get_cropped_face_images(results.detections, frame, frame_count, tmp_directory, detected_faces, timestamp_str)
        frame_count += 1

    cap.release()
    cv2.destroyAllWindows()
    return detected_faces  

async def detect_faces_with_rekognition(image_path):
    # Face detection with Rekognition to return face details e.g. confidence
    with open(image_path, 'rb') as image:
        response = rekognition.detect_faces(
            Image={'Bytes': image.read()},
            Attributes=['ALL']
        )
    return response['FaceDetails']

async def compare_faces_for_similarity(source_image, target_image, similarity_threshold=90):
    # Compare faces in two images and return the similarity; if the similarity > 90, faces are considered the same
    with open(source_image, 'rb') as source, open(target_image, 'rb') as target:
        response = rekognition.compare_faces(
            SourceImage={'Bytes': source.read()},
            TargetImage={'Bytes': target.read()},
            SimilarityThreshold=similarity_threshold
        )
    return response['FaceMatches']

# Identify unique faces in images using Rekognition
async def identify_unique_faces(detected_faces, identity_id, file_id, similarity_threshold=70):
    unique_faces = {}  # Maps unique face ID to (file, confidence, metadata)
    face_ids = {}  # Maps face files to their assigned unique face ID
    face_timestamps = {}  # Maps face ID to list of timestamps
    image_keys = []  # List to store S3 keys of uploaded images

    # Iterate over detected faces
    for local_path, timestamp in detected_faces:
        await process_detected_faces(local_path, timestamp, identity_id, file_id, unique_faces, face_ids, face_timestamps, image_keys, similarity_threshold)
      
    # Print summary of unique faces
    for face_id, (file, confidence, metadata) in unique_faces.items():
        file_list = ', '.join([file])
        logger.info(f"{face_id}: {file_list} with best confidence: {confidence} first appeared at {metadata['first_appearance']}")

    return unique_faces, face_ids, face_timestamps, image_keys

async def handle_face_detection(identity_id, file_id):
   
    logger.info(f"Starting face detection for identity_id: {identity_id}, file_id: {file_id}")

    # Download video from S3
    local_video_path = await download_video_from_s3(VIDEO_BUCKET_NAME, identity_id, file_id)
    logger.info(f"Downloaded video to {local_video_path}")
    
    # Process video, detect faces, and save face images
    detected_faces = await process_video(local_video_path)
    logger.info(f"Processed video, detected faces")

    # Identify unique faces in images using Rekognition and upload to S3
    unique_faces, face_ids, face_timestamps, image_keys = await identify_unique_faces(detected_faces, identity_id, file_id)
    logger.info(f"Identified unique faces: {len(unique_faces)} found")

    # Remove local face images
    for local_path, _ in detected_faces:
        try:
            os.remove(local_path)
            logger.info(f"Removed local image file: {local_path}")
        except Exception as e:
            logger.error(f"Failed to remove local image file {local_path}: {e}")

    # Remove local video file
    try:
        os.remove(local_video_path)
        logger.info(f"Removed local video file: {local_video_path}")
    except Exception as e:
        logger.error(f"Failed to remove local video file {local_video_path}: {e}")

    return {
        "message": "Face detection and indexing completed",
        "detected_faces": detected_faces,
        "unique_faces": unique_faces,
        "face_ids": face_ids,
        "face_timestamps": face_timestamps,
        "image_keys": image_keys,
    }
