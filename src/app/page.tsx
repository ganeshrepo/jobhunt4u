import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JobHunt4U — AI Career Copilot | ATS Resume Checker & Job Matcher",
  description:
    "JobHunt4U is an AI-powered job hunting platform. Get your ATS resume score in seconds, match with thousands of jobs, generate tailored cover letters, and prepare for interviews — all in one place. Start free today.",
};

const features = [
  {
    icon: "📊",
    title: "ATS Score Analysis",
    desc: "Upload your resume and instantly get an ATS compatibility score with specific improvement suggestions powered by Gemini AI.",
    href: "/dashboard/resume",
    tag: "Most Popular",
  },
  {
    icon: "🎯",
    title: "Smart Job Matching",
    desc: "AI scans thousands of live jobs from multiple sources and ranks them by how well they match your skills, role, and salary expectations.",
    href: "/dashboard/jobs",
    tag: "AI Powered",
  },
  {
    icon: "✍️",
    title: "Resume Optimization",
    desc: "One-click AI rewrite tailors your resume for each specific job — injecting the right keywords and restructuring your achievements to beat ATS filters.",
    href: "/dashboard/resume",
    tag: "Save Hours",
  },
  {
    icon: "📝",
    title: "Cover Letter Generator",
    desc: "Generate a professional, job-specific cover letter in seconds. AI personalises each letter using your resume and the job description.",
    href: "/dashboard/jobs",
    tag: "New",
  },
  {
    icon: "🎤",
    title: "Interview Prep AI",
    desc: "Get 10 tailored interview questions and model answers — Behavioral, Technical, Situational — specific to the role you applied for.",
    href: "/dashboard/interview",
    tag: "Copilot",
  },
  {
    icon: "📋",
    title: "Application Tracker",
    desc: "Track every application, interview date, offer, and rejection in one clean dashboard. Never lose track of a job lead again.",
    href: "/dashboard/tracker",
    tag: "Stay Organised",
  },
];

const stats = [
  { value: "95%", label: "of users improve their ATS score" },
  { value: "3×", label: "more interviews on average" },
  { value: "10s", label: "to score and analyse a resume" },
  { value: "50+", label: "job sources searched simultaneously" },
];

const steps = [
  {
    step: "01",
    title: "Upload Your Resume",
    desc: "PDF or DOCX. Our AI parses it in seconds, scores it against ATS systems, and identifies exactly what's missing.",
  },
  {
    step: "02",
    title: "Match & Optimise",
    desc: "Get matched with jobs that fit your profile. AI rewrites your resume and cover letter for each role in one click.",
  },
  {
    step: "03",
    title: "Apply & Track",
    desc: "Apply with confidence, track every application, and use AI interview prep to walk in ready for any question.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800 sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md">
        <span className="text-2xl font-bold text-blue-400">JobHunt4U</span>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors hidden sm:block">Features</a>
          <a href="#how" className="hover:text-white transition-colors hidden sm:block">How It Works</a>
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-24 md:py-32">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Live — Powered by Google Gemini AI
        </div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
          The AI Copilot That<br />
          <span className="text-blue-400">Gets You Hired.</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          JobHunt4U combines AI resume scoring, smart job matching, cover letter generation,
          and interview preparation into one platform — so you spend less time applying
          and more time getting offers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg shadow-blue-600/20"
          >
            Get Started Free →
          </Link>
          <a
            href="#features"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl text-lg transition-colors"
          >
            See Features
          </a>
        </div>
        <p className="mt-6 text-slate-500 text-sm">No credit card required · Instant access</p>
      </section>

      {/* Stats */}
      <section className="px-8 py-12 border-y border-slate-800 bg-slate-900/30">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-1">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-8 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Everything You Need to Land the Job
        </h2>
        <p className="text-slate-400 text-center mb-4 text-lg">
          One platform. End-to-end AI automation for your entire job search.
        </p>
        <p className="text-slate-500 text-center text-sm mb-14">
          Click any feature below to try it — sign in with Google and land straight there.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Link
              key={f.title}
              href={`/login?next=${encodeURIComponent(f.href)}`}
              className="group bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer block"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{f.icon}</div>
                <span className="text-xs px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full font-medium">
                  {f.tag}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              <div className="mt-4 text-blue-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Try it → Sign in with Google
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="px-8 py-20 bg-slate-900/40 border-y border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-slate-400 mb-14 text-lg">Three steps from upload to offer letter.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.step} className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center text-blue-400 font-bold text-lg mb-5">
                  {s.step}
                </div>
                <h3 className="font-semibold text-xl mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why JobHunt4U */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">Why JobHunt4U?</h2>
        <p className="text-slate-400 text-center mb-14">
          Built for serious job seekers who want an edge with AI.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "Real Jobs from Multiple Sources",
              desc: "We search JSearch, Adzuna, Remotive, and more simultaneously — so you see more relevant listings in one place.",
            },
            {
              title: "ATS-Optimised, Not Generic",
              desc: "Every resume rewrite is tailored to the specific job description, not a generic template. Beat real ATS systems used by top companies.",
            },
            {
              title: "AI That Knows Your Resume",
              desc: "Upload once. Every feature — job matching, resume rewriting, cover letters, interview prep — is personalised to your actual background.",
            },
            {
              title: "Skill Gap Insights",
              desc: "See exactly which skills are missing for your target role and where to learn them — so you can invest your time in the right areas.",
            },
          ].map((item) => (
            <div key={item.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-8 py-24 text-center bg-gradient-to-b from-transparent to-blue-950/20">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Start Your Smarter Job Search Today
        </h2>
        <p className="text-slate-400 mb-8 text-lg max-w-xl mx-auto">
          Join professionals using AI to cut job search time in half and land more interviews.
        </p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-colors shadow-xl shadow-blue-600/20"
        >
          Get Started Free →
        </Link>
        <p className="mt-4 text-slate-500 text-sm">Sign in with Google · No setup required</p>
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
            <Link href="/login" className="hover:text-slate-300 transition-colors">Login</Link>
            <a href="#features" className="hover:text-slate-300 transition-colors">Features</a>
            <a href="#how" className="hover:text-slate-300 transition-colors">How It Works</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
