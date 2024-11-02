import React from 'react';
import { useEffect, useRef } from 'react';
import "./FaceLogin.css"
// const rekognition = new AWS.Rekognition();


const FaceLogin: React.FC = () => {
const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleFaceLogin = async () => {
    try {
        // Access the camera
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
        console.log("Facial login triggered");
    }
    catch (error) {
        console.log("Error accessing camera", error);
        alert("Could not access the camera. Please check your permissions.")
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    };
  }, []);

  return (
    <div className="main-container">
      <button onClick={handleFaceLogin} style={{ padding: '20px' }}>
        Scan Face
      </button>
      <div style={{marginTop: '20px'}}>
        <video ref={videoRef} style={{ 
        }}
        autoPlay
        playsInline
        /> 
      </div>
    </div>
  );
};

export default FaceLogin;
