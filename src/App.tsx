import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Button from "react-bootstrap/Button";
// import FaceLogin from './utils/FaceLogin';
import { useState, useEffect, useRef } from "react";
import Prompt from "./Prompt";
import Scraper from "./scraper";
import Home from "./Home";
import About from "./About"

function App() {
  const [activeComponent, setActiveComponent] = useState("home");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // const showFaceLogin = () => setActiveComponent("faceLogin");
  // const showPrompt = () => setActiveComponent("prompt");
  // const showScraper = () => setActiveComponent("scraper");
  // const showHome = () => setActiveComponent("home");

  // const handleFaceLogin = async () => {
  //   try {
  //     // Use 'any' to bypass the type restriction for the camera permission
  //     const permissionStatus = await navigator.permissions.query({ name: 'camera' as any });
  //     if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
  //       const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //       if (videoRef.current) {
  //         videoRef.current.srcObject = stream;
  //         videoRef.current.play();
  //       }
  //       console.log("Facial login triggered");
  //     } else {
  //       console.error("Camera access denied");
  //       alert("Camera access denied. Please check your settings.");
  //     }
  //   } catch (error) {
  //     console.error("Error accessing camera", error);
  //     alert("Could not access the camera. Please check your permissions.");
  //   }
  // };
 
  // useEffect(() => {
  //   const promptUserForLogin = () => {
  //     alert("Click 'Login' to access");
  //   };
  //   promptUserForLogin();
  // }, []);

  const handleBack = () => {
    setActiveComponent("home");
  };

  return (
    <div className="App">
      <div style={{ padding: "10px" }}>
        <h1 className="name">MY.AI</h1>
      </div>
      {activeComponent !== "home" && activeComponent !== "learn" && activeComponent !== "about" && activeComponent !== "scraper" && (
        <nav>
          <Button className="glow" onClick={() => setActiveComponent("scraper")}>
            Scraper
          </Button>
        </nav>
      )}
      {activeComponent === "home" && <Home setActiveComponent={setActiveComponent} />}
      {activeComponent === "prompt" && <Prompt />}
      {activeComponent === "scraper" && <Scraper />}
      {activeComponent === "about" && <About handleBack={handleBack} />}
      <video ref={videoRef} style={{ display: "none" }} /> {/* Hidden video element */}
    </div>
  );
}
export default App;
