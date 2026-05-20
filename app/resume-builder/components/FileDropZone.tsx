"use client";

import { useId, useRef, useState } from "react";

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
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function handle(file: File | undefined) {
    if (!file) return;
    setFileName(file.name);
    onFile(file);
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
        const file = e.dataTransfer.files[0];
        handle(file);
      }}
      className={`rounded-xl border p-6 text-center transition ${
        dragging
          ? "border-primary bg-primary/10"
          : "border-border bg-card"
      }`}
    >
      <p className="text-sm text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="btn shrink-0"
        >
          Choose file
        </button>
        <span className="text-sm text-muted-foreground">
          {fileName ?? "No file chosen"}
        </span>
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          handle(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {loading && (
        <p className="text-xs text-muted-foreground mt-3">
          {loadingDetail ?? "Processing…"}
        </p>
      )}
    </div>
  );
}
