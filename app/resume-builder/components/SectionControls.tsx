"use client";

import {
  RESUME_SECTION_LABELS,
  type ResumeSectionId,
  type SectionLayoutState,
} from "@/lib/resume-sections";

type SectionControlsProps = {
  layout: SectionLayoutState;
  onChange: (layout: SectionLayoutState) => void;
};

export default function SectionControls({
  layout,
  onChange,
}: SectionControlsProps) {
  function toggle(id: ResumeSectionId) {
    onChange({
      ...layout,
      visible: { ...layout.visible, [id]: !layout.visible[id] },
    });
  }

  function onDragStart(e: React.DragEvent, index: number) {
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.effectAllowed = "move";
  }

  function onDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(from) || from === targetIndex) return;
    const order = [...layout.order];
    const [item] = order.splice(from, 1);
    order.splice(targetIndex, 0, item);
    onChange({ ...layout, order });
  }

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold text-foreground mb-1">Sections</h2>
      <p className="text-xs text-muted-foreground mb-3">
        Toggle visibility and drag to reorder in the preview.
      </p>
      <ul className="space-y-2">
        {layout.order.map((id, index) => (
          <li
            key={id}
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, index)}
            className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 cursor-grab active:cursor-grabbing"
          >
            <span className="text-muted-foreground select-none" aria-hidden>
              ⋮⋮
            </span>
            <span className="flex-1 text-sm text-foreground-secondary">
              {RESUME_SECTION_LABELS[id]}
            </span>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={layout.visible[id]}
                onChange={() => toggle(id)}
                className="rounded border-border"
              />
              Show
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
