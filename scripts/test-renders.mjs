import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  let logs = [];
  page.on('console', msg => {
    if (msg.text().includes('[RENDER BODY]')) {
      logs.push(msg.text());
    }
  });
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('--- NAVEGANDO A /productos ---');
  await page.goto('http://localhost:5173/productos', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('\\nRenders iniciales:');
  const initialCounts = {};
  logs.forEach(l => { initialCounts[l] = (initialCounts[l] || 0) + 1; });
  Object.entries(initialCounts).forEach(([k, v]) => console.log(`  ${k} x${v}`));
  logs = [];

  console.log('\\n--- ESCRIBIENDO EN EL BUSCADOR ---');
  const searchInput = await page.$('input[aria-label="Buscar por producto o código"]');
  if (searchInput) {
    await searchInput.type('l', { delay: 50 });
    await new Promise(r => setTimeout(r, 300));
    await searchInput.type('e', { delay: 50 });
    await new Promise(r => setTimeout(r, 300));
    await searchInput.type('c', { delay: 50 });
    await new Promise(r => setTimeout(r, 1000));
    
    console.log('\\nRenders al escribir "lec" en buscador:');
    const counts = {};
    logs.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
    Object.entries(counts).forEach(([k, v]) => console.log(`  ${k} x${v}`));
    logs = [];
    
    await searchInput.click({ clickCount: 3 });
    await searchInput.press('Backspace');
    await new Promise(r => setTimeout(r, 1000));
    logs = [];
  } else {
    console.log('No se encontró buscador');
  }

  console.log('\\n--- ABRIENDO MODAL ---');
  const btns = await page.$$('button');
  let btnNuevo;
  for (const b of btns) {
    const text = await b.evaluate(el => el.textContent);
    if (text && text.includes('Nuevo Producto')) {
      btnNuevo = b;
      break;
    }
  }
  
  if (btnNuevo) {
    await btnNuevo.click();
    await new Promise(r => setTimeout(r, 1000));
    console.log('\\nRenders al ABRIR modal:');
    const openCounts = {};
    logs.forEach(l => { openCounts[l] = (openCounts[l] || 0) + 1; });
    Object.entries(openCounts).forEach(([k, v]) => console.log(`  ${k} x${v}`));
    logs = [];

    console.log('\\n--- ESCRIBIENDO EN MODAL ---');
    const allInputs = await page.$$('input[type="text"]');
    if (allInputs.length > 1) {
      const inputNombre = allInputs[1];
      await inputNombre.type('t', { delay: 50 });
      await new Promise(r => setTimeout(r, 300));
      await inputNombre.type('e', { delay: 50 });
      await new Promise(r => setTimeout(r, 300));
      await inputNombre.type('s', { delay: 50 });
      await new Promise(r => setTimeout(r, 300));
      await inputNombre.type('t', { delay: 50 });
      await new Promise(r => setTimeout(r, 1000));

      console.log('\\nRenders al escribir "test" en modal:');
      const counts = {};
      logs.forEach(l => { counts[l] = (counts[l] || 0) + 1; });
      Object.entries(counts).forEach(([k, v]) => console.log(`  ${k} x${v}`));
      logs = [];
    } else {
      console.log('No se encontró input en modal');
    }

    console.log('\\n--- CERRANDO MODAL ---');
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 1000));
    console.log('\\nRenders al CERRAR modal:');
    const closeCounts = {};
    logs.forEach(l => { closeCounts[l] = (closeCounts[l] || 0) + 1; });
    Object.entries(closeCounts).forEach(([k, v]) => console.log(`  ${k} x${v}`));
  } else {
    console.log('No se encontró botón Nuevo Producto');
  }

  await browser.close();
})();
