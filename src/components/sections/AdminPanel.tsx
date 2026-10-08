import { admin } from "@/constants/content";
import { LaptopMockup } from "../shared/Devices";
import { CheckMark } from "../shared/Marks";
import { Section } from "../shared/Section";
import { StarSticker } from "../shared/Stickers";

export function AdminPanel() {
  return (
    <Section kicker={admin.kicker} title={admin.title} align="left">
      <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <ul className="flex flex-col gap-4">
          {admin.points.map((p) => (
            <li key={p} className="flex items-center gap-4 text-lg font-bold">
              <CheckMark />
              {p}
            </li>
          ))}
        </ul>
        <div className="relative">
          <LaptopMockup src={admin.image} alt="Panel admin Sissi Booth: pengaturan sesi & mode" />
          <StarSticker accent="pink" className="absolute -right-2 -top-8 size-20" />
        </div>
      </div>
    </Section>
  );
}
