import Button from "react-bootstrap/Button";
import './About.css'; // Create a CSS file for styling

const About = ({ handleBack }: { handleBack: () => void }) => {
  return (
    <div className="about-container">
      <div className="content">
        <h1>Your Personal Tool.</h1>
        <ul>
          <li>
            Large language model contexts saved on specific sites that you enable
          </li>
          <li>
            Queries that combine your unique experiences, making your workflow accurate and efficient
          </li>
          <li>
            Integrated effortlessly into everything that you allow. We never share your data
          </li>
        </ul>
        <p>
          Experience the future of large language models. Make productivity more simple, efficient, and personalized.
        </p>
      </div>
      <div className="container">
        <Button className="glow" onClick={handleBack}>
          Back
        </Button>
      </div>
    </div>
  );
};
export default About;
