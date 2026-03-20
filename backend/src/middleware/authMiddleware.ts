import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    );

    req.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};