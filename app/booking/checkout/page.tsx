"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";

interface Seat {
  id: string;
  number: string;
  class: "economy" | "business" | "first";
  isBooked: boolean;
}

const GENERATE_SEATS = (): Seat[] => {
  const seats: Seat[] = [];
  const classes: Array<"first" | "business" | "economy"> = ["first", "business", "economy"];
  const rows = 10;
  const cols = ["A", "B", "C", "D", "E", "F"];

  for (let r = 1; r <= rows; r++) {
    const seatClass = r <= 2 ? "first" : r <= 4 ? "business" : "economy";
    for (const c of cols) {
      // randomly book some seats for demonstration
      const isBooked = Math.random() < 0.25;
      seats.push({
        id: `${r}${c}`,
        number: `${r}${c}`,
        class: seatClass,
        isBooked,
      });
    }
  }
  return seats;
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const flightId = searchParams.get("flight_id") || "1";
  const initialClass = searchParams.get("class") || "economy";

  const [passengerName, setPassengerName] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [gender, setGender] = useState("male");
  const [birthDate, setBirthDate] = useState("");

  const [seats, setSeats] = useState<Seat[]>(GENERATE_SEATS());
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);

  const handleSeatClick = (seat: Seat) => {
    if (seat.isBooked) return;
    setSelectedSeat(seat.number === selectedSeat ? null : seat.number);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeat) {
      alert("Silakan pilih kursi terlebih dahulu!");
      return;
    }
    alert(`Booking created successfully!\nPassenger: ${passengerName}\nSeat: ${selectedSeat}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Passenger Manifest */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              Passenger Manifest
            </h2>
            <p className="text-xs text-slate-400 mb-6">Lengkapi data penumpang sesuai kartu identitas / paspor</p>

            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-700"
                  placeholder="Nama Lengkap Penumpang"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Jenis Kelamin
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-300"
                  >
                    <option value="male">Laki-laki (Male)</option>
                    <option value="female">Perempuan (Female)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Nomor Paspor / NIK
                </label>
                <input
                  type="text"
                  value={passportNumber}
                  onChange={(e) => setPassportNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-700"
                  placeholder="NIK atau Nomor Paspor"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-slate-400">Penerbangan ID</span>
                  <span className="font-bold">#{flightId}</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-sm">
                  <span className="text-slate-400">Kursi Terpilih</span>
                  <span className="font-extrabold text-indigo-400">{selectedSeat || "Belum Dipilih"}</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 px-4 rounded-xl text-sm font-bold tracking-wide shadow-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 cursor-pointer hover:shadow-indigo-500/20 transition-all active:scale-[0.98]"
                >
                  Proses Pembayaran (Checkout)
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column: Seat Picker */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col items-center">
            <h2 className="text-2xl font-bold tracking-tight mb-2 self-start text-indigo-300">
              Interactive Seat Picker
            </h2>
            <p className="text-xs text-slate-400 mb-8 self-start">Pilih kursi Anda dari denah pesawat di bawah ini</p>

            {/* Seat legend */}
            <div className="flex gap-4 mb-6 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-emerald-500"></div>
                <span>Tersedia</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-rose-600"></div>
                <span>Dipesan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded bg-indigo-500"></div>
                <span>Pilihan Anda</span>
              </div>
            </div>

            {/* Aircraft cabin cockpit graphic */}
            <div className="w-full max-w-sm border-t-8 border-indigo-900/60 rounded-t-[100px] bg-slate-950 p-6 flex flex-col items-center border border-slate-800/50">
              <div className="w-24 h-6 bg-slate-900 border border-slate-800 rounded-full mb-8 flex items-center justify-center text-[10px] text-slate-500 uppercase tracking-widest font-black">
                Cockpit
              </div>

              {/* Seat grid */}
              <div className="grid grid-cols-6 gap-2.5 max-w-xs w-full">
                {seats.map((seat, index) => {
                  const isSelected = selectedSeat === seat.number;
                  let colorClass = "bg-emerald-600 hover:bg-emerald-500";
                  if (seat.isBooked) {
                    colorClass = "bg-rose-600 opacity-60 cursor-not-allowed";
                  } else if (isSelected) {
                    colorClass = "bg-indigo-500 ring-2 ring-indigo-400";
                  }

                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.isBooked}
                      className={`h-9 rounded-lg text-[10px] font-black flex items-center justify-center transition-all ${colorClass}`}
                      title={`${seat.number} (${seat.class})`}
                    >
                      {seat.number}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
