import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Send } from "lucide-react";
import axiosClient from "../utils/axiosClient";

const ChatAi = ({problem}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [messages, setMessages] = useState([
    {role: "model", parts: [{ text: "Hello, how can I help you?" }] },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


const onSubmit = async (data) => {
  const userMessage = {
    role: "user",
    parts: [{ text: data.message }],
  };

  const updatedMessages = [...messages, userMessage];

  setMessages(updatedMessages);
 
  reset();

  try {
    const response = await axiosClient.post("/ai/chat", {
      messages: updatedMessages,
      title: problem.title,
      description: problem.description,
      visibleTestCases: problem.visibleTestCases,
      startcode: problem.startcode,
    });

    const aiMessage = {
      role: "model",
      parts: [{ text: response.data.message }],
    };

    setMessages((prev) => [...prev, aiMessage]);
  } catch (err) {
    console.log("Api Error:", err);

    setMessages((prev) => [
      ...prev,
      {
        role: "model",
        parts: [{ text: "Sorry, I encountered an error." }],
      },
    ]);
  }
};

  return (
    <div className="flex flex-col h-[80vh] p-4">
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${msg.role === "user" ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-bubble">{msg.parts[0].text}</div>
          </div>
        ))}

        <div ref={messagesEndRef}></div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-center gap-2 border-t pt-3"
      >
        <input
          className="input input-bordered w-full"
          placeholder="Type a message..."
          {...register("message", {
            required: "Message is required",
            minLength: {
              value: 2,
              message: "Message must be at least 2 characters",
            },
          })}
        />

        <button type="submit" className="btn btn-primary">
          <Send size={18} />
        </button>
      </form>

      {errors.message && (
        <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
      )}
    </div>
  );
};

export default ChatAi;
