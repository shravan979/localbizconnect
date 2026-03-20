import express from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/signup", async (req: any, res: any) => {
  try {
    const { email, password, name, phone, role, businessName, category, address } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: "Email exists" });
    }

    const user = new User({
      email: cleanEmail,
      password,
      name,
      phone,
      role,
      businessName,
      category,
      address,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email.toLowerCase().trim();
    const user: any = await User.findOne({ email: cleanEmail });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;