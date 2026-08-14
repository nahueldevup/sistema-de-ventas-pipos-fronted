import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  let logsDespuesDeClick = [];
  let capturando = false;

  page.on('console', msg => {
    if (msg.text().includes('[RENDER BODY]')) {
      if (capturando) {
        logsDespuesDeClick.push(msg.text());
      }
    }
  });

  await page.goto('http://localhost:5173/vender', { waitUntil: 'networkidle2' });
  
  // Limpiamos consola y empezamos a capturar solo después del click
  const btns = await page.$$('.group.cursor-pointer'); 
  if (btns.length > 1) {
    capturando = true;
    await btns[1].click(); // Click a "villavicencio" o similar
    await new Promise(r => setTimeout(r, 1000));
  }
  
  console.log("=== LOGS DE RENDER DESPUÉS DEL CLICK ===");
  logsDespuesDeClick.forEach(l => console.log(l));
  console.log(`Total renders: ${logsDespuesDeClick.length}`);
  
  await browser.close();
})();
