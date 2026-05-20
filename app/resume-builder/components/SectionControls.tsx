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
    <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h2 className="text-sm font-semibold text-slate-200 mb-1">Sections</h2>
      <p className="text-xs text-slate-500 mb-3">
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
            className="flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-950/50 px-3 py-2 cursor-grab active:cursor-grabbing"
          >
            <span className="text-slate-500 select-none" aria-hidden>
              ⋮⋮
            </span>
            <span className="flex-1 text-sm text-slate-300">
              {RESUME_SECTION_LABELS[id]}
            </span>
            <label className="flex items-center gap-1.5 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={layout.visible[id]}
                onChange={() => toggle(id)}
                className="rounded border-slate-600"
              />
              Show
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
