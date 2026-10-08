import { Check } from "lucide-react";
import { comparison, type CompareCell } from "@/constants/content";
import { cn } from "../shared/cn";
import { Section } from "../shared/Section";
import { StickerBox } from "../shared/StickerBox";

/** Isi sel: centang kecil bila memang bisa, titik abu-abu bila tidak — tanpa "✗" yang menyerang. */
function Cell({ cell }: { cell: CompareCell }) {
  return (
    <span className="flex items-start gap-2.5">
      {cell.ok ? (
        <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-booth-green">
          <Check aria-hidden className="size-3.5" strokeWidth={4} />
        </span>
      ) : (
        <span aria-hidden className="mt-2 size-2.5 shrink-0 rounded-full bg-muted/50" />
      )}
      <span className={cn("leading-snug", cell.ok ? "font-bold" : "text-muted")}>{cell.text}</span>
    </span>
  );
}

export function Comparison() {
  const { columns, rows } = comparison;
  return (
    <Section tone="white" kicker={comparison.kicker} kickerAccent="yellow" title={comparison.title}>
      {/* Desktop: tabel tiga kolom. */}
      <StickerBox className="hidden overflow-hidden md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-line font-label">
              <td className="w-[28%] p-6" />
              <th scope="col" className="p-6 text-muted">{columns.manual}</th>
              <th scope="col" className="bg-booth-green/35 p-6">{columns.ours}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b-2 border-line last:border-0">
                <th scope="row" className="p-6 font-label">{r.label}</th>
                <td className="p-6"><Cell cell={r.manual} /></td>
                <td className="bg-booth-green/35 p-6"><Cell cell={r.ours} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </StickerBox>

      {/* Mobile: satu kartu per baris, dua kotak berdampingan. */}
      <ul className="flex flex-col gap-4 md:hidden">
        {rows.map((r) => (
          <StickerBox as="li" key={r.label} shadow="sm" className="p-4">
            <p className="mb-3 font-label">{r.label}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border-2 border-line p-3">
                <p className="mb-2 font-label text-xs text-muted uppercase">{columns.manual}</p>
                <Cell cell={r.manual} />
              </div>
              <div className="rounded-xl border-2 border-ink bg-booth-green/35 p-3">
                <p className="mb-2 font-label text-xs uppercase">{columns.ours}</p>
                <Cell cell={r.ours} />
              </div>
            </div>
          </StickerBox>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted">{comparison.note}</p>
    </Section>
  );
}
