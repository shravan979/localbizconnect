import { Request, Response } from "express";
import Booking from "../models/Booking";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const {
      providerId,
      serviceTitle,
      description,
      preferredDate,
      urgency,
    } = req.body;

    console.log("BOOKING BODY:", req.body); // debug

    if (!providerId || !serviceTitle || !description) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const booking = await Booking.create({
      customerId: (req as any).user.id,
      providerId,
      serviceTitle,
      description,
      preferredDate,
      urgency,
      status: "pending",
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};