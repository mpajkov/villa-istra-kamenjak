/**
 * Image pipeline for Villa Istra Kamenjak
 * ---------------------------------------
 * Turns the original photos into small, responsive WebP files
 * (640 / 1024 / 1600 px wide, hero also 1920 px) and strips all metadata
 * (EXIF, GPS location, camera data).
 *
 * Usage (needs Node 18+):
 *   npm install                                   (once, installs "sharp")
 *   npm run images -- <folder-with-original-photos>
 *
 * The folder must contain: barok/ mali/ pavel/ vrt/ site/  (see PHOTOS below).
 * Output goes to assets/img/<group>/<name>-<width>.webp
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = path.resolve(process.argv[2] || "source-images");
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "assets", "img");

const WIDTHS = [640, 1024, 1600];
const HERO_WIDTHS = [800, 1280, 1920];

/** [output group, output name, source file relative to SRC, widths] */
const PHOTOS = [
  // hero + home page
  ["site", "villa", "site/villa.jpg", HERO_WIDTHS],
  ["site", "biking", "site/bicikle.jpg", WIDTHS],
  ["site", "bay", "site/plaza.jpg", WIDTHS],
  ["site", "garden-night", "site/vrtnoc.jpg", WIDTHS],
  // Pavlov's Room
  ["pavel", "pavel-01-room", "pavel/gabi-app-27.jpg"],
  ["pavel", "pavel-02-room-tv", "pavel/gabi-app-28.jpg"],
  ["pavel", "pavel-03-bathroom", "pavel/gabi-app-26.jpg"],
  // Small Apartment
  ["mali", "mali-01-bedroom", "mali/appp-05.jpg"],
  ["mali", "mali-02-bedroom-window", "mali/appp-07.jpg"],
  ["mali", "mali-03-bedroom-tv", "mali/appp-06.jpg"],
  ["mali", "mali-04-bathroom-door", "mali/appp-03.jpg"],
  ["mali", "mali-05-bathroom", "mali/appp-04.jpg"],
  // Barok
  ["barok", "barok-01-living-room", "barok/appp-15.jpg"],
  ["barok", "barok-02-fireplace", "barok/appp-14.jpg"],
  ["barok", "barok-03-sofa", "barok/appp-13.jpg"],
  ["barok", "barok-04-sea-view", "barok/appp-16.jpg"],
  ["barok", "barok-05-kitchen", "barok/appp-17.jpg"],
  ["barok", "barok-06-kitchen-sink", "barok/appp-20.jpg"],
  ["barok", "barok-07-kitchen-hob", "barok/appp-19.jpg"],
  ["barok", "barok-08-living-to-bedroom", "barok/appp-11.jpg"],
  ["barok", "barok-09-bedroom", "barok/appp-10.jpg"],
  ["barok", "barok-10-bedroom-window", "barok/appp-08.jpg"],
  ["barok", "barok-11-bedroom-wardrobe", "barok/appp-09.jpg"],
  ["barok", "barok-12-bathroom", "barok/appp-12.jpg"],
  ["barok", "barok-13-entrance-hall", "barok/appp-02.jpg"],
  // Garden
  ["garden", "garden-01-stone-table", "vrt/gabi-app-38.jpg"],
  ["garden", "garden-02-lawn", "vrt/gabi-app-3.jpg"],
  ["garden", "garden-03-brick-path", "vrt/gabi-app-6.jpg"],
  ["garden", "garden-04-gazebo", "vrt/gabi-app-40.jpg"],
  ["garden", "garden-05-covered-terrace", "vrt/gabi-app-5.jpg"],
  ["garden", "garden-06-lounge-terrace", "vrt/gabi-app-4.jpg"],
  ["garden", "garden-07-stone-barbecue", "vrt/gabi-app-37.jpg"],
  ["garden", "garden-08-stone-path", "vrt/gabi-app-7.jpg"],
  ["garden", "garden-09-courtyard", "vrt/gabi-app-24.jpg"],
  ["garden", "garden-10-flowers", "vrt/gabi-app-41.jpg"],
  ["garden", "garden-11-canopy-corner", "vrt/gabi-app-9.jpg"],
  ["garden", "garden-12-street-view", "vrt/gabi-app-2.jpg"],
];

let totalBytes = 0, files = 0;
for (const [group, name, rel, widths = WIDTHS] of PHOTOS) {
  const input = path.join(SRC, rel);
  if (!fs.existsSync(input)) { console.error("MISSING:", input); process.exitCode = 1; continue; }
  const meta = await sharp(input).metadata();
  fs.mkdirSync(path.join(OUT, group), { recursive: true });
  // never upscale: a 1360 px photo gets 640 / 1024 / 1360 px versions, named by their real width
  const sizes = [...new Set(widths.map((w) => Math.min(w, meta.width)))];
  for (const width of sizes) {
    const dest = path.join(OUT, group, `${name}-${width}.webp`);
    await sharp(input)
      .rotate()                                   // respect camera orientation, then drop EXIF
      .resize({ width, withoutEnlargement: true, kernel: "lanczos3" })
      .webp({ quality: width >= 1900 ? 66 : width >= 1300 ? 72 : 76, effort: 6, smartSubsample: true })
      .toFile(dest);                              // metadata is stripped by default
    totalBytes += fs.statSync(dest).size; files++;
  }
}
console.log(`${files} files, ${(totalBytes / 1048576).toFixed(1)} MB written to ${path.relative(process.cwd(), OUT)}`);
