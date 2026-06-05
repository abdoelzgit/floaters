"use client";

import React, { useState } from "react";

interface Flight {
  id: string;
  flight_number: string;
  price: number;
  available_seats: number;
}

const INITIAL_FLIGHTS: Flight[] = [
  { id: "1", flight_number: "GA-204", price: 1250000, available_seats: 45 },
  { id: "2", flight_number: "QZ-751", price: 750000, available_seats: 12 },
];

export default function AdminDashboardPage() {
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS);
  const [flightNumber, setFlightNumber] = useState("");
  const [price, setPrice] = useState("");
  const [seats, setSeats] = useState("");

  const handleAddFlight = (e: React.FormEvent) => {
    e.preventDefault();
    const newFlight: Flight = {
      id: (flights.length + 1).toString(),
      flight_number: flightNumber,
      price: parseFloat(price),
      available_seats: parseInt(seats),
    };
    setFlights([...flights, newFlight]);
    setFlightNumber("");
    setPrice("");
    setSeats("");
  };

  const handleDeleteFlight = (id: string) => {
    setFlights(flights.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8">
      {/* Header banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 mb-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">Admin Control Panel</span>
          <h1 className="text-3xl font-extrabold mt-1">Master Data Management</h1>
          <p className="text-sm text-slate-400 mt-1">Manage airports, airlines, airplanes, seats, and schedules</p>
        </div>
        <div className="flex gap-2">
          <span className="bg-indigo-900/50 border border-indigo-800 text-indigo-300 text-xs font-semibold px-4 py-2 rounded-full">
            Role: Administrator
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Add new Flight */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-indigo-300">Buat Jadwal Baru</h2>

            <form onSubmit={handleAddFlight} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Nomor Penerbangan
                </label>
                <input
                  type="text"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white"
                  placeholder="Contoh: GA-204"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Harga Tiket (IDR)
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white"
                  placeholder="1200000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Kapasitas Kursi
                </label>
                <input
                  type="number"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white"
                  placeholder="180"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-indigo-600/10"
              >
                Simpan Schedule
              </button>
            </form>
          </div>
        </div>

        {/* Right column: CRUD Table list */}
        <div className="lg:col-span-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden">
            <h2 className="text-xl font-bold mb-4 text-indigo-300">Daftar Penerbangan Aktif</h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800 text-xs uppercase font-bold">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">No. Penerbangan</th>
                    <th className="pb-3">Harga</th>
                    <th className="pb-3">Kursi Tersedia</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {flights.map((flight) => (
                    <tr key={flight.id} className="hover:bg-slate-950/30">
                      <td className="py-4 font-mono text-xs text-slate-500">#{flight.id}</td>
                      <td className="py-4 font-bold text-white">{flight.flight_number}</td>
                      <td className="py-4 text-indigo-400 font-bold">IDR {flight.price.toLocaleString("id-ID")}</td>
                      <td className="py-4 text-slate-300 font-semibold">{flight.available_seats} Kursi</td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteFlight(flight.id)}
                          className="text-xs bg-rose-950/40 text-rose-400 border border-rose-900/60 hover:bg-rose-900/50 hover:text-white px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}

                  {flights.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-600 font-semibold">
                        Belum ada jadwal penerbangan aktif.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
