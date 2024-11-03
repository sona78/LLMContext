import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import { useState } from "react";
import Button from "react-bootstrap/Button";
// import FaceLogin from './utils/FaceLogin';
import { useEffect, useRef } from "react";
import Prompt from "./Prompt";
import Scraper from "./scraper";
import Home from "./Home";

function App() {
  const [activeComponent, setActiveComponent] = useState("home"); // Default to Prompt
  // const showFaceLogin = () => setActiveComponent("faceLogin");
  const showPrompt = () => setActiveComponent("prompt");
  const showScraper = () => setActiveComponent("scraper");
  const showHome = () => setActiveComponent("home");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handleFaceLogin = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      console.log("Facial login triggered");
    } catch (error) {
      console.error("Error accessing camera", error);
      alert("Could not access the camera. Please check your permissions.");
    }
  };
  // const handleFaceLogin = async () => {
  //   try {
  //     // Check for camera permissions
  //     const permissionStatus = await navigator.permissions.query({ name: 'camera' });
  //     if (permissionStatus.state === 'granted') {
  //       // Access the camera
  //       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //       if (videoRef.current) {
  //         videoRef.current.srcObject = stream;
  //         videoRef.current.play();
  //       }
  //       console.log("Facial login triggered");
  //     } else if (permissionStatus.state === 'prompt') {
  //       // Request permission
  //       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //       if (videoRef.current) {
  //         videoRef.current.srcObject = stream;
  //         videoRef.current.play();
  //       }
  //       console.log("Facial login triggered");
  //     } else {
  //       console.log("Camera access denied");
  //       alert("Camera access denied. Please check your settings.");
  //     }
  //   } catch (error) {
  //     console.log("Error accessing camera", error);
  //     alert("Could not access the camera. Please check your permissions.");
  //   }
  // };

  useEffect(() => {
    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach((track) => track.stop());
        }
      }
    };
  }, []);

  return (
    <div className="App">
      <div style={{ padding: "10px" }}>
        <h1 className="name">You.AI</h1>
      </div>
      {}
      {activeComponent != "home" && activeComponent != "learn" && (
        <nav>
          {/* <Button onClick={handleFaceLogin}>Face Login</Button> */}
          <Button className="glow" onClick={showPrompt}>
            Prompt
          </Button>
          <Button className="glow" onClick={showScraper}>
            Scraper
          </Button>
        </nav>
      )}

      {}
      {/* {activeComponent === "faceLogin" && <FaceLogin />} */}
      {activeComponent === "home" && <Home setActiveComponent={setActiveComponent} />}
      {activeComponent === "prompt" && <Prompt />}
      {activeComponent === "scraper" && <Scraper />}
    </div>
  );
}
export default App;
