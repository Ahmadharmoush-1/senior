import { Router } from "express";
import { scrapeFacebook } from "../controllers/facebookController";

const router = Router();

router.post("/scrape-facebook", scrapeFacebook);

export default router;
