import puppeteer from 'puppeteer';

(async () => {
  console.log('Iniciando Puppeteer...');
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const baseUrl = 'http://localhost:4173';

  console.log('Navegando a la vista de ventas...');
  await page.goto(`${baseUrl}/vender`, { waitUntil: 'networkidle2' });

  // Cerrar posibles modales de caja si existen al entrar
  const btnAbrirCaja = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Abrir Caja'));
  });
  if (btnAbrirCaja) {
    // no hacer nada o presionar Esc si hay un modal.
    await page.keyboard.press('Escape');
  }

  console.log('Iniciando trace...');
  await page.tracing.start({ path: 'perf-trace.json', screenshots: false });

  console.log('Agregando 3 productos...');
  await page.evaluate(() => console.timeStamp('--- INICIO AGREGAR CARRITO ---'));
  for (let i = 0; i < 3; i++) {
    const addButtons = await page.$$('.group.cursor-pointer');
    if (addButtons[i]) {
      await addButtons[i].click();
      await new Promise(r => setTimeout(r, 200));
    }
  }
  await page.evaluate(() => console.timeStamp('--- FIN AGREGAR CARRITO ---'));

  console.log('Haciendo hover en 5 tarjetas...');
  await page.evaluate(() => console.timeStamp('--- INICIO HOVER ---'));
  for (let i = 0; i < 5; i++) {
    const tarjetas = await page.$$('.group.cursor-pointer');
    if (tarjetas[i]) {
      await tarjetas[i].hover();
      await new Promise(r => setTimeout(r, 200));
    }
  }
  await page.evaluate(() => console.timeStamp('--- FIN HOVER ---'));

  console.log('Abriendo y cerrando ModalPago...');
  await page.evaluate(() => console.timeStamp('--- INICIO MODAL PAGO ---'));
  for (let i = 0; i < 2; i++) {
    const clickExitoso = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Confirmar venta'));
      if (btn && !btn.disabled) {
        btn.click();
        return true;
      }
      return false;
    });

    if (clickExitoso) {
      await new Promise(r => setTimeout(r, 500));
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    } else {
      console.log('No se pudo hacer click en Confirmar venta');
    }
  }
  await page.evaluate(() => console.timeStamp('--- FIN MODAL PAGO ---'));

  console.log('Navegando a productos...');
  await page.goto(`${baseUrl}/productos`, { waitUntil: 'networkidle2' });

  console.log('Abriendo y cerrando ModalRegistroProducto...');
  await page.evaluate(() => console.timeStamp('--- INICIO MODAL NUEVO PRODUCTO ---'));
  for (let i = 0; i < 2; i++) {
    const clickExitoso = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && (b.textContent.includes('Nuevo Producto') || b.textContent.includes('Agregar Producto')));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    if (clickExitoso) {
      await new Promise(r => setTimeout(r, 500));
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 500));
    } else {
      console.log('No se pudo hacer click en Nuevo Producto');
    }
  }
  await page.evaluate(() => console.timeStamp('--- FIN MODAL NUEVO PRODUCTO ---'));

  console.log('Deteniendo trace...');
  await page.tracing.stop();

  await browser.close();
  console.log('Trace guardado en perf-trace.json');
})();
