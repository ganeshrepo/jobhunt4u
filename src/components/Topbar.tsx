"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Topbar({
  title,
  userName,
  onMenuClick,
}: {
  title: string;
  userName?: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-950 shrink-0">
      <div className="flex items-center">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden mr-3 text-slate-400 hover:text-white text-xl"
          >
            ☰
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {userName && (
            <p className="text-sm text-slate-500">Good morning, {userName} 👋</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative text-slate-400 hover:text-white transition-colors">
          <span className="text-xl">🔔</span>
        </button>
        <button
          onClick={handleLogout}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
