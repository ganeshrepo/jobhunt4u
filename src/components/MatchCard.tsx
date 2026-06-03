export default function MatchCard({ score = 92, count = 23 }: { score?: number; count?: number }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-slate-400 text-sm font-medium mb-4">Job Match Score</h2>
      <div className="text-5xl font-bold text-blue-400 mb-1">{score}%</div>
      <p className="text-slate-500 text-sm mb-6">Top match for your profile</p>

      <div className="space-y-2">
        {["Skills", "Experience", "Location", "Salary"].map((label, i) => {
          const pct = [score, score - 8, score - 3, score - 12][i];
          return (
            <div key={label}>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>{label}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">{count} matching jobs found</p>
    </div>
  );
}
