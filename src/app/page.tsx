import Link from "next/link";

const features = [
  {
    icon: "📊",
    title: "ATS Score Analysis",
    desc: "Instantly score your resume against any job description with AI-powered ATS matching.",
  },
  {
    icon: "🎯",
    title: "Smart Job Matching",
    desc: "AI finds jobs that match your skills, salary expectations, and career goals.",
  },
  {
    icon: "✍️",
    title: "Resume Optimization",
    desc: "One-click resume tailoring with AI rewriting for every job you apply to.",
  },
  {
    icon: "📋",
    title: "Application Tracker",
    desc: "Track every application, interview, and offer in one clean dashboard.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <span className="text-2xl font-bold text-blue-400">JobHunt4U</span>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How It Works</a>
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28">
        <div className="inline-block mb-6 px-4 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm">
          🚀 Launching Soon — Early Access Open
        </div>
        <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
          The AI That <br />
          <span className="text-blue-400">Gets You Hired.</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mb-10 leading-relaxed">
          JobHunt4U is your AI-powered career copilot — from finding the right jobs
          and optimizing your resume to tracking applications and preparing for interviews.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
          >
            Try the Dashboard →
          </Link>
          <a
            href="#features"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 px-8 py-4 rounded-xl text-lg transition-colors"
          >
            See Features
          </a>
        </div>
        <p className="mt-6 text-slate-500 text-sm">Smarter Job Search Starts Here.</p>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Everything You Need to Land the Job</h2>
        <p className="text-slate-400 text-center mb-14">
          One platform. End-to-end AI automation for your entire job search.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500/40 transition-colors"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="px-8 py-20 bg-slate-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-slate-400 mb-14">Three steps to your next offer letter.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Upload Resume", desc: "Upload your resume and let AI parse, score, and understand your profile." },
              { step: "02", title: "Match & Optimize", desc: "Get matched to the best jobs and auto-optimize your resume for each role." },
              { step: "03", title: "Track & Win", desc: "Apply, track every application, and get AI help for interviews and offers." },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center text-blue-400 font-bold mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-24 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to Hunt Smarter?</h2>
        <p className="text-slate-400 mb-8 text-lg">
          Join thousands of professionals using AI to accelerate their career.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-colors"
        >
          Get Started Free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-8 py-6 text-center text-slate-500 text-sm">
        © 2025 JobHunt4U. All rights reserved. · jobhunt4u.com
      </footer>
    </main>
  );
}
