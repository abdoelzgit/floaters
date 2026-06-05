import { Router, Response } from "express";
import { body, validationResult } from "express-validator";
import prisma from "../config/db";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Get user's bookings
router.get("/", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: { user_id: BigInt(req.user.id) },
      include: {
        flight: {
          include: {
            airline: true,
            departureAirport: true,
            arrivalAirport: true,
          },
        },
        passengers: true,
        payments: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Get booking details by ID
router.get("/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { id } = req.params;

  try {
    if (typeof id !== "string") {
  res.status(400).json({ message: "Invalid booking ID parameter" });
  return;
}
    const booking = await prisma.booking.findUnique({
      where: { id: BigInt(id) },
      include: {
        flight: {
          include: {
            airline: true,
            departureAirport: true,
            arrivalAirport: true,
          },
        },
        passengers: true,
        payments: true,
      },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Security check: only allow the owner or admin/staff to view
    if (booking.user_id !== BigInt(req.user.id) && !["admin", "staff"].includes(req.user.role)) {
      res.status(403).json({ message: "Access forbidden: you do not own this booking" });
      return;
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// Helper function to generate unique booking code (PNR)
function generatePNR(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pnr = "";
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

// Create new booking with transactions to prevent double booking
router.post(
  "/",
  authenticateToken,
  [
    body("flight_id").isNumeric().withMessage("Flight ID is required"),
    body("passengers").isArray({ min: 1 }).withMessage("At least one passenger is required"),
    body("passengers.*.full_name").notEmpty().withMessage("Passenger name is required"),
    body("passengers.*.gender").isIn(["male", "female"]).withMessage("Gender must be male or female"),
    body("passengers.*.birth_date").isISO8601().withMessage("Birth date must be a valid date"),
    body("passengers.*.passport_number").notEmpty().withMessage("Passport/ID number is required"),
    body("passengers.*.seat_number").notEmpty().withMessage("Seat number is required"),
  ],
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { flight_id, passengers } = req.body;
    const userId = BigInt(req.user.id);
    const flightId = BigInt(flight_id);

    try {
      // Execute booking flow in a transaction with Serializable isolation level to prevent concurrency issues
      const result = await prisma.$transaction(
        async (tx) => {
          // 1. Fetch flight with lock (Serializable level ensures transaction safety)
          const flight = await tx.flight.findUnique({
            where: { id: flightId },
          });

          if (!flight) {
            throw new Error("Flight not found");
          }

          if (flight.available_seats < passengers.length) {
            throw new Error("Not enough available seats on this flight");
          }

          // 2. Check if any seat is already booked
          const requestedSeats = passengers.map((p: any) => p.seat_number);

          const occupiedSeats = await tx.passenger.findMany({
            where: {
              seat_number: { in: requestedSeats },
              booking: {
                flight_id: flightId,
                status: { in: ["pending", "confirmed"] },
              },
            },
            select: { seat_number: true },
          });

          if (occupiedSeats.length > 0) {
            const taken = occupiedSeats.map((s) => s.seat_number).join(", ");
            throw new Error(`Seat(s) already taken: ${taken}`);
          }

          // 3. Create booking
          const bookingCode = generatePNR();
          const totalPrice = Number(flight.price) * passengers.length;

          const booking = await tx.booking.create({
            data: {
              user_id: userId,
              flight_id: flightId,
              booking_code: bookingCode,
              total_passengers: passengers.length,
              total_price: totalPrice,
              status: "pending",
            },
          });

          // 4. Create passengers
          await Promise.all(
            passengers.map((p: any) =>
              tx.passenger.create({
                data: {
                  booking_id: booking.id,
                  full_name: p.full_name,
                  gender: p.gender,
                  birth_date: new Date(p.birth_date),
                  passport_number: p.passport_number,
                  seat_number: p.seat_number,
                },
              })
            )
          );

          // 5. Decrement flight capacity
          await tx.flight.update({
            where: { id: flightId },
            data: {
              available_seats: {
                decrement: passengers.length,
              },
            },
          });

          // 6. Create initial payment row
          await tx.payment.create({
            data: {
              booking_id: booking.id,
              payment_method: "Midtrans Snap",
              amount: totalPrice,
              payment_status: "pending",
              transaction_code: "TX-" + bookingCode,
            },
          });

          return booking;
        },
        {
          isolationLevel: "Serializable",
        }
      );

      res.status(201).json({
        message: "Booking created successfully",
        booking: result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  }
);

export default router;
