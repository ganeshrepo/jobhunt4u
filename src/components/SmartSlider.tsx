"use client";

import { useState } from "react";

export default function SmartSlider() {
  const [value, setValue] = useState(18);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-slate-400 text-sm font-medium mb-4">Target Salary</h2>
      <div className="text-4xl font-bold text-white mb-1">
        ₹ {value} <span className="text-2xl text-slate-400">LPA</span>
      </div>
      <p className="text-xs text-slate-500 mb-6">Adjust to filter job matches</p>

      <input
        type="range"
        min="5"
        max="80"
        step="1"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-blue-500 cursor-pointer"
      />

      <div className="flex justify-between text-xs text-slate-500 mt-2">
        <span>₹5 LPA</span>
        <span>₹80 LPA</span>
      </div>

      <button className="mt-5 w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-xl py-2 text-sm transition-colors">
        Find Jobs in this Range
      </button>
    </div>
  );
}
