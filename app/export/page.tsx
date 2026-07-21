import ImportForm from "@/components/ImportForm";

const FORMATS = [
  {
    format: "json",
    label: "JSON",
    description: "Every field, nested — progress logs and quotes included. Best for backups or feeding into another tool.",
  },
  {
    format: "csv",
    label: "CSV",
    description: "One row per book, flattened. Best for opening in a spreadsheet.",
  },
] as const;

export default function ExportPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-10 sm:py-14">
      <div className="mb-10">
        <p className="text-xs font-medium uppercase tracking-widest text-subtle">Your data</p>
        <h1 className="font-display text-4xl italic tracking-tight">Import &amp; Export</h1>
        <p className="mt-2 text-sm text-muted">
          Bring in a library from another app, or download a full copy of your own.
        </p>
      </div>

      <div className="mb-10">
        <ImportForm />
      </div>

      <div className="flex flex-col gap-4">
        {FORMATS.map((f) => (
          <div key={f.format} className="card flex items-center gap-5 p-6">
            <div className="font-data flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-medium text-muted">
              .{f.format}
            </div>
            <div className="flex-1">
              <p className="font-medium">{f.label}</p>
              <p className="mt-0.5 text-sm text-muted">{f.description}</p>
            </div>
            <a
              href={`/api/export?format=${f.format}`}
              className="btn-ribbon shrink-0 rounded-lg px-4 py-2 text-sm font-medium"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
