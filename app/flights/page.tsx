"use client";

import React, { useState } from "react";
import Link from "next/link";

interface MockFlight {
  id: string;
  flight_number: string;
  airline: { name: string; code: string; logo: string };
  departureAirport: { city: string; iata_code: string };
  arrivalAirport: { city: string; iata_code: string };
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
}

const MOCK_FLIGHTS: MockFlight[] = [
  {
    id: "1",
    flight_number: "GA-204",
    airline: { name: "Garuda Indonesia", code: "GA", logo: "✈️" },
    departureAirport: { city: "Jakarta", iata_code: "CGK" },
    arrivalAirport: { city: "Bali", iata_code: "DPS" },
    departure_time: "2026-06-10T08:00:00Z",
    arrival_time: "2026-06-10T11:00:00Z",
    price: 1250000,
    available_seats: 45,
  },
  {
    id: "2",
    flight_number: "QZ-751",
    airline: { name: "AirAsia", code: "QZ", logo: "🚀" },
    departureAirport: { city: "Jakarta", iata_code: "CGK" },
    arrivalAirport: { city: "Surabaya", iata_code: "SUB" },
    departure_time: "2026-06-10T14:30:00Z",
    arrival_time: "2026-06-10T16:00:00Z",
    price: 750000,
    available_seats: 12,
  },
];

export default function FlightsSearchPage() {
  const [fromCity, setFromCity] = useState("CGK");
  const [toCity, setToCity] = useState("DPS");
  const [date, setDate] = useState("2026-06-10");
  const [cabinClass, setCabinClass] = useState("economy");

  const [flights] = useState<MockFlight[]>(MOCK_FLIGHTS);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-wider text-indigo-400">
            FLOATERS
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Panel */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl mb-8">
          <h2 className="text-xl font-bold mb-6 text-indigo-300">Search Jadwal Penerbangan</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Origin</label>
              <select
                value={fromCity}
                onChange={(e) => setFromCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
              >
                <option value="CGK">Jakarta (CGK)</option>
                <option value="SUB">Surabaya (SUB)</option>
                <option value="DPS">Bali (DPS)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Destination</label>
              <select
                value={toCity}
                onChange={(e) => setToCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
              >
                <option value="DPS">Bali (DPS)</option>
                <option value="CGK">Jakarta (CGK)</option>
                <option value="SUB">Surabaya (SUB)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Departure Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2 font-semibold">Cabin Class</label>
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 transition-colors text-white"
              >
                <option value="economy">Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="space-y-4">
          <h3 className="text-lg font-bold text-slate-300">Hasil Pencarian ({flights.length} Penerbangan)</h3>

          {flights.map((flight) => (
            <div
              key={flight.id}
              className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-500/40 transition-all duration-300 shadow-md hover:shadow-indigo-500/5"
            >
              {/* Airline details */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-950/40 border border-indigo-900 flex items-center justify-center text-2xl shadow-inner">
                  {flight.airline.logo}
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">{flight.airline.name}</h4>
                  <span className="text-xs text-indigo-400 font-semibold">{flight.flight_number}</span>
                </div>
              </div>

              {/* Path & Times */}
              <div className="flex items-center gap-8 justify-between md:justify-start">
                <div className="text-center md:text-left">
                  <span className="block text-xl font-extrabold tracking-tight text-white">
                    {new Date(flight.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-slate-400 font-bold tracking-wider">{flight.departureAirport.iata_code}</span>
                </div>

                <div className="flex flex-col items-center gap-1 px-4">
                  <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-extrabold">Direct</span>
                  <div className="w-24 h-[2px] bg-indigo-900 relative">
                    <div className="w-2 h-2 rounded-full bg-indigo-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">3h 0m</span>
                </div>

                <div className="text-center md:text-left">
                  <span className="block text-xl font-extrabold tracking-tight text-white">
                    {new Date(flight.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-slate-400 font-bold tracking-wider">{flight.arrivalAirport.iata_code}</span>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
                <div className="text-left md:text-right">
                  <span className="block text-xs text-slate-400 font-semibold">Harga mulai dari</span>
                  <span className="text-xl font-extrabold text-indigo-300">
                    IDR {flight.price.toLocaleString("id-ID")}
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-semibold">{flight.available_seats} kursi tersisa</span>
                </div>
                <Link
                  href={`/booking/checkout?flight_id=${flight.id}&class=${cabinClass}`}
                  className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  Pilih Penerbangan
                </Link>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
