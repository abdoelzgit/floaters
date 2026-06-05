"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaChecked, setCaptchaChecked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Logging in with: ${email}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-4 text-white">
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-indigo-500/10">
        <div className="text-center mb-8">
          <span className="text-sm font-semibold tracking-wider uppercase text-indigo-400">Welcome Back</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1 bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
            Sign In to Floaters
          </h2>
          <p className="text-sm text-slate-400 mt-2">Access your tickets and booking details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-slate-600"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-white placeholder-slate-600"
              placeholder="••••••••"
              required
            />
          </div>

          {/* Google reCAPTCHA v2 mock widget */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recaptcha-mock"
                checked={captchaChecked}
                onChange={(e) => setCaptchaChecked(e.target.checked)}
                className="w-5 h-5 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 accent-indigo-500 cursor-pointer"
              />
              <label htmlFor="recaptcha-mock" className="text-xs font-medium text-slate-300 cursor-pointer select-none">
                I'm not a robot
              </label>
            </div>
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase mt-1">reCAPTCHA</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!captchaChecked}
            className={`w-full py-3 px-4 rounded-xl text-sm font-semibold tracking-wide shadow-lg transition-all duration-300 transform ${
              captchaChecked
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 cursor-pointer hover:shadow-indigo-500/20 active:scale-[0.98]"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
