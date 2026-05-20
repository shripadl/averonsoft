"use client";

export type BuilderTab = "resume" | "cover";

type BuilderTabsProps = {
  active: BuilderTab;
  onChange: (tab: BuilderTab) => void;
};

export default function BuilderTabs({ active, onChange }: BuilderTabsProps) {
  const tabs: { id: BuilderTab; label: string }[] = [
    { id: "resume", label: "Resume" },
    { id: "cover", label: "Cover Letter" },
  ];

  return (
    <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900/60 p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 text-sm rounded-md ${
            active === t.id
              ? "bg-sky-500 text-white"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
