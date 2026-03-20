import express from "express";
import User from "../models/User";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ GET all providers (PROTECTED)
router.get("/", protect, async (req: any, res) => {
  try {
    const providers = await User.find({ role: "service_provider" }).select(
      "name category phone"
    );

    res.json(providers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch providers" });
  }
});

export default router;