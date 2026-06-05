import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

// Import Routes
import authRouter from "./routes/auth";
import flightsRouter from "./routes/flights";
import bookingsRouter from "./routes/bookings";
import paymentsRouter from "./routes/payments";
import dashboardRouter from "./routes/dashboard";
import airportsRouter from "./routes/airports";
import airlinesRouter from "./routes/airlines";
import airplanesRouter from "./routes/airplanes";
import seatsRouter from "./routes/seats";

// Handle BigInt JSON serialization issue
(BigInt.prototype as any).toJSON = function (): string {
  return this.toString();
};

const app: Express = express();

// Standard middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Root welcome endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Floaters API Server" });
});

// API health endpoint
app.use("/api/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Register API routes
app.use("/api/auth", authRouter);
app.use("/api/flights", flightsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/airports", airportsRouter);
app.use("/api/airlines", airlinesRouter);
app.use("/api/airplanes", airplanesRouter);
app.use("/api/seats", seatsRouter);

export default app;
