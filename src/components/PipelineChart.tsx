"use client";

interface PipelineChartProps {
  applications: { status: string }[];
}

const PIPELINE_STAGES = [
  { key: "Applied", label: "Applied", color: "bg-blue-500", text: "text-blue-400" },
  { key: "Interview", label: "Interview", color: "bg-green-500", text: "text-green-400" },
  { key: "Offer", label: "Offer", color: "bg-purple-500", text: "text-purple-400" },
  { key: "Rejected", label: "Rejected", color: "bg-red-500", text: "text-red-400" },
];

export default function PipelineChart({ applications }: PipelineChartProps) {
  const counts = PIPELINE_STAGES.reduce<Record<string, number>>((acc, stage) => {
    acc[stage.key] = applications.filter((a) => a.status === stage.key).length;
    return acc;
  }, {});

  const total = applications.length;
  const maxCount = Math.max(...Object.values(counts), 1);

  if (total === 0) {
    return (
      <p className="text-slate-500 text-sm text-center py-4">
        No applications yet — start applying!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {PIPELINE_STAGES.map((stage) => {
        const count = counts[stage.key] || 0;
        const widthPct = Math.round((count / maxCount) * 100);
        return (
          <div key={stage.key} className="flex items-center gap-3">
            <span className={`text-xs font-medium w-16 shrink-0 ${stage.text}`}>
              {stage.label}
            </span>
            <div className="flex-1 bg-slate-800 rounded-full h-5 overflow-hidden">
              <div
                className={`h-full ${stage.color} rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
                style={{ width: count === 0 ? "0%" : `${Math.max(widthPct, 8)}%` }}
              >
                {count > 0 && (
                  <span className="text-white text-xs font-bold">{count}</span>
                )}
              </div>
            </div>
            {count === 0 && (
              <span className="text-slate-600 text-xs w-4">0</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
