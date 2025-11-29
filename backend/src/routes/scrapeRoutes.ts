import { Router } from "express";
import { previewFacebookListing, importFacebookListing } from "../controllers/scrapeController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/facebook/preview", previewFacebookListing);
router.post("/facebook/import", verifyToken, importFacebookListing);

export default router;
