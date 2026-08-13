import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join, parse } from 'path';

const SRC_DIR = process.argv[2] || 'src/assets/productsImage';
const OUT_DIR = process.argv[3] || 'src/assets/productsImage/optimizadas';

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const files = (await readdir(SRC_DIR)).filter(f => /\.(png|jpe?g)$/i.test(f));

  if (files.length === 0) {
    console.log(`No se encontraron .png/.jpg en ${SRC_DIR}`);
    return;
  }

  let totalOriginal = 0;
  let totalNuevo = 0;

  for (const file of files) {
    const inputPath = join(SRC_DIR, file);
    const { name } = parse(file);
    const outputPath = join(OUT_DIR, `${name}.webp`);

    const inputBuffer = await sharp(inputPath).toBuffer();
    const outputInfo = await sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath);

    totalOriginal += inputBuffer.length;
    totalNuevo += outputInfo.size;

    const ahorro = (100 - (outputInfo.size / inputBuffer.length) * 100).toFixed(1);
    console.log(
      `${file} → ${name}.webp  (${(inputBuffer.length / 1024).toFixed(0)} KB → ${(outputInfo.size / 1024).toFixed(0)} KB, -${ahorro}%)`
    );
  }

  console.log(`\nTotal: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB → ${(totalNuevo / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error);