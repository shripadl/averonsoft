"use client";

import { useState } from "react";

type FileDropZoneProps = {
  title: string;
  hint: string;
  accept: string;
  loading?: boolean;
  loadingDetail?: string;
  onFile: (file: File) => void;
};

export default function FileDropZone({
  title,
  hint,
  accept,
  loading,
  loadingDetail,
  onFile,
}: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);

  function handle(file: File | undefined) {
    if (file) onFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files[0]);
      }}
      className={`rounded-xl border p-6 text-center transition ${
        dragging
          ? "border-sky-500 bg-sky-500/10"
          : "border-slate-800 bg-slate-900/60"
      }`}
    >
      <p className="text-sm text-slate-300">{title}</p>
      <p className="text-xs text-slate-500 mt-1">{hint}</p>
      <input
        type="file"
        accept={accept}
        onChange={(e) => handle(e.target.files?.[0])}
        className="mt-3 text-xs text-slate-400"
      />
      {loading && (
        <p className="text-xs text-slate-400 mt-2">
          {loadingDetail ?? "Processing…"}
        </p>
      )}
    </div>
  );
}
