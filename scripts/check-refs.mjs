import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.text().includes('[REF CHECK]')) {
      console.log(msg.text());
    }
  });

  await page.goto('http://localhost:5173/vender', { waitUntil: 'networkidle2' });
  
  const btns = await page.$$('.group.cursor-pointer'); 
  if (btns.length > 1) {
    await btns[1].click();
    await new Promise(r => setTimeout(r, 1000));
  }
  
  await browser.close();
})();
