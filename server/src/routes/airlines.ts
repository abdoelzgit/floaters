import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import prisma from "../config/db";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

// 1. Get all airlines (Read List)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const airlines = await prisma.airline.findMany({
      orderBy: { name: "asc" },
    });
    res.json(airlines);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// 2. Get airline by ID (Read Detail)
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid airline ID parameter" });
  return;
}
    const airline = await prisma.airline.findUnique({
      where: { id: BigInt(id) },
    });
    if (!airline) {
      res.status(404).json({ message: "Airline not found" });
      return;
    }
    res.json(airline);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// 3. Create airline (Write, Admin/Staff only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  [
    body("name").notEmpty().withMessage("Airline name is required"),
    body("code").notEmpty().withMessage("Airline code is required"),
    body("logo").optional().isString(),
    body("description").optional().isString(),
    body("photos").optional().isString(),
  ],  
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, code, logo, description, photos } = req.body;

    try {
      const airline = await prisma.airline.create({
        data: { name, code, logo, description, photos },
      });
      res.status(201).json({ message: "Airline created successfully", airline });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// 4. Update airline (Write, Admin/Staff only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, code, logo, description, photos } = req.body;

    try {
      if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid airline ID parameter" });
  return;
}
      const airline = await prisma.airline.update({
        where: { id: BigInt(id) },
        data: { name, code, logo, description, photos },
      });
      res.json({ message: "Airline updated successfully", airline });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// 5. Delete airline (Write, Admin/Staff only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid airline ID parameter" });
  return;
}
      await prisma.airline.delete({
        where: { id: BigInt(id) },
      });
      res.json({ message: "Airline deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
