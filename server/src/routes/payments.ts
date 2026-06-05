import { Router, Request, Response } from "express";
import prisma from "../config/db";

const router = Router();

// Midtrans Webhook Handler
router.post("/webhook", async (req: Request, res: Response): Promise<void> => {
  const { order_id, transaction_status, payment_type } = req.body;

  if (!order_id || !transaction_status) {
    res.status(400).json({ message: "Invalid payload" });
    return;
  }

  // Expecting order_id format: "BOOK-<booking_id>" or "BOOK-<booking_id>-<timestamp>"
  const bookingIdStr = order_id.split("-")[1];
  if (!bookingIdStr) {
    res.status(400).json({ message: "Invalid order_id format" });
    return;
  }

  const bookingId = BigInt(bookingIdStr);

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payments: true },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Determine status
    let paymentStatus: "pending" | "paid" | "failed" = "pending";
    let bookingStatus: "pending" | "confirmed" | "cancelled" = "pending";

    if (["settlement", "capture"].includes(transaction_status)) {
      paymentStatus = "paid";
      bookingStatus = "confirmed";
    } else if (["deny", "cancel", "expire"].includes(transaction_status)) {
      paymentStatus = "failed";
      bookingStatus = "cancelled";
    }

    // Process the status transition in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update Booking status
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: bookingStatus },
      });

      // 2. Update Payment status
      await tx.payment.updateMany({
        where: { booking_id: bookingId },
        data: {
          payment_status: paymentStatus,
          payment_method: payment_type || "Midtrans Snap",
        },
      });

      // 3. Release seats if payment failed/cancelled and previous status was not already cancelled
      if (bookingStatus === "cancelled" && booking.status !== "cancelled") {
        await tx.flight.update({
          where: { id: updatedBooking.flight_id },
          data: {
            available_seats: {
              increment: updatedBooking.total_passengers,
            },
          },
        });
      }
    });

    res.json({ message: "Webhook processed successfully", status: bookingStatus });
  } catch (error: any) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

export default router;
