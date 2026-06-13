"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SeatClass = "economy" | "business" | "first";
type Gender = "male" | "female";

interface Airport {
  city: string;
  country: string;
  iata_code: string;
  name: string;
}

interface Airline {
  code: string;
  logo?: string | null;
  name: string;
}

interface Seat {
  id: string;
  seat_number: string;
  class: SeatClass;
}

interface FlightDetail {
  id: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  price: string | number;
  available_seats: number;
  airline: Airline;
  departureAirport: Airport;
  arrivalAirport: Airport;
  airplane: {
    id: string;
    model: string;
    capacity: number;
    seats: Seat[];
  };
}

interface PassengerDraft {
  full_name: string;
  gender: Gender;
  birth_date: string;
  passport_number: string;
  seat_number: string;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const CLASS_LABELS: Record<SeatClass, string> = {
  economy: "Economy",
  business: "Business",
  first: "First",
};

const CLASS_MULTIPLIERS: Record<SeatClass, number> = {
  economy: 1,
  business: 1.5,
  first: 2,
};

const EMPTY_PASSENGER: PassengerDraft = {
  full_name: "",
  gender: "male",
  birth_date: "",
  passport_number: "",
  seat_number: "",
};

function getAuthToken() {
  if (typeof window === "undefined") return "";

  return (
    window.localStorage.getItem("token") ||
    window.localStorage.getItem("accessToken") ||
    window.localStorage.getItem("authToken") ||
    window.localStorage.getItem("floaters_token") ||
    ""
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getDurationMinutes(start: string, end: string) {
  return Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}j ${mins}m`;
}

function normalizeSeatNumber(seat: Seat) {
  return seat.seat_number.toUpperCase();
}

function extractTakenSeats(message: string) {
  const match = message.match(/Seat\(s\) already taken:\s*(.+)$/i);
  if (!match?.[1]) return [];

  return match[1]
    .split(",")
    .map((seat) => seat.trim().toUpperCase())
    .filter(Boolean);
}

interface CheckoutClientProps {
  flightId: string;
  initialClass: string;
  initialError: string;
  initialFlight: FlightDetail | null;
}

export default function CheckoutClient({
  flightId,
  initialClass,
  initialError,
  initialFlight,
}: CheckoutClientProps) {
  const router = useRouter();
  const selectedClass = initialClass as SeatClass;

  const [flight, setFlight] = useState<FlightDetail | null>(initialFlight);
  const [passengers, setPassengers] = useState<PassengerDraft[]>([{ ...EMPTY_PASSENGER }]);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initialError);
  const [conflictSeats, setConflictSeats] = useState<string[]>([]);

  const cabinClass: SeatClass = ["economy", "business", "first"].includes(selectedClass)
    ? selectedClass
    : "economy";

  async function refreshFlight() {
    if (!flightId) {
      setError("Flight ID tidak ditemukan. Silakan pilih penerbangan dari halaman pencarian.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/api/flights/${flightId}`, {
        headers: { Accept: "application/json" },
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message || "Gagal mengambil detail penerbangan.");
      }

      setFlight(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil detail penerbangan.");
    } finally {
      setLoading(false);
    }
  }

  const baseFare = Number(flight?.price || 0);
  const classFare = Math.round(baseFare * CLASS_MULTIPLIERS[cabinClass]);
  const totalFare = classFare * passengers.length;
  const selectedSeats = passengers.map((passenger) => passenger.seat_number).filter(Boolean);
  const duration = flight ? getDurationMinutes(flight.departure_time, flight.arrival_time) : 0;

  const sortedSeats = useMemo(() => {
    return [...(flight?.airplane.seats || [])].sort((a, b) => {
      const aNumber = normalizeSeatNumber(a);
      const bNumber = normalizeSeatNumber(b);
      return aNumber.localeCompare(bNumber, "en", { numeric: true });
    });
  }, [flight]);

  const classSeats = sortedSeats.filter((seat) => seat.class === cabinClass);

  function updatePassenger(index: number, field: keyof PassengerDraft, value: string) {
    setPassengers((current) =>
      current.map((passenger, passengerIndex) =>
        passengerIndex === index ? { ...passenger, [field]: value } : passenger
      )
    );
  }

  function addPassenger() {
    setPassengers((current) => [...current, { ...EMPTY_PASSENGER }]);
    setActivePassengerIndex(passengers.length);
  }

