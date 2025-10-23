import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("Car route works!");
});

export default router;