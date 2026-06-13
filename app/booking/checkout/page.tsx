import { Suspense } from "react";
import CheckoutClient from "./CheckoutClient";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

interface PageProps {
  searchParams: Promise<{
    flight_id?: string;
    class?: string;
  }>;
}

function CheckoutFallback() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-6 text-[#1f2933]">
      <div className="mx-auto max-w-6xl">
        <div className="h-12 w-56 animate-pulse rounded bg-slate-200" />
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white" />
          <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white" />
        </div>
      </div>
    </main>
  );
}

async function getFlight(flightId: string) {
  if (!flightId) return { flight: null, error: "Flight ID tidak ditemukan." };

  try {
    const response = await fetch(`${API_BASE_URL}/api/flights/${flightId}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const payload = await response.json();

    if (!response.ok) {
      return { flight: null, error: payload?.message || "Gagal mengambil detail penerbangan." };
    }

    return { flight: payload, error: "" };
  } catch {
    return { flight: null, error: "Gagal terhubung ke API penerbangan." };
  }
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const flightId = params.flight_id || "";
  const cabinClass = params.class || "economy";
  const { flight, error } = await getFlight(flightId);

  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutClient
        flightId={flightId}
        initialClass={cabinClass}
        initialError={error}
        initialFlight={flight}
      />
    </Suspense>
  );
}
