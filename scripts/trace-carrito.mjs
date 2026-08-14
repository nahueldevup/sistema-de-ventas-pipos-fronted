import puppeteer from 'puppeteer';

const SELECTOR_CARD = 'button[title^="Agregar"]';

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:4173/vender', { waitUntil: 'networkidle2' });
  await page.waitForSelector(SELECTOR_CARD, { timeout: 10000 });
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  const cards = await page.$$(SELECTOR_CARD);
  console.log(`Cards encontradas: ${cards.length}`);

  // Calentamiento: click en índice 0 (sube al carrito, reordena la grilla)
  await cards[0].click();
  await new Promise(r => setTimeout(r, 800));

  // Ahora hay 1 producto en carrito, la grilla está reordenada
  // Iniciamos trace y hacemos click en UNA card más (índice 3 para evitar la ya en carrito)
  console.log('Iniciando trace...');
  await page.tracing.start({ path: 'perf-trace-carrito.json', screenshots: false });

  const t0 = Date.now();
  await page.evaluate((sel) => {
    // Refrescamos la referencia porque el DOM cambió tras el calentamiento
    const cards = Array.from(document.querySelectorAll(sel));
    if (cards[3]) cards[3].click();
  }, SELECTOR_CARD);

  await new Promise(r => setTimeout(r, 600));
  const t1 = Date.now();

  await page.tracing.stop();
  console.log(`Trace guardado. Tiempo wall-clock del click+settle: ${t1 - t0}ms`);
  await browser.close();
})();
