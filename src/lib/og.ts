import { readFile } from "node:fs/promises";
import { join } from "node:path";

export { brand } from "./brand";

const root = process.cwd();

/** Font untuk ImageResponse (berkas OFL di src/assets/fonts). */
export async function ogFonts() {
  const [bagel, archivo] = await Promise.all([
    readFile(join(root, "src/assets/fonts/BagelFatOne-Regular.ttf")),
    readFile(join(root, "src/assets/fonts/ArchivoBlack-Regular.ttf")),
  ]);
  return [
    { name: "Bagel", data: bagel, weight: 400 as const, style: "normal" as const },
    { name: "Archivo", data: archivo, weight: 400 as const, style: "normal" as const },
  ];
}

/** Gambar di /public sebagai data URL (untuk <img> di ImageResponse). */
export async function publicImage(path: string) {
  const data = await readFile(join(root, "public", path));
  return `data:image/png;base64,${data.toString("base64")}`;
}

