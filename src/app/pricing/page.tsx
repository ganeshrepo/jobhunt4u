"use client";

import Link from "next/link";
import { useState } from "react";

const freeTier = [
  "3 AI rewrites per day",
  "1 resume upload",
  "Smart job matching",
  "Application tracker",
  "ATS score analysis",
];

const premiumTier = [
  "Unlimited AI calls",
  "Priority job matching",
  "AI cover letter generation",
  "Interview prep with AI",
  "Skill gap analysis",
  "Email notifications",
  "Priority support",
  "Unlimited resume uploads",
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const monthlyPrice = 9;
  const annualMonthlyPrice = 7.5;
  const annualTotal = 90;

  async function handleUpgrade() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ annual }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800 sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md">
        <Link href="/" className="text-2xl font-bold text-blue-400">
          JobHunt4U
        </Link>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <Link href="/" className="hover:text-white transition-colors hidden sm:block">
            Home
          </Link>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-12">
        <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium">
          Simple, transparent pricing
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Invest in Your Career,
          <br />
          <span className="text-blue-400">Not in Job Boards</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
          Start free. Upgrade when you&apos;re ready to unlock the full power of AI-driven job hunting.
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center gap-4 bg-slate-900 border border-slate-700 rounded-xl p-1.5">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              !annual
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              annual
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Annual
            <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full font-semibold">
              2 months free
            </span>
          </button>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Free</h2>
              <p className="text-slate-400 text-sm">For those just getting started</p>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-1">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-slate-400 mb-2">/month</span>
              </div>
              <p className="text-slate-500 text-sm mt-1">Free forever</p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {freeTier.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href="/login"
              className="block text-center bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-white py-3 rounded-xl font-semibold transition-colors"
            >
              Get Started Free
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-b from-blue-900/40 to-slate-900 border border-blue-500/40 rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-xl shadow-blue-500/10">
            {/* Popular badge */}
            <div className="absolute top-0 right-8 -translate-y-1/2">
              <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                MOST POPULAR
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">Premium</h2>
              <p className="text-slate-400 text-sm">For serious job seekers</p>
            </div>

            <div className="mb-8">
              <div className="flex items-end gap-1">
                <span className="text-5xl font-bold text-white">
                  ${annual ? annualMonthlyPrice : monthlyPrice}
                </span>
                <span className="text-slate-400 mb-2">/month</span>
              </div>
              {annual ? (
                <p className="text-slate-400 text-sm mt-1">
                  Billed annually — ${annualTotal}/year
                  <span className="ml-2 text-green-400 font-medium">Save $18</span>
                </p>
              ) : (
                <p className="text-slate-500 text-sm mt-1">Billed monthly · Cancel anytime</p>
              )}
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {premiumTier.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm text-slate-200">
                  <span className="text-blue-400 flex-shrink-0 font-bold">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            {error && (
              <p className="text-red-400 text-sm mb-3">{error}</p>
            )}

            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-600/30"
            >
              {loading ? "Redirecting to checkout..." : "Upgrade to Premium →"}
            </button>
            <p className="text-slate-500 text-xs text-center mt-3">
              Secure payment via Stripe · Cancel anytime
            </p>
          </div>
        </div>

        {/* FAQ / Reassurance */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🔒",
              title: "Secure Payments",
              desc: "Payments are processed by Stripe — PCI-DSS compliant and industry-leading security.",
            },
            {
              icon: "🔄",
              title: "Cancel Anytime",
              desc: "No lock-in. Cancel your subscription at any time and keep access until the billing period ends.",
            },
            {
              icon: "⚡",
              title: "Instant Access",
              desc: "Premium features unlock immediately after payment. No waiting, no setup.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-center"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-white mb-2 text-sm">{item.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-bold text-lg">JobHunt4U</span>
            <span>— AI Career Copilot</span>
          </div>
          <p>© 2025 JobHunt4U. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <Link href="/login" className="hover:text-slate-300 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
