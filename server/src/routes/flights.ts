import { Router, Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
import prisma from "../config/db";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

// Search / List Flights
router.get(
  "/",
  [
    query("departure_airport_id").optional().isNumeric(),
    query("arrival_airport_id").optional().isNumeric(),
    query("date").optional().isISO8601().withMessage("Date must be in YYYY-MM-DD format"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { departure_airport_id, arrival_airport_id, date } = req.query;

    const whereClause: any = {};

    if (departure_airport_id) {
      whereClause.departure_airport_id = BigInt(departure_airport_id as string);
    }
    if (arrival_airport_id) {
      whereClause.arrival_airport_id = BigInt(arrival_airport_id as string);
    }
    if (date) {
      const searchDate = new Date(date as string);
      const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

      whereClause.departure_time = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    try {
      const flights = await prisma.flight.findMany({
        where: whereClause,
        include: {
          airline: true,
          airplane: true,
          departureAirport: true,
          arrivalAirport: true,
        },
      });

      res.json(flights);
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// Get flight by ID
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const flight = await prisma.flight.findUnique({
      where: { id: BigInt(id) },
      include: {
        airline: true,
        airplane: {
          include: {
            seats: true,
          },
        },
        departureAirport: true,
        arrivalAirport: true,
      },
    });

    if (!flight) {
      res.status(404).json({ message: "Flight not found" });
      return;
    }

    res.json(flight);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Create Flight (Admin/Staff only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  [
    body("airline_id").isNumeric().withMessage("Airline ID must be numeric"),
    body("airplane_id").isNumeric().withMessage("Airplane ID must be numeric"),
    body("departure_airport_id").isNumeric().withMessage("Departure Airport ID must be numeric"),
    body("arrival_airport_id").isNumeric().withMessage("Arrival Airport ID must be numeric"),
    body("flight_number").notEmpty().withMessage("Flight number is required"),
    body("departure_time").isISO8601().withMessage("Valid departure time is required"),
    body("arrival_time").isISO8601().withMessage("Valid arrival time is required"),
    body("price").isDecimal().withMessage("Price must be a decimal value"),
    body("available_seats").isNumeric().withMessage("Available seats must be numeric"),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const {
      airline_id,
      airplane_id,
      departure_airport_id,
      arrival_airport_id,
      flight_number,
      departure_time,
      arrival_time,
      price,
      available_seats,
    } = req.body;

    try {
      const flight = await prisma.flight.create({
        data: {
          airline_id: BigInt(airline_id),
          airplane_id: BigInt(airplane_id),
          departure_airport_id: BigInt(departure_airport_id),
          arrival_airport_id: BigInt(arrival_airport_id),
          flight_number,
          departure_time: new Date(departure_time),
          arrival_time: new Date(arrival_time),
          price,
          available_seats: parseInt(available_seats),
        },
      });

      res.status(201).json({ message: "Flight created successfully", flight });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// Update Flight (Admin/Staff only)
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData: any = {};

    const fields = [
      "airline_id",
      "airplane_id",
      "departure_airport_id",
      "arrival_airport_id",
      "flight_number",
      "departure_time",
      "arrival_time",
      "price",
      "available_seats",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (
          [
            "airline_id",
            "airplane_id",
            "departure_airport_id",
            "arrival_airport_id",
          ].includes(field)
        ) {
          updateData[field] = BigInt(req.body[field]);
        } else if (["departure_time", "arrival_time"].includes(field)) {
          updateData[field] = new Date(req.body[field]);
        } else if (field === "available_seats") {
          updateData[field] = parseInt(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    try {
      const flight = await prisma.flight.update({
        where: { id: BigInt(id) },
        data: updateData,
      });

      res.json({ message: "Flight updated successfully", flight });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// Delete Flight (Admin/Staff only)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("admin", "staff"),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
      await prisma.flight.delete({
        where: { id: BigInt(id) },
      });

      res.json({ message: "Flight deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
