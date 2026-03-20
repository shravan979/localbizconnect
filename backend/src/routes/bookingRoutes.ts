import express from "express";
import Booking from "../models/Booking";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Customer creates booking
router.post("/", protect, async (req: any, res) => {
  try {
    const {
      providerId,
      serviceTitle,
      description,
      preferredDate,
      urgency,
    } = req.body;

    if (!providerId || !serviceTitle || !description) {
      return res.status(400).json({
        error: "providerId, serviceTitle and description are required",
      });
    }

    const booking = new Booking({
      customerId: req.userId,
      providerId,
      serviceTitle,
      description,
      preferredDate,
      urgency,
      status: "pending",
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created",
      booking,
    });
  } catch (err) {
    console.error("Create booking error:", err);
    res.status(500).json({ error: "Booking failed" });
  }
});

// Customer sees own bookings
router.get("/customer", protect, async (req: any, res) => {
  try {
    const bookings = await Booking.find({ customerId: req.userId })
      .populate("providerId", "name category phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Fetch customer bookings error:", err);
    res.status(500).json({ error: "Failed to fetch customer bookings" });
  }
});

// Provider sees own bookings
router.get("/provider", protect, async (req: any, res) => {
  try {
    const bookings = await Booking.find({ providerId: req.userId })
      .populate("customerId", "name email phone")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error("Fetch provider bookings error:", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Provider updates booking status
router.patch("/:id", protect, async (req: any, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      providerId: req.userId,
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ error: "Booking already finalized" });
    }

    booking.status = status;
    await booking.save();

    res.json({
      message: "Booking updated",
      booking,
    });
  } catch (err) {
    console.error("Update booking error:", err);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

export default router;