/* =========================================================
   Brand assets: favicon.svg, apple-touch-icon.png, og-image.jpg
   ---------------------------------------------------------
   Run from the project folder:   npm install   (once)
                                  npm run brand
   (it only reads photos that are already in assets/img/,
   nothing is downloaded)
   Edit the NAME / TAGLINE lines below to change the social
   preview image shown when the link is shared.
   ========================================================= */
import fs from "node:fs";
import sharp from "sharp";

const NAME = "Villa Istra Kamenjak";
const TAGLINE = "Apartments with sea views in Premantura, Istria";
const NAVY = "#23496e";
const SAND = "#f5f2ea";

/* Icon: a roof above two waves. The same drawing is used for both sizes. */
const glyph = (stroke) => `
  <path d="M11 30 32 12l21 18" fill="none" stroke="${stroke}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 43q5-6 10 0t10 0 10 0 10 0" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 54q5-6 10 0t10 0 10 0 10 0" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity=".6"/>`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="${NAVY}"/>${glyph(SAND)}
</svg>
`;
fs.writeFileSync("assets/favicon.svg", favicon);

/* iOS rounds the corners itself, so the touch icon is a full square. */
const touchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${NAVY}"/>${glyph(SAND)}</svg>`;
await sharp(Buffer.from(touchSvg), { density: 576 }).resize(180, 180).png({ compressionLevel: 9 }).toFile("assets/apple-touch-icon.png");

/* Social preview image, 1200 x 630 */
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0e1c2e" stop-opacity=".15"/>
      <stop offset=".45" stop-color="#0e1c2e" stop-opacity=".35"/>
      <stop offset="1" stop-color="#0e1c2e" stop-opacity=".88"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g transform="translate(66 338) scale(1.5)">${glyph("#ffffff")}</g>
  <text x="72" y="528" font-family="DejaVu Serif, Georgia, serif" font-size="68" font-weight="700" fill="#ffffff">${NAME}</text>
  <text x="72" y="578" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" fill="#e8edf3">${TAGLINE}</text>
</svg>`;

await sharp("assets/img/site/villa-1920.webp")
  .resize(1200, 630, { fit: "cover", position: "centre" })
  .composite([{ input: Buffer.from(overlay) }])
  .jpeg({ quality: 82, progressive: true, mozjpeg: true })
  .toFile("assets/og-image.jpg");

for (const f of ["assets/favicon.svg", "assets/apple-touch-icon.png", "assets/og-image.jpg"]) {
  console.log(f.padEnd(32), (fs.statSync(f).size / 1024).toFixed(1) + " KB");
}