  function removePassenger(index: number) {
    setPassengers((current) => {
      if (current.length === 1) return current;
      return current.filter((_, passengerIndex) => passengerIndex !== index);
    });
    setActivePassengerIndex((current) => Math.max(0, Math.min(current, passengers.length - 2)));
  }

  function selectSeat(seat: Seat) {
    const seatNumber = normalizeSeatNumber(seat);
    const existingIndex = passengers.findIndex((passenger) => passenger.seat_number === seatNumber);

    if (seat.class !== cabinClass || conflictSeats.includes(seatNumber)) return;

    if (existingIndex >= 0) {
      updatePassenger(existingIndex, "seat_number", "");
      setActivePassengerIndex(existingIndex);
      return;
    }

    const targetIndex =
      passengers[activePassengerIndex]?.seat_number === ""
        ? activePassengerIndex
        : passengers.findIndex((passenger) => !passenger.seat_number);

    updatePassenger(targetIndex >= 0 ? targetIndex : activePassengerIndex, "seat_number", seatNumber);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setConflictSeats([]);

    const token = getAuthToken();
    if (!token) {
      setError("Token login tidak ditemukan. Silakan login dulu, lalu ulangi checkout.");
      return;
    }

    const missingSeat = passengers.some((passenger) => !passenger.seat_number);
    if (missingSeat) {
      setError("Setiap penumpang harus memiliki kursi.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flight_id: flightId,
          passengers,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        const message = payload?.message || "Gagal membuat booking.";
        const takenSeats = extractTakenSeats(message);
        if (takenSeats.length > 0) {
          setConflictSeats(takenSeats);
          setPassengers((current) =>
            current.map((passenger) =>
              takenSeats.includes(passenger.seat_number)
                ? { ...passenger, seat_number: "" }
                : passenger
            )
          );
          await refreshFlight();
        }
        throw new Error(message);
      }

      const bookingId = payload?.booking?.id;
      if (bookingId) {
        router.push(`/bookings/${bookingId}`);
        return;
      }

      setError("Booking berhasil dibuat, tetapi ID booking tidak ditemukan pada response API.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat booking.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
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

  if (!flight) {
    return (
      <main className="min-h-screen bg-[#f6f8fb] px-4 py-6 text-[#1f2933]">
        <div className="mx-auto max-w-3xl rounded-lg border border-rose-200 bg-white p-6">
          <p className="text-sm font-semibold text-rose-700">{error || "Penerbangan tidak ditemukan."}</p>
          <Link href="/flights" className="mt-4 inline-flex text-sm font-semibold text-blue-700">
            Kembali ke pencarian
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-6 text-[#1f2933]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/flights" className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Back to search
            </Link>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Checkout Penerbangan
            </h1>
            <p className="text-sm text-slate-500">
              Lengkapi manifest, pilih kursi, lalu sistem akan mengunci booking sebagai pending.
            </p>
          </div>
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Selected class</p>
            <p className="text-sm font-bold text-slate-950">{CLASS_LABELS[cabinClass]}</p>
          </div>
        </header>

        {error ? (
          <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {flight.airline.name} / {flight.flight_number}
                  </p>
                  <div className="mt-2 flex items-center gap-4">
                    <div>
                      <p className="text-2xl font-bold text-slate-950">
                        {flight.departureAirport.iata_code}
                      </p>
                      <p className="text-xs text-slate-500">{flight.departureAirport.city}</p>
                    </div>
                    <div className="min-w-24 text-center">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Direct</p>
                      <div className="my-1 h-px bg-slate-300" />
                      <p className="text-xs text-slate-500">{formatDuration(duration)}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-950">
                        {flight.arrivalAirport.iata_code}
                      </p>
                      <p className="text-xs text-slate-500">{flight.arrivalAirport.city}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-right md:min-w-72">
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-slate-500">Date</p>
                    <p className="text-sm font-bold">{formatDate(flight.departure_time)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-slate-500">Depart</p>
                    <p className="text-sm font-bold">{formatTime(flight.departure_time)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase text-slate-500">Arrive</p>
                    <p className="text-sm font-bold">{formatTime(flight.arrival_time)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-950">Passenger Manifest</h2>
                  <p className="text-xs text-slate-500">Data harus sesuai identitas resmi penumpang.</p>
                </div>
                <button
                  type="button"
                  onClick={addPassenger}
                  className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Add passenger
                </button>
              </div>

              <div className="divide-y divide-slate-200">
                {passengers.map((passenger, index) => (
                  <div key={index} className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActivePassengerIndex(index)}
                        className={`rounded-md px-3 py-1.5 text-xs font-bold ${
                          activePassengerIndex === index
                            ? "bg-blue-700 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        Passenger {index + 1}
                      </button>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-slate-500">
                          Seat:{" "}
                          <strong className="text-slate-950">
                            {passenger.seat_number || "Not selected"}
                          </strong>
                        </span>
                        {passengers.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removePassenger(index)}
                            className="text-xs font-bold text-rose-700"
                          >
                            Remove
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1">
                        <span className="text-xs font-semibold text-slate-600">Nama lengkap</span>
                        <input
                          value={passenger.full_name}
                          onChange={(event) => updatePassenger(index, "full_name", event.target.value)}
                          required
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          placeholder="Nama sesuai identitas"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-xs font-semibold text-slate-600">NIK / Passport</span>
                        <input
                          value={passenger.passport_number}
                          onChange={(event) => updatePassenger(index, "passport_number", event.target.value)}
                          required
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                          placeholder="Nomor dokumen"
                        />
                      </label>

                      <label className="space-y-1">
                        <span className="text-xs font-semibold text-slate-600">Gender</span>
                        <select
                          value={passenger.gender}
                          onChange={(event) => updatePassenger(index, "gender", event.target.value as Gender)}
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </label>

                      <label className="space-y-1">
                        <span className="text-xs font-semibold text-slate-600">Tanggal lahir</span>
                        <input
                          type="date"
                          value={passenger.birth_date}
                          onChange={(event) => updatePassenger(index, "birth_date", event.target.value)}
                          required
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="text-sm font-bold text-slate-950">Seat Picker</h2>
                <p className="text-xs text-slate-500">
                  Pilih {passengers.length} kursi untuk kelas {CLASS_LABELS[cabinClass]}.
                </p>
              </div>

              <div className="p-4">
                <div className="mb-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-emerald-500" /> Available
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-blue-700" /> Selected
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-slate-200" /> Other class
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-sm bg-rose-500" /> Conflict
                  </span>
                </div>

                <div className="rounded-t-[52px] border border-slate-200 bg-slate-50 px-4 pb-4 pt-7">
                  <div className="mx-auto mb-5 flex h-8 w-32 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Cockpit
                  </div>
                  <div className="mx-auto grid max-w-sm grid-cols-6 gap-2">
                    {sortedSeats.map((seat) => {
                      const seatNumber = normalizeSeatNumber(seat);
                      const isSelected = selectedSeats.includes(seatNumber);
                      const isWrongClass = seat.class !== cabinClass;
                      const isConflict = conflictSeats.includes(seatNumber);
                      const disabled = isWrongClass || isConflict;

                      return (
                        <button
                          key={seat.id}
                          type="button"
                          onClick={() => selectSeat(seat)}
                          disabled={disabled}
                          title={`${seatNumber} / ${CLASS_LABELS[seat.class]}`}
                          className={`h-9 rounded-md text-[11px] font-bold transition ${
                            isConflict
                              ? "cursor-not-allowed bg-rose-500 text-white"
                              : isSelected
                                ? "bg-blue-700 text-white ring-2 ring-blue-200"
                                : isWrongClass
                                  ? "cursor-not-allowed bg-slate-200 text-slate-400"
                                  : "bg-emerald-500 text-white hover:bg-emerald-600"
                          }`}
                        >
                          {seatNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {classSeats.length === 0 ? (
                  <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                    Tidak ada kursi untuk kelas ini pada pesawat yang dipilih.
                  </p>
                ) : null}

                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Catatan: route API saat ini belum mengirim status occupied per kursi. Jika kursi baru saja
                  dipilih orang lain, backend akan menolak booking dan kursi konflik ditandai di sini.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h2 className="text-sm font-bold text-slate-950">Fare Summary</h2>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base fare</span>
                  <span className="font-semibold">{formatCurrency(baseFare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class multiplier</span>
                  <span className="font-semibold">x{CLASS_MULTIPLIERS[cabinClass]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Passengers</span>
                  <span className="font-semibold">{passengers.length}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
                  <span className="font-bold text-slate-950">Estimated total</span>
                  <span className="font-bold text-blue-700">{formatCurrency(totalFare)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || classSeats.length === 0}
                className="mt-4 w-full rounded-md bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? "Creating booking..." : "Create Pending Booking"}
              </button>
              <p className="mt-2 text-center text-[11px] font-medium text-slate-500">
                Booking akan tersimpan sebagai pending sebelum pembayaran.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}
