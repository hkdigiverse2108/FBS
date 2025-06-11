import { Router } from "express";
import { getPlatformFees } from "../controllers/platformFee";

const router = Router();

router.get("/", getPlatformFees);

export default router; 