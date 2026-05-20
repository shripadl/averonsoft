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
    <div className="inline-flex rounded-lg border border-border bg-card p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`px-4 py-2 text-sm rounded-md ${
            active === t.id
              ? "bg-primary text-primary-foreground"
              : "text-foreground-secondary hover:bg-surface-hover"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
