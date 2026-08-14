import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  await page.goto('http://localhost:4174/productos', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const btns = await page.$$('button');
  let btnNuevo;
  for (const b of btns) {
    if ((await b.evaluate(el => el.textContent)).includes('Nuevo Producto')) btnNuevo = b;
  }
  console.log('--- CLICK START ---');
  if (btnNuevo) await btnNuevo.click();
  await new Promise(r => setTimeout(r, 1000));
  console.log('--- DONE ---');
  await browser.close();
})();
