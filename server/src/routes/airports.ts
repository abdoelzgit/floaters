import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import prisma from "../config/db";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

// 1. Get all airports (Read List)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const airports = await prisma.airport.findMany({
      orderBy: { name: "asc" },
    });
    res.json(airports);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// 2. Get airport by ID (Read Detail)
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid airport ID parameter" });
  return;
}
    const airport = await prisma.airport.findUnique({
      where: { id: BigInt(id) },
    });
    if (!airport) {
      res.status(404).json({ message: "Airport not found" });
      return;
    }
    res.json(airport);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// 3. Create airport (Write, Admin/Staff only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  [
    body("name").notEmpty().withMessage("Airport name is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("iata_code")
      .isLength({ min: 3, max: 5 })
      .withMessage("IATA code must be between 3 and 5 characters"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, city, country, iata_code } = req.body;

    try {
      const airport = await prisma.airport.create({
        data: { name, city, country, iata_code },
      });
      res.status(201).json({ message: "Airport created successfully", airport });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// 4. Update airport (Write, Admin/Staff only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, city, country, iata_code } = req.body;

    try {
      if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid airport ID parameter" });
  return;
}
      const airport = await prisma.airport.update({
        where: { id: BigInt(id) },
        data: { name, city, country, iata_code },
      });
      res.json({ message: "Airport updated successfully", airport });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// 5. Delete airport (Write, Admin/Staff only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid airport ID parameter" });
  return;
}
      await prisma.airport.delete({
        where: { id: BigInt(id) },
      });
      res.json({ message: "Airport deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
