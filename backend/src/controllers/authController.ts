import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { sendEmail } from "../utils/sendEmail";

const signToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET!, { expiresIn: "30d" });
};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ---------------------------
// REGISTER
// ---------------------------
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    const token = signToken(user._id.toString(), user.email);
    res.json({ user, token });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------
// STEP 1 LOGIN → SEND OTP
// ---------------------------------------------------
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    user.otpHash = otpHash;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      user.email,
      "Your CarFinderHub Login Code",
      `
        <div style="font-family:Arial;line-height:1.6">
          <h2>Your OTP Code</h2>
          <p>Use this code to login. It expires in 10 minutes:</p>
          <h1 style="letter-spacing:4px;">${otp}</h1>
          <p>If you didn't request this, ignore the email.</p>
        </div>
      `
    );

    return res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("Login(send OTP) error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------
// STEP 2 LOGIN → VERIFY OTP
// ---------------------------------------------------
export const verifyOtpLogin = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first.",
      });
    }

    if (!user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP not requested or expired" });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      user.otpHash = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "OTP expired" });
    }

    const ok = await bcrypt.compare(otp, user.otpHash);
    if (!ok) return res.status(400).json({ message: "Invalid OTP" });

    user.otpHash = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = signToken(user._id.toString(), user.email);
    return res.json({ user, token });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------
// FORGOT PASSWORD → SEND OTP
// ---------------------------------------------------
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    const otp = generateOtp();
    user.otpHash = await bcrypt.hash(otp, 10);
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      email,
      "Password Reset Code",
      `<h1>Your OTP: ${otp}</h1><p>Valid for 10 minutes.</p>`
    );

    res.json({ message: "OTP sent to your email" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------
// FORGOT PASSWORD → VERIFY OTP
// ---------------------------------------------------
export const verifyForgotOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otpHash) return res.status(400).json({ message: "OTP not requested" });

    const ok = await bcrypt.compare(otp, user.otpHash);
    if (!ok) return res.status(400).json({ message: "Invalid OTP" });

    res.json({ message: "OTP verified" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------------------------------------------
// RESET PASSWORD
// ---------------------------------------------------
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    user.otpHash = null;
    user.otpExpiresAt = null;
    await user.save();

    const token = signToken(user._id.toString(), user.email);

    res.json({ user, token });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
