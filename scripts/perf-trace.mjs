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
  await new Promise(r => setTimeout(r, 1000));

  // ── Paso 0: Asegurar que la caja esté abierta ──────────────────────
  // Si aparece el modal "Abrir Caja" automáticamente, cerrarlo con Escape.
  // Luego verificar si hay caja abierta buscando el botón "Cerrar Caja" 
  // (solo visible cuando la caja está abierta).
  const cajaAbierta = await page.evaluate(() => {
    // Si hay un botón que dice "Cerrar Caja", la caja ya está abierta
    return !!Array.from(document.querySelectorAll('button')).find(
      b => b.textContent && b.textContent.includes('Cerrar Caja')
    );
  });

  if (!cajaAbierta) {
    console.log('Caja no abierta. Intentando abrir...');
    // Buscar el botón "Abrir Caja"
    const btnAbrirCaja = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        b => b.textContent && b.textContent.includes('Abrir Caja')
      );
      if (btn) { btn.click(); return true; }
      return false;
    });

    if (btnAbrirCaja) {
      await new Promise(r => setTimeout(r, 500));
      // Hacer click en "Confirmar apertura" dentro del modal
      const confirmada = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(
          b => b.textContent && b.textContent.includes('Confirmar apertura')
        );
        if (btn) { btn.click(); return true; }
        return false;
      });
      if (confirmada) {
        console.log('Caja abierta exitosamente.');
        await new Promise(r => setTimeout(r, 1000));
      } else {
        console.log('⚠ No se pudo confirmar la apertura de caja');
      }
    } else {
      console.log('⚠ No se encontró botón de Abrir Caja');
    }
  } else {
    console.log('Caja ya abierta.');
  }

  // Cerrar cualquier modal residual
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // Conteo de interacciones para comparabilidad entre corridas
  const stats = { productosAgregados: 0, hovers: 5, confirmarVenta: 0, modalProducto: 0 };

  console.log('Iniciando trace...');
  await page.tracing.start({ path: 'perf-trace.json', screenshots: false });

  // ── Paso 1: Agregar productos al carrito ──────────────────────────
  console.log('Agregando 3 productos al carrito...');
  await page.evaluate(() => console.timeStamp('--- INICIO AGREGAR CARRITO ---'));

  for (let i = 0; i < 3; i++) {
    // Selector robusto: las tarjetas de producto son <button> con clase 'group' y 'bg-card'
    const added = await page.evaluate((index) => {
      const cards = Array.from(document.querySelectorAll('button.group'));
      // Filtrar solo las que parecen tarjetas de producto (tienen texto de precio con $)
      const productCards = cards.filter(card => card.textContent && card.textContent.includes('$'));
      if (productCards[index] && !productCards[index].disabled) {
        productCards[index].click();
        return true;
      }
      return false;
    }, i);

    if (added) {
      stats.productosAgregados++;
      console.log(`  Producto ${i + 1} agregado.`);
    } else {
      console.log(`  ⚠ No se pudo agregar producto ${i + 1}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }
  await page.evaluate(() => console.timeStamp('--- FIN AGREGAR CARRITO ---'));

  // Verificar que hay items en el carrito
  const itemsEnCarrito = await page.evaluate(() => {
    // El botón "Confirmar venta" debería estar habilitado si hay items
    const btn = Array.from(document.querySelectorAll('button')).find(
      b => b.textContent && b.textContent.includes('Confirmar venta')
    );
    return btn ? !btn.disabled : false;
  });
  console.log(`Carrito con items: ${itemsEnCarrito ? 'SÍ ✓' : 'NO ✗'}`);

  // ── Paso 2: Hover en tarjetas ─────────────────────────────────────
  console.log('Haciendo hover en 5 tarjetas...');
  await page.evaluate(() => console.timeStamp('--- INICIO HOVER ---'));
  for (let i = 0; i < 5; i++) {
    const tarjetas = await page.$$('button.group');
    if (tarjetas[i]) {
      await tarjetas[i].hover();
      await new Promise(r => setTimeout(r, 200));
    }
  }
  await page.evaluate(() => console.timeStamp('--- FIN HOVER ---'));

  // ── Paso 3: Abrir y cerrar modal de pago ──────────────────────────
  console.log('Abriendo y cerrando ModalPago...');
  await page.evaluate(() => console.timeStamp('--- INICIO MODAL PAGO ---'));
  {
    const clickExitoso = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        b => b.textContent && b.textContent.includes('Confirmar venta')
      );
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
      console.log('  Modal de pago: OK');
      stats.confirmarVenta++;
    } else {
      console.log('  ⚠ No se pudo hacer click en Confirmar venta');
    }
  }
  await page.evaluate(() => console.timeStamp('--- FIN MODAL PAGO ---'));

  // ── Paso 4: Modal de registro de producto ─────────────────────────
  console.log('Navegando a productos...');
  await page.goto(`${baseUrl}/productos`, { waitUntil: 'networkidle2' });

  console.log('Abriendo y cerrando ModalRegistroProducto...');
  await page.evaluate(() => console.timeStamp('--- INICIO MODAL NUEVO PRODUCTO ---'));
  {
    const clickExitoso = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        b => b.textContent && (b.textContent.includes('Nuevo Producto') || b.textContent.includes('Agregar Producto'))
      );
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
      stats.modalProducto++;
    } else {
      console.log('  ⚠ No se pudo hacer click en Nuevo Producto');
    }
  }
  await page.evaluate(() => console.timeStamp('--- FIN MODAL NUEVO PRODUCTO ---'));

  console.log('Deteniendo trace...');
  await page.tracing.stop();

  await browser.close();

  console.log('\n══════════════════════════════════════════');
  console.log('📋 Secuencia ejecutada:');
  console.log(JSON.stringify(stats, null, 2));
  console.log('══════════════════════════════════════════');
  console.log('Trace guardado en perf-trace.json');
})();
