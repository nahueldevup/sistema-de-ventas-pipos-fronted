#!/bin/bash
npm run build
npx vite preview --port 4174 &
PREVIEW_PID=$!

echo "Waiting for preview server to start..."
for i in {1..20}; do
  if curl -s http://localhost:4174 > /dev/null; then
    echo "Server is up!"
    break
  fi
  sleep 1
done

cat << 'JS_EOF' > scripts/test-profiler.mjs
import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.text().includes('[PROFILER]')) console.log(msg.text());
  });
  await page.goto('http://localhost:4174/productos', { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Nuevo Producto'));
  });
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
JS_EOF

node scripts/test-profiler.mjs
kill $PREVIEW_PID
