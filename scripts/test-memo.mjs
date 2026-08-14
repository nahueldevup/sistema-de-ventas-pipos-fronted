import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4174/productos', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  page.on('console', msg => {
    if (msg.text().includes('RENDER_TABLA')) console.log(msg.text());
  });

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
    console.log('Haciendo click en Nuevo Producto...');
    await btnNuevo.click();
    await new Promise(r => setTimeout(r, 1000));
  }
  
  await browser.close();
})();
