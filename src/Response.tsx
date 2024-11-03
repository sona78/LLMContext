import React from "react";

interface ResponseProps {
  message: string;
}

const Response: React.FC<ResponseProps> = ({ message }) => {
  return (
    <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", backgroundColor: "#f9f9f9" }}>
      <strong>Response from Backend:</strong>
      <p>{message}</p>
    </div>
  );
};

export default Response;
