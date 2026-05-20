"use client";

import type { CoverLetterData } from "@/lib/cover-letter";

type CoverLetterFormProps = {
  data: CoverLetterData;
  onChange: (data: CoverLetterData) => void;
};

export default function CoverLetterForm({
  data,
  onChange,
}: CoverLetterFormProps) {
  function update<K extends keyof CoverLetterData>(
    key: K,
    value: CoverLetterData[K]
  ) {
    onChange({ ...data, [key]: value });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">
          Role applied for
        </h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            className="input md:col-span-2"
            placeholder="Role applied for *"
            value={data.roleAppliedFor}
            onChange={(e) => update("roleAppliedFor", e.target.value)}
          />
          <input
            className="input"
            placeholder="Company name"
            value={data.companyName ?? ""}
            onChange={(e) => update("companyName", e.target.value)}
          />
          <input
            className="input"
            placeholder="Hiring manager (optional)"
            value={data.hiringManager ?? ""}
            onChange={(e) => update("hiringManager", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Your details</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input
            className="input"
            placeholder="Your name"
            value={data.applicantName}
            onChange={(e) => update("applicantName", e.target.value)}
          />
          <input
            className="input"
            placeholder="Date"
            value={data.date}
            onChange={(e) => update("date", e.target.value)}
          />
          <input
            className="input"
            placeholder="Email"
            value={data.applicantEmail}
            onChange={(e) => update("applicantEmail", e.target.value)}
          />
          <input
            className="input"
            placeholder="Phone"
            value={data.applicantPhone}
            onChange={(e) => update("applicantPhone", e.target.value)}
          />
          <input
            className="input md:col-span-2"
            placeholder="Address / location"
            value={data.applicantAddress ?? ""}
            onChange={(e) => update("applicantAddress", e.target.value)}
          />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground mb-3">Letter body</h2>
        <textarea
          className="textarea min-h-[220px]"
          placeholder="Cover letter content"
          value={data.body}
          onChange={(e) => update("body", e.target.value)}
        />
      </section>
    </div>
  );
}
