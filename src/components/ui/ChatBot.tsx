import React, { useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  content: string;
}

const API_URL = "http://localhost:5000/api/chat";

export const ChatBot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      content:
        "👋 Hello! I'm your AI assistant. Ask me anything about buying or selling cars!",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.content,
      }));

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          history,
        }),
      });

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: Date.now().toString() + "_bot",
        sender: "bot",
        content: data.reply,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: "error",
          sender: "bot",
          content: "⚠️ Something went wrong. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 transition"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Container */}
      {open && (
        <div className="fixed bottom-20 right-5 w-80 md:w-96 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white py-3 px-4 flex justify-between items-center">
            <p className="font-semibold">AI Assistant</p>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="p-3 h-80 overflow-y-auto space-y-2 bg-gray-50 dark:bg-gray-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[75%] text-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-gray-500 text-sm">AI is typing...</div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 flex items-center border-t dark:border-gray-700 bg-white dark:bg-gray-900">
            <input
              className="flex-1 px-3 py-2 text-sm rounded-lg border dark:border-gray-700 dark:bg-gray-800 focus:outline-none"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="ml-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
