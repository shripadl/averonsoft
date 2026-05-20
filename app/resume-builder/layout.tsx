import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CV / Resume Builder | Averonsoft",
  description:
    "Build a professional resume with multiple templates, PDF export, and certificate text extraction. No AI — your data stays in control.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
