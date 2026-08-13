import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

async function main() {
  const dir = 'src/assets/productsImage';
  const files = await fs.readdir(dir);
  const webpFiles = files.filter(f => f.endsWith('.webp'));
  
  const results = [];
  
  for (const file of webpFiles) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    const metadata = await sharp(filePath).metadata();
    
    results.push({
      file,
      width: metadata.width,
      height: metadata.height,
      sizeKB: (stat.size / 1024).toFixed(2)
    });
  }
  
  results.sort((a, b) => parseFloat(b.sizeKB) - parseFloat(a.sizeKB));
  
  console.table(results);
}

main().catch(console.error);
