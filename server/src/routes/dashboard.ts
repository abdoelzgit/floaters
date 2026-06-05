import { Router, Response } from "express";
import prisma from "../config/db";
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Dashboard Analytics for Manager
router.get(
  "/reports",
  authenticateToken,
  authorizeRoles("manager", "admin"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // 1. Total Revenue (confirmed bookings)
      const totalRevenueResult = await prisma.booking.aggregate({
        where: { status: "confirmed" },
        _sum: { total_price: true },
      });

      const totalRevenue = totalRevenueResult._sum.total_price || 0;

      // 2. Booking Count by Status
      const statusCounts = await prisma.booking.groupBy({
        by: ["status"],
        _count: { id: true },
      });

      // 3. Passenger stats (total passengers flown on confirmed flights)
      const totalPassengersResult = await prisma.booking.aggregate({
        where: { status: "confirmed" },
        _sum: { total_passengers: true },
      });

      const totalPassengers = totalPassengersResult._sum.total_passengers || 0;

      // 4. Top Routes (most booked flights)
      const bookingsWithFlights = await prisma.booking.findMany({
        where: { status: "confirmed" },
        include: {
          flight: {
            include: {
              departureAirport: true,
              arrivalAirport: true,
            },
          },
        },
      });

      // Simple routing aggregator in memory for maximum reliability
      const routeCounts: { [key: string]: { count: number; name: string } } = {};
      bookingsWithFlights.forEach((booking) => {
        const routeKey = `${booking.flight.departureAirport.iata_code} -> ${booking.flight.arrivalAirport.iata_code}`;
        const routeName = `${booking.flight.departureAirport.city} (${booking.flight.departureAirport.iata_code}) to ${booking.flight.arrivalAirport.city} (${booking.flight.arrivalAirport.iata_code})`;

        if (!routeCounts[routeKey]) {
          routeCounts[routeKey] = { count: 0, name: routeName };
        }
        routeCounts[routeKey].count += booking.total_passengers;
      });

      const topRoutes = Object.keys(routeCounts)
        .map((key) => ({
          route: key,
          name: routeCounts[key].name,
          passengersCount: routeCounts[key].count,
        }))
        .sort((a, b) => b.passengersCount - a.passengersCount)
        .slice(0, 5); // get top 5

      // 5. Seat Class occupancy count (Economy vs Business vs First) from passengers
      const passengersWithBookings = await prisma.passenger.findMany({
        where: {
          booking: { status: "confirmed" },
        },
        select: {
          seat_number: true,
          booking: {
            select: {
              flight: {
                select: {
                  airplane_id: true,
                },
              },
            },
          },
        },
      });

      // Group seats by class by fetching corresponding seat details
      const seatClassesCount: { [key: string]: number } = {
        economy: 0,
        business: 0,
        first: 0,
      };

      for (const passenger of passengersWithBookings) {
        const seatDetail = await prisma.seat.findFirst({
          where: {
            airplane_id: passenger.booking.flight.airplane_id,
            seat_number: passenger.seat_number,
          },
        });
        if (seatDetail) {
          const seatClass = seatDetail.class.toLowerCase();
          if (seatClassesCount[seatClass] !== undefined) {
            seatClassesCount[seatClass]++;
          }
        } else {
          // fallback
          seatClassesCount.economy++;
        }
      }

      res.json({
        totalRevenue,
        totalPassengers,
        statusCounts,
        topRoutes,
        seatClassOccupancy: seatClassesCount,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

export default router;
