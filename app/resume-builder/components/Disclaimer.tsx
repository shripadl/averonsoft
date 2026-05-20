export default function Disclaimer() {
  return (
    <div className="mt-6 rounded-xl border border-yellow-700 bg-yellow-900/30 p-4 text-yellow-200 text-xs">
      <strong className="font-semibold">Privacy Notice:</strong> This tool does{" "}
      <u>not</u> store uploaded documents or use external AI. Files are processed
      in memory only and cleared when you leave. Suggestions use rule-based checks
      — nothing changes until you click <strong>Approve</strong>.
    </div>
  );
}
