import { useState } from "react";
import Button from "react-bootstrap/Button";

interface Message {
  text: string;
  sender: "user" | "backend";
}

const Prompt: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleInput = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    setMessages((prevMessages) => [...prevMessages, { text: prompt, sender: "user" }]);

    try {
      const response = await fetch("insert-api", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      setMessages((prevMessages) => [...prevMessages, { text: data.response, sender: "backend" }]);

      setPrompt("");
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ maxHeight: "400px", padding: "10px" }}>
        {messages.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.sender === "backend" ? "left" : "right" }}>
            <strong>{msg.sender === "backend" ? "Fine-tuned" : "Prompt"}:</strong> {msg.text}
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
          Done
        </Button>
      </form>
    </div>
  );
};

export default Prompt;
