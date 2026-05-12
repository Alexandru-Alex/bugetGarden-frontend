// Converts landing page images to WebP at display-appropriate sizes.
// Run with: node scripts/optimize-images.js
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const IMG = path.join(__dirname, "..", "assets", "images");
const ILLUS = path.join(IMG, "illustrations");

const tasks = [
  // Background hero — displayed ~1410x940, resize to 2x retina max
  {
    src: path.join(IMG, "welcome-index.jpg"),
    dst: path.join(IMG, "welcome-index.webp"),
    width: 2048,
    quality: 82,
  },
  // App icon — displayed 72x72, 2x retina
  {
    src: path.join(IMG, "icon.jpg"),
    dst: path.join(IMG, "icon.webp"),
    width: 144,
    quality: 85,
  },
  // App preview screenshot — displayed ~663x810
  {
    src: path.join(IMG, "preview_1.png"),
    dst: path.join(IMG, "preview_1.webp"),
    width: 1080,
    quality: 85,
  },
  // Garden preview — displayed 320x230, 2x retina
  {
    src: path.join(IMG, "preview_garden.jpg"),
    dst: path.join(IMG, "preview_garden.webp"),
    width: 640,
    quality: 85,
  },
  // Illustrations — displayed 120-130px, 2x retina = 260px
  { src: path.join(ILLUS, "illus_track.png"),     dst: path.join(ILLUS, "illus_track.webp"),     width: 260, quality: 90 },
  { src: path.join(ILLUS, "illus_earn.png"),      dst: path.join(ILLUS, "illus_earn.webp"),      width: 260, quality: 90 },
  { src: path.join(ILLUS, "illus_grow.png"),      dst: path.join(ILLUS, "illus_grow.webp"),      width: 260, quality: 90 },
  { src: path.join(ILLUS, "illus_score.png"),     dst: path.join(ILLUS, "illus_score.webp"),     width: 260, quality: 90 },
  { src: path.join(ILLUS, "illus_celebrate.png"), dst: path.join(ILLUS, "illus_celebrate.webp"), width: 260, quality: 90 },
  { src: path.join(ILLUS, "illus_growth.png"),    dst: path.join(ILLUS, "illus_growth.webp"),    width: 260, quality: 90 },
];

async function run() {
  for (const t of tasks) {
    if (!fs.existsSync(t.src)) {
      console.warn(`SKIP (not found): ${t.src}`);
      continue;
    }
    const before = fs.statSync(t.src).size;
    await sharp(t.src)
      .resize({ width: t.width, withoutEnlargement: true })
      .webp({ quality: t.quality })
      .toFile(t.dst);
    const after = fs.statSync(t.dst).size;
    const saved = ((1 - after / before) * 100).toFixed(1);
    console.log(`OK  ${path.basename(t.dst)}  ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB  (-${saved}%)`);
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
