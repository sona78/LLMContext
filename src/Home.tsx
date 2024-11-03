import Button from "react-bootstrap/Button";

const Home: React.FC = () => {
  return (
    <div style={{ padding: '40px' }}>
      <div style={{ maxHeight: '400px', overflowY: 'scroll', padding: '10px' }}>

      </div>
      <div className="center">
        <Button>Sign In!</Button>
        <Button>Learn More</Button>
      </div>
    </div>
  );
};

export default Home
