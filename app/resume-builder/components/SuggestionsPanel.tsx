"use client";

import type { Suggestion } from "@/lib/resume-suggestions";

type SuggestionsPanelProps = {
  suggestions: Suggestion[];
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
  onApproveAll: () => void;
};

const CATEGORY_LABELS: Record<Suggestion["category"], string> = {
  improvement: "Improvements",
  amendment: "From uploaded resume",
  "certificate-gap": "Certificate vs resume",
};

const CATEGORY_STYLES: Record<Suggestion["category"], string> = {
  improvement: "border-amber-700/50 bg-amber-900/20",
  amendment: "border-sky-700/50 bg-sky-900/20",
  "certificate-gap": "border-violet-700/50 bg-violet-900/20",
};

export default function SuggestionsPanel({
  suggestions,
  onApprove,
  onDismiss,
  onApproveAll,
}: SuggestionsPanelProps) {
  if (!suggestions.length) return null;

  const withPatch = suggestions.filter((s) => s.patch);
  const grouped = suggestions.reduce<Record<string, Suggestion[]>>((acc, s) => {
    const key = s.category;
    acc[key] = acc[key] ?? [];
    acc[key].push(s);
    return acc;
  }, {});

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">
            Suggestions ({suggestions.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-based checks only — nothing is changed until you approve.
          </p>
        </div>
        {withPatch.length > 1 && (
          <button
            type="button"
            onClick={onApproveAll}
            className="text-xs px-3 py-1.5 rounded-md bg-sky-600 text-white hover:bg-sky-500"
          >
            Approve all applicable
          </button>
        )}
      </div>

      {(Object.keys(grouped) as Suggestion["category"][]).map((cat) => (
        <div key={cat} className="space-y-2">
          <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            {CATEGORY_LABELS[cat]}
          </h3>
          {grouped[cat].map((s) => (
            <div
              key={s.id}
              className={`rounded-lg border p-3 ${CATEGORY_STYLES[cat]}`}
            >
              <p className="text-sm font-medium text-slate-200">{s.title}</p>
              <p className="text-xs text-slate-400 mt-1">{s.detail}</p>
              <div className="flex gap-2 mt-3">
                {s.patch ? (
                  <button
                    type="button"
                    onClick={() => onApprove(s.id)}
                    className="text-xs px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    Approve
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => onDismiss(s.id)}
                  className="text-xs px-2.5 py-1 rounded border border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
