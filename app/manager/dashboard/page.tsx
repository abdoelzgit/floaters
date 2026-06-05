"use client";

import React from "react";

export default function ManagerDashboardPage() {
  const handleExportPDF = () => {
    alert("Ekspor PDF Laporan Penjualan Tiket sedang diproses...");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8">
      {/* Header banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 mb-8 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-widest">Executive Dashboard</span>
          <h1 className="text-3xl font-extrabold mt-1">Laporan & Analitik Manajemen</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time revenue tracking, route popularity, and seat occupancy</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          Ekspor Laporan (PDF)
        </button>
      </div>

      {/* Analytical Cards widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <span className="text-xs text-slate-500 uppercase tracking-widest font-black block">Total Pendapatan</span>
          <span className="text-3xl font-black text-indigo-300 tracking-tight mt-2 block">IDR 45.280.000</span>
          <span className="text-[10px] text-emerald-400 font-bold block mt-1">↑ 12.4% vs bulan lalu</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <span className="text-xs text-slate-500 uppercase tracking-widest font-black block">Total Tiket Terjual</span>
          <span className="text-3xl font-black text-indigo-300 tracking-tight mt-2 block">128 Tiket</span>
          <span className="text-[10px] text-indigo-400 font-bold block mt-1">Confirmed & Terbayar</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <span className="text-xs text-slate-500 uppercase tracking-widest font-black block">Occupancy Rate Rata-rata</span>
          <span className="text-3xl font-black text-indigo-300 tracking-tight mt-2 block">76.8%</span>
          <span className="text-[10px] text-emerald-400 font-bold block mt-1">Target okupansi tercapai</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left widget: Visual Sales Trend chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-indigo-300">Tren Penjualan Bulanan (2026)</h2>

          {/* Bar Chart representation using Tailwind */}
          <div className="h-64 flex items-end gap-4 px-4 border-b border-l border-slate-800/80 pb-2 pt-6">
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-indigo-950 border border-indigo-900/60 rounded-t-lg h-24 relative hover:bg-indigo-900/50 transition-colors">
                <span className="text-[9px] absolute -top-5 left-1/2 transform -translate-x-1/2 text-slate-400 font-bold">12M</span>
              </div>
              <span className="text-xs text-slate-500 font-semibold uppercase">Mar</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-indigo-850 border border-indigo-700/60 rounded-t-lg h-36 relative hover:bg-indigo-700/50 transition-colors">
                <span className="text-[9px] absolute -top-5 left-1/2 transform -translate-x-1/2 text-slate-400 font-bold">18M</span>
              </div>
              <span className="text-xs text-slate-500 font-semibold uppercase">Apr</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-indigo-750 border border-indigo-500/60 rounded-t-lg h-44 relative hover:bg-indigo-500/50 transition-colors">
                <span className="text-[9px] absolute -top-5 left-1/2 transform -translate-x-1/2 text-slate-400 font-bold">22M</span>
              </div>
              <span className="text-xs text-slate-500 font-semibold uppercase">May</span>
            </div>
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gradient-to-t from-indigo-600 to-blue-500 rounded-t-lg h-56 relative hover:brightness-110 transition-all">
                <span className="text-[9px] absolute -top-5 left-1/2 transform -translate-x-1/2 text-indigo-400 font-bold">45M</span>
              </div>
              <span className="text-xs text-indigo-400 font-bold uppercase">Jun</span>
            </div>
          </div>
        </div>

        {/* Right widget: Top destination routes table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-xl font-bold mb-6 text-indigo-300">Rute Penerbangan Terpopuler</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm">Jakarta (CGK) → Bali (DPS)</h4>
                <span className="text-xs text-slate-500">Rute favorit musim liburan</span>
              </div>
              <span className="bg-indigo-950 border border-indigo-900/60 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full">
                84 Penumpang
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <div>
                <h4 className="font-bold text-white text-sm">Jakarta (CGK) → Surabaya (SUB)</h4>
                <span className="text-xs text-slate-500">Rute bisnis & operasional</span>
              </div>
              <span className="bg-indigo-950 border border-indigo-900/60 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full">
                44 Penumpang
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
