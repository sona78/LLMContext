import { useState } from "react";
import axios from "axios";
import Button from "react-bootstrap/Button";
import Response from "./Response";

const LOCAL_HOST = "http://localhost:8000";

interface Message {
  text: string;
  sender: "user" | "backend";
}

const Prompt: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [backendResponse, setBackendResponse] = useState<string>("");

  const handleInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setMessages((prevMessages) => [...prevMessages, { text: prompt, sender: "user" }]);

    try {
      const response = await axios.get(`${LOCAL_HOST}/get_context`, {
        params: { user_id: 1, question: prompt },
      });

      setPrompt("");

      setBackendResponse(response.data);

      handleDrop(response.data);

      setMessages((prevMessages) => [...prevMessages, { text: response.data, sender: "backend" }]);

      setPrompt("");
    } catch (error) {
      setPrompt("");
      console.error("Error fetching data:", error);
      console.error("Error fetching response");
    }
  };

  const handleDrop = (context: any) => {
    context = context.join(" ");
    chrome.runtime.sendMessage(`context: ${context}`, (response: any) => {
      console.log(response);
    });
  };

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ maxHeight: "400px", padding: "10px", color: "white" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === "backend" ? "left" : "right" }}>
            <strong>{msg.sender === "backend" ? "Context" : "Prompt"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleInput} style={{ display: "flex", marginTop: "10px" }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Input..."
          className="prompt-input"
        />
        <Button type="submit" className="glow">
          Retrieve Context
        </Button>
      </form>

      {backendResponse && <Response message={backendResponse} />}
    </div>
  );
};

export default Prompt;
