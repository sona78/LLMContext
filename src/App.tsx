import './App.css';
import { useState } from 'react';
// import FaceLogin from './utils/FaceLogin';
import Prompt from './utils/Prompt';
import Scraper from './scraper';

function App() {
  const [activeComponent, setActiveComponent] = useState("prompt"); // Default to Prompt
  // const showFaceLogin = () => setActiveComponent("faceLogin");
  const showPrompt = () => setActiveComponent("prompt");
  const showScraper = () => setActiveComponent("scraper");

  return (
    <div className="App">
      <h1>You.AI</h1>
      {}
      <nav>
        {/* <button onClick={showFaceLogin}>Face Login</button> */}
        <button onClick={showPrompt}>Prompt</button>
        <button onClick={showScraper}>Scraper</button>
      </nav>

      {}
      {/* {activeComponent === "faceLogin" && <FaceLogin />} */}
      {activeComponent === "prompt" && <Prompt />}
      {activeComponent === "scraper" && <Scraper />}
    </div>
  );
}

export default App;
