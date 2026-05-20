"use client";

import {
  RESUME_TEMPLATE_IDS,
  RESUME_TEMPLATE_LABELS,
} from "@/lib/resume-templates";

type TemplateSelectorProps = {
  value: string;
  onChange: (id: string) => void;
};

export default function TemplateSelector({
  value,
  onChange,
}: TemplateSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-medium text-foreground mb-2">Template</h3>
      <div className="flex flex-wrap gap-1.5">
        {RESUME_TEMPLATE_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`px-2.5 py-1 text-xs rounded-md border transition ${
              value === id
                ? "bg-primary border-primary text-primary-foreground"
                : "border-border text-foreground-secondary hover:bg-surface-hover"
            }`}
          >
            {RESUME_TEMPLATE_LABELS[id]}
          </button>
        ))}
      </div>
    </div>
  );
}
