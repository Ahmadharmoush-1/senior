import { useState } from "react";

const OtpPage = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);

  const sendOtp = async () => {
    const res = await fetch("http://localhost:5000/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) setSent(true);
  };

  const verifyOtp = async () => {
    const res = await fetch("http://localhost:5000/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      {!sent ? (
        <>
          <h2 className="text-xl font-bold">Send OTP</h2>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="border p-2 rounded"
          />
          <button onClick={sendOtp} className="bg-blue-500 text-white p-2 rounded">
            Send OTP
          </button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold">Verify OTP</h2>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter the 6-digit OTP"
            className="border p-2 rounded"
          />
          <button onClick={verifyOtp} className="bg-green-500 text-white p-2 rounded">
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
};

export default OtpPage;
