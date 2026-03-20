import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import providerRoutes from "./routes/providerRoutes";
import bookingRoutes from "./routes/bookingRoutes";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.error("MongoDB error:", err);
    process.exit(1);
  });

// ✅ IMPORTANT: register routes
app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/booking", bookingRoutes);
// health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});