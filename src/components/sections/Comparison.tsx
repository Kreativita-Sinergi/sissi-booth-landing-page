import { comparison } from "@/constants/content";
import { CheckMark, CrossMark } from "../shared/Marks";
import { Section } from "../shared/Section";
import { StickerBox } from "../shared/StickerBox";

export function Comparison() {
  const [what, old, ours] = comparison.columns;
  return (
    <Section tone="white" kicker={comparison.kicker} kickerAccent="yellow" title={comparison.title}>
      <StickerBox className="overflow-hidden">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-line font-label">
              <th scope="col" className="p-4 md:p-6">{what}</th>
              <th scope="col" className="w-20 p-4 text-center text-muted md:w-56 md:p-6">{old}</th>
              <th scope="col" className="w-20 bg-booth-green/35 p-4 text-center md:w-56 md:p-6">{ours}</th>
            </tr>
          </thead>
          <tbody>
            {comparison.rows.map((r) => (
              <tr key={r} className="border-b-2 border-line last:border-0">
                <th scope="row" className="p-4 font-bold md:p-6">{r}</th>
                <td className="p-4 text-center md:p-6">
                  <CrossMark />
                  <span className="sr-only">Tidak</span>
                </td>
                <td className="bg-booth-green/35 p-4 text-center md:p-6">
                  <CheckMark />
                  <span className="sr-only">Ya</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </StickerBox>
      <p className="mt-4 text-sm text-muted">{comparison.note}</p>
    </Section>
  );
}
