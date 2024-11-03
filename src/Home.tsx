import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";
import "./Home.css";
import Display from "./Display";
import { useState } from "react";
import About from "./About";

const Home = ({ setActiveComponent }: { setActiveComponent: any }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [showDisplay, setShowDisplay] = useState(false); // State to control display visibility
  const [loading, setLoading] = useState(false); // State for loading
  const [inAboutPage, setInAboutPage] = useState(false); // State to track if we're on the About page

  const handleFaceLogin = async () => {
    try {
      setShowDisplay(true); // Show the Display component
      // setActiveComponent("prompt");
      const permissionStatus = await navigator.permissions.query({ name: "camera" as any });
      if (permissionStatus.state === "granted" || permissionStatus.state === "prompt") {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream); // Set the stream to state
        recognizeFace();
        console.log("Facial login triggered");
      } else {
        console.error("Camera access denied");
        alert("Camera access denied. Please check your settings.");
      }
    } catch (error) {
      console.error("Error accessing camera", error);
      alert("Could not access the camera. Please check your permissions.");
    }
  };

  const recognizeFace = async () => {
    console.log("Facial recognition process would start here");
    setLoading(true);
    setTimeout(() => {
      setLoading(false); // Hide loading indicator
      setActiveComponent("prompt");
    }, 3000);
  };

  const handleLearnMore = async () => {
    setInAboutPage(true);
    setActiveComponent("about");
  };

  const handleBack = () => {
    setInAboutPage(false);
    setActiveComponent("home");
  };

  return (
    <>
      <div className="center">
        {loading && (
          <div className="loading-container">
            <Spinner animation="border" role="status" />
          </div>
        )}

        {inAboutPage && (
          <About handleBack={handleBack} /> // Pass the handleBack function here
        )}

        {!inAboutPage && (
          <>
            <Button className="glow" onClick={handleFaceLogin}>
              Login
            </Button>
            <Button className="glow" onClick={handleLearnMore}>
              Learn More
            </Button>
          </>
        )}

        {showDisplay && <Display stream={stream} />}
      </div>
    </>
  );
};

export default Home;
