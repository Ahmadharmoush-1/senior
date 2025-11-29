import express from "express";
import passport from "passport";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    res.redirect(
      `http://localhost:8081/google-callback?user=${encodeURIComponent(
        JSON.stringify(user)
      )}`
    );
  }
);

export default router;
