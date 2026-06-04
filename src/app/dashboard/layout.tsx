"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import OnboardingModal from "@/components/OnboardingModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const res = await fetch("/api/profile");
        if (!res.ok) return;
        const data = await res.json();
        const profile = data?.profile;
        if (profile && profile.onboarding_completed === false) {
          setShowOnboarding(true);
        }
      } catch {
        // silently ignore — don't block the dashboard
      } finally {
        setProfileLoaded(true);
      }
    }
    checkOnboarding();
  }, []);

  async function handleOnboardingComplete() {
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_completed: true }),
      });
    } catch {
      // ignore
    }
    setShowOnboarding(false);
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      {/* Mobile hamburger - only shown on mobile */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-slate-800 border border-slate-700 p-2 rounded-lg text-white"
      >
        ☰
      </button>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {children}
      </div>
      {profileLoaded && showOnboarding && (
        <OnboardingModal onComplete={handleOnboardingComplete} />
      )}
    </div>
  );
}
