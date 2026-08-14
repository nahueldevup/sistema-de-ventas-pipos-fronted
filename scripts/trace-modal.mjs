import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto('http://localhost:4173/productos', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

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
    // Calentamiento: abrir y cerrar
    await btnNuevo.click();
    await new Promise(r => setTimeout(r, 800));
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 800));

    // Trace real
    console.log('Iniciando trace...');
    await page.tracing.start({ path: 'perf-trace-modal.json', screenshots: false });

    await page.evaluate(() => console.timeStamp('CLICK_OPEN_START'));
    await btnNuevo.click();
    await page.evaluate(() => console.timeStamp('CLICK_OPEN_END'));
    
    await new Promise(r => setTimeout(r, 600));

    await page.tracing.stop();
    console.log('Trace guardado en perf-trace-modal.json');
  }

  await browser.close();
})();
