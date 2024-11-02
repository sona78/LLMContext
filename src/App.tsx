import './App.css'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import FaceLogin from './utils/FaceLogin';
import Prompt from './utils/Prompt'
import "./App.css";
import Scraper from "./scraper";

function App() {
  return (
    <>
      <h1>You.AI</h1>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/scraper"/>} /> {/* Redirect to FaceLogin */}
          <Route path="/face-login" element={<FaceLogin />} /> FaceLogin route
          <Route path="/prompt" element={<Prompt />} /> Example additional route
          <Route path="/scraper" element={<Scraper />} /> Example additional route
        </Routes>
      </Router>
    </>
  );
}
export default App;
