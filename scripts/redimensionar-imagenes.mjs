import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

async function main() {
  const dir = 'src/assets/productsImage';
  const TARGET_SIZE = 400; // 2x el tamaño máximo real en pantalla (~200px grilla)
  const files = await fs.readdir(dir);
  const webpFiles = files.filter(f => f.endsWith('.webp'));

  if (webpFiles.length === 0) {
    console.log('No se encontraron archivos .webp');
    return;
  }

  let totalAntes = 0;
  let totalDespues = 0;

  for (const file of webpFiles) {
    const filePath = path.join(dir, file);

    // Leer en memoria
    const buffer = await fs.readFile(filePath);
    const metadata = await sharp(buffer).metadata();
    const pesoAntes = buffer.length;
    totalAntes += pesoAntes;

    // Redimensionar a 400x400 y recomprimir
    const outputBuffer = await sharp(buffer)
      .resize({ width: TARGET_SIZE, height: TARGET_SIZE, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    await fs.writeFile(filePath, outputBuffer);
    const pesoDespues = outputBuffer.length;
    totalDespues += pesoDespues;

    const ahorro = (100 - (pesoDespues / pesoAntes) * 100).toFixed(1);
    console.log(
      `${file}  ${metadata.width}x${metadata.height} → ${TARGET_SIZE}x${TARGET_SIZE}  ` +
      `(${(pesoAntes / 1024).toFixed(0)} KB → ${(pesoDespues / 1024).toFixed(0)} KB, -${ahorro}%)`
    );
  }

  console.log(`\nTotal: ${(totalAntes / 1024).toFixed(0)} KB → ${(totalDespues / 1024).toFixed(0)} KB`);
  console.log(`Ahorro: ${((totalAntes - totalDespues) / 1024).toFixed(0)} KB (-${(100 - (totalDespues / totalAntes) * 100).toFixed(1)}%)`);
}

main().catch(console.error);
