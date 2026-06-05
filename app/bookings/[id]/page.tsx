import React from "react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Render a mock E-ticket representing what the database fetch would return
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8 flex flex-col items-center justify-center">
      {/* Offline capability header indicator */}
      <div className="w-full max-w-2xl bg-indigo-950/40 border border-indigo-900/50 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <span className="flex h-3.5 w-3.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
          <div>
            <h5 className="text-xs font-bold text-slate-200">Tersedia Secara Offline</h5>
            <p className="text-[10px] text-slate-400">E-Ticket ini telah disimpan di penyimpanan lokal perangkat Anda.</p>
          </div>
        </div>
        <span className="text-[10px] bg-indigo-900/50 text-indigo-400 font-extrabold uppercase px-2.5 py-1 rounded-full border border-indigo-800/50">
          PWA Mode
        </span>
      </div>

      {/* Ticket Container */}
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Ticket Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 flex items-center justify-between border-b border-slate-800">
          <div>
            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">Boarding Pass</span>
            <h2 className="text-xl font-black mt-0.5 tracking-tight">Garuda Indonesia</h2>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold block">Booking Code (PNR)</span>
            <span className="text-lg font-black text-indigo-300 tracking-wider">GA98X1</span>
          </div>
        </div>

        {/* Flight Path Details */}
        <div className="p-6 md:p-8 border-b border-dashed border-slate-800 relative">
          {/* Half circles on left & right edge (classic ticket look) */}
          <div className="absolute w-6 h-6 rounded-full bg-slate-950 border border-slate-800 -left-3 top-1/2 transform -translate-y-1/2"></div>
          <div className="absolute w-6 h-6 rounded-full bg-slate-950 border border-slate-800 -right-3 top-1/2 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-3 items-center gap-4 text-center">
            <div className="text-left">
              <span className="text-3xl font-black tracking-tight text-white block">CGK</span>
              <span className="text-xs text-slate-400 font-bold block">Jakarta</span>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Soekarno-Hatta Int'l</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-indigo-400 text-xl font-bold">✈️</span>
              <div className="w-full h-[1px] bg-slate-800 my-1 relative">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">GA-204</span>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black tracking-tight text-white block">DPS</span>
              <span className="text-xs text-slate-400 font-bold block">Bali</span>
              <span className="text-[10px] text-slate-500 font-semibold mt-1 block">Ngurah Rai Int'l</span>
            </div>
          </div>
        </div>

        {/* Schedule & Metadata */}
        <div className="p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 border-b border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Departure Date</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block">10 Jun 2026</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Departure Time</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block">08:00 AM</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Gate</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block">Gate G3</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ticket ID</span>
            <span className="text-sm font-extrabold text-white mt-0.5 block">#{id}</span>
          </div>
        </div>

        {/* Manifest & Seats */}
        <div className="p-6 md:p-8 border-b border-slate-800">
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Passenger Manifest</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 text-xs uppercase font-bold">
                  <th className="pb-3">Passenger Name</th>
                  <th className="pb-3">Document Number</th>
                  <th className="pb-3">Seat Number</th>
                  <th className="pb-3 text-right">Class</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                <tr>
                  <td className="py-3 font-semibold text-white">John Doe</td>
                  <td className="py-3 text-slate-400 font-mono">A1234567</td>
                  <td className="py-3 text-indigo-300 font-extrabold">12A</td>
                  <td className="py-3 text-right text-emerald-400 font-bold">Economy</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Code Boarding Scan */}
        <div className="p-6 md:p-8 bg-slate-950/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">Digital Boarding Pass</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Scan this barcode at the boarding gate check-in point. You can open this page offline to boarding.
            </p>
          </div>
          <div className="bg-white p-3 rounded-2xl flex flex-col items-center">
            {/* Mock QR Code grid */}
            <div className="w-32 h-32 bg-slate-900 rounded-lg flex items-center justify-center text-white text-xs text-center p-2 font-mono">
              [ MOCK QR CODE ]
            </div>
            <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-2">Boarding Scanner</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link href="/flights" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
          ← Back to Flight Search
        </Link>
      </div>
    </div>
  );
}
