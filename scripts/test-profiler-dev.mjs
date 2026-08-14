import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('[PROFILER]')) {
      console.log(msg.text());
    }
  });

  await page.goto('http://localhost:5173/productos', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const btns = await page.$$('button');
  let btnNuevo;
  for (const b of btns) {
    if ((await b.evaluate(el => el.textContent)).includes('Nuevo Producto')) {
      btnNuevo = b;
      break;
    }
  }

  if (btnNuevo) {
    console.log('--- OPENING MODAL ---');
    await btnNuevo.click();
    await new Promise(r => setTimeout(r, 1500));
  } else {
    console.log('No se encontró el botón');
  }
  
  await browser.close();
})();
