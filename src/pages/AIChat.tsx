// import { useState } from "react";
// import { askAI } from "@/services/aiService";

// const AIChat = () => {
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState<string[]>([]);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMsg = `You: ${input}`;
//     setMessages((prev) => [...prev, userMsg]);

//     const reply = await askAI(input);
//     setMessages((prev) => [...prev, `AI: ${reply}`]);

//     setInput("");
//   };

//   return (
//     <div className="p-6 max-w-xl mx-auto">
//       <h1 className="text-3xl font-bold mb-4">CarFinder AI Assistant</h1>

//       <div className="border p-4 rounded-lg h-96 overflow-y-auto bg-muted mb-4">
//         {messages.map((msg, i) => (
//           <p key={i} className="mb-2">{msg}</p>
//         ))}
//       </div>

//       <div className="flex gap-2">
//         <input
//           className="flex-1 border px-3 py-2 rounded"
//           placeholder="Ask anything about cars..."
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//         />
//         <button onClick={sendMessage} className="bg-primary text-white px-4 rounded">
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AIChat;
