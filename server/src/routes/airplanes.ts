import { Router, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import prisma from "../config/db";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

// 1. Get all airplanes (Read List)
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const airplanes = await prisma.airplane.findMany({
      include: { airline: true },
      orderBy: { model: "asc" },
    });
    res.json(airplanes);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// 2. Get airplane by ID (Read Detail)
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid flight ID parameter" });
  return;
}
    const airplane = await prisma.airplane.findUnique({
      where: { id: BigInt(id) },
      include: { airline: true, seats: true },
    });
    if (!airplane) {
      res.status(404).json({ message: "Airplane not found" });
      return;
    }
    res.json(airplane);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// 3. Create airplane (Write, Admin/Staff only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  [
    body("airline_id").isNumeric().withMessage("Airline ID must be numeric"),
    body("model").notEmpty().withMessage("Model is required"),
    body("registration_number").notEmpty().withMessage("Registration number is required"),
    body("capacity").isNumeric().withMessage("Capacity must be numeric"),
    body("description").optional().isString(),
    body("photos").optional().isString(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { airline_id, model, registration_number, capacity, description, photos } = req.body;

    try {
      const airplane = await prisma.airplane.create({
        data: {
          airline_id: BigInt(airline_id),
          model,
          registration_number,
          capacity: parseInt(capacity),
          description,
          photos,
        },
      });
      res.status(201).json({ message: "Airplane created successfully", airplane });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// 4. Update airplane (Write, Admin/Staff only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: any = {};

    const fields = ["airline_id", "model", "registration_number", "capacity", "description", "photos"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "airline_id") {
          updateData[field] = BigInt(req.body[field]);
        } else if (field === "capacity") {
          updateData[field] = parseInt(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    try {
      if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid airplane ID parameter" });
  return;
}
      const airplane = await prisma.airplane.update({
        where: { id: BigInt(id) },
        data: updateData,
      });
      res.json({ message: "Airplane updated successfully", airplane });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// 5. Delete airplane (Write, Admin/Staff only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid airplane ID parameter" });
  return;
}
      await prisma.airplane.delete({
        where: { id: BigInt(id) },
      });
      res.json({ message: "Airplane deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
