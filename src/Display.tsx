import React, { useRef, useEffect } from 'react';

interface DisplayProps {
  stream: MediaStream | null;
}

const Display: React.FC<DisplayProps> = ({ stream }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      style={{
        display: 'block',
        width: '100%', // Adjust as necessary
        height: 'auto', // Adjust as necessary
        marginTop: '20px', // Adds space above the video
        border: '2px solid #ccc', // Optional styling for visibility
      }}
    />
  );
};
export default Display;
