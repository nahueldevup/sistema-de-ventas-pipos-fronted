import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

async function main() {
  const dir = 'src/assets/productsImage';
  const files = await fs.readdir(dir);
  const webpFiles = files.filter(f => f.endsWith('.webp'));
  
  // Priorizar el orden pedido para loguear lindo
  const priorities = ['producto-generico-06', 'producto-generico-10', 'producto-generico-12', 'producto-generico-09', 'producto-generico-11', 'producto-generico-02'];
  
  webpFiles.sort((a, b) => {
    const aP = priorities.findIndex(p => a.includes(p));
    const bP = priorities.findIndex(p => b.includes(p));
    if (aP !== -1 && bP !== -1) return aP - bP;
    if (aP !== -1) return -1;
    if (bP !== -1) return 1;
    return 0;
  });
  
  for (const file of webpFiles) {
    const filePath = path.join(dir, file);
    
    // Leer en memoria
    const buffer = await fs.readFile(filePath);
    const metadata = await sharp(buffer).metadata();
    
    console.log(`Procesando ${file} (${metadata.width}x${metadata.height})...`);
    await sharp(buffer)
      .resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(filePath);
  }
  console.log('¡Imágenes redimensionadas y comprimidas!');
}

main().catch(console.error);
