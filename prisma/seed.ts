import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seeding...");

  // 1. Seed Users (with hashed passwords)
  console.log("Seeding Users...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@floaters.com" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@floaters.com",
      password: hashedPassword,
      role: "admin",
      email_verified_at: new Date(),
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@floaters.com" },
    update: {},
    create: {
      name: "Top Level Manager",
      email: "manager@floaters.com",
      password: hashedPassword,
      role: "manager",
      email_verified_at: new Date(),
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@floaters.com" },
    update: {},
    create: {
      name: "Regular Customer",
      email: "customer@floaters.com",
      password: hashedPassword,
      role: "customer",
      email_verified_at: new Date(),
    },
  });

  // 2. Seed Airports
  console.log("Seeding Airports...");
  const cgk = await prisma.airport.create({
    data: {
      name: "Soekarno-Hatta International Airport",
      city: "Jakarta",
      country: "Indonesia",
      iata_code: "CGK",
    },
  });

  const dps = await prisma.airport.create({
    data: {
      name: "Ngurah Rai International Airport",
      city: "Bali",
      country: "Indonesia",
      iata_code: "DPS",
    },
  });

  const sub = await prisma.airport.create({
    data: {
      name: "Juanda International Airport",
      city: "Surabaya",
      country: "Indonesia",
      iata_code: "SUB",
    },
  });

  // 3. Seed Airlines
  console.log("Seeding Airlines...");
  const garuda = await prisma.airline.create({
    data: {
      name: "Garuda Indonesia",
      code: "GA",
      logo: "✈️",
      description: "Maskapai penerbangan nasional Indonesia.",
    },
  });

  const airasia = await prisma.airline.create({
    data: {
      name: "AirAsia",
      code: "QZ",
      logo: "🚀",
      description: "Low-cost carrier terkemuka di Asia.",
    },
  });

  // 4. Seed Airplanes
  console.log("Seeding Airplanes...");
  const boeing = await prisma.airplane.create({
    data: {
      airline_id: garuda.id,
      model: "Boeing 737-800",
      registration_number: "PK-GMH",
      capacity: 30, // Small capacity for easy layout test
      description: "Narrow-body twin-engine jet airliner.",
    },
  });

  const airbus = await prisma.airplane.create({
    data: {
      airline_id: airasia.id,
      model: "Airbus A320-200",
      registration_number: "PK-AXA",
      capacity: 30,
      description: "Short to medium range twin-engine jet airliner.",
    },
  });

  // 5. Seed Seats for Boeing
  console.log("Seeding Seats for Boeing...");
  const seatClasses: Array<"first" | "business" | "economy"> = ["first", "business", "economy"];
  const rows = 5;
  const cols = ["A", "B", "C", "D", "E", "F"];

  for (let r = 1; r <= rows; r++) {
    const seatClass = r === 1 ? "first" : r === 2 ? "business" : "economy";
    for (const c of cols) {
      await prisma.seat.create({
        data: {
          airplane_id: boeing.id,
          seat_number: `${r}${c}`,
          class: seatClass,
        },
      });
      // Seed seats for Airbus too
      await prisma.seat.create({
        data: {
          airplane_id: airbus.id,
          seat_number: `${r}${c}`,
          class: seatClass,
        },
      });
    }
  }

  // 6. Seed Flights
  console.log("Seeding Flights...");
  const flight1 = await prisma.flight.create({
    data: {
      airline_id: garuda.id,
      airplane_id: boeing.id,
      departure_airport_id: cgk.id,
      arrival_airport_id: dps.id,
      flight_number: "GA-204",
      departure_time: new Date("2026-06-10T08:00:00.000Z"),
      arrival_time: new Date("2026-06-10T11:00:00.000Z"),
      price: 1250000,
      available_seats: 30,
    },
  });

  const flight2 = await prisma.flight.create({
    data: {
      airline_id: airasia.id,
      airplane_id: airbus.id,
      departure_airport_id: cgk.id,
      arrival_airport_id: sub.id,
      flight_number: "QZ-751",
      departure_time: new Date("2026-06-10T14:30:00.000Z"),
      arrival_time: new Date("2026-06-10T16:00:00.000Z"),
      price: 750000,
      available_seats: 30,
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
