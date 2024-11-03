import Button from "react-bootstrap/Button";
import "./Home.css";

const Home = ({ setActiveComponent }: { setActiveComponent: any }) => {
  return (
    <>
      <div className="center">
        <Button className="glow" onClick={() => setActiveComponent("prompt")}>
          Sign In!
        </Button>
        <Button className="glow">Learn More</Button>
      </div>
    </>
  );
};

export default Home;
