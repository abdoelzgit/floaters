import { Router, Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import prisma from "../config/db";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

// 1. Get seats (Read List, filterable by airplane_id)
router.get(
  "/",
  [query("airplane_id").optional().isNumeric()],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { airplane_id } = req.query;
    const whereClause: any = {};

    if (airplane_id) {
      whereClause.airplane_id = BigInt(airplane_id as string);
    }

    try {
      const seats = await prisma.seat.findMany({
        where: whereClause,
        orderBy: { seat_number: "asc" },
      });
      res.json(seats);
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// 2. Get seat by ID (Read Detail)
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid seat ID parameter" });
  return;
}
    const seat = await prisma.seat.findUnique({
      where: { id: BigInt(id) },
    });
    if (!seat) {
      res.status(404).json({ message: "Seat not found" });
      return;
    }
    res.json(seat);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// 3. Create seat (Write, Admin/Staff only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  [
    body("airplane_id").isNumeric().withMessage("Airplane ID must be numeric"),
    body("seat_number").notEmpty().withMessage("Seat number is required"),
    body("class").isIn(["economy", "business", "first"]).withMessage("Class must be economy, business, or first"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { airplane_id, seat_number, class: seatClass } = req.body;

    try {
      const seat = await prisma.seat.create({
        data: {
          airplane_id: BigInt(airplane_id),
          seat_number,
          class: seatClass,
        },
      });
      res.status(201).json({ message: "Seat created successfully", seat });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// 4. Update seat (Write, Admin/Staff only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { airplane_id, seat_number, class: seatClass } = req.body;
    const updateData: any = {};

    if (airplane_id !== undefined) updateData.airplane_id = BigInt(airplane_id);
    if (seat_number !== undefined) updateData.seat_number = seat_number;
    if (seatClass !== undefined) updateData.class = seatClass;

    try {
      if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid seat ID parameter" });
  return;
}
      const seat = await prisma.seat.update({
        where: { id: BigInt(id) },
        data: updateData,
      });
      res.json({ message: "Seat updated successfully", seat });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// 5. Delete seat (Write, Admin/Staff only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid seat ID parameter" });
  return;
}
      await prisma.seat.delete({
        where: { id: BigInt(id) },
      });
      res.json({ message: "Seat deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
