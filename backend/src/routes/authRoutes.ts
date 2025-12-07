import express from "express";
import { 
  login, 
  register, 
  verifyOtpLogin,
  forgotPassword,
  verifyForgotOtp,
  resetPassword
} from "../controllers/authController";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOtpLogin);

// new
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotOtp);
router.post("/reset-password", resetPassword);

export default router;
