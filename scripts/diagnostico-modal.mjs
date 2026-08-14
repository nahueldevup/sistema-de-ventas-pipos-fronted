import puppeteer from 'puppeteer';

/**
 * Diagnóstico del costo real de ModalRegistroProducto.
 * 
 * Mide tres fases del ciclo de apertura del modal:
 *   1. Click → primer paint del contenido del modal (render puro de React)
 *   2. Primer paint → efectos completados (useEffect de Radix: focus trap, scroll lock, portales)
 *   3. Total click → efectos completados
 * 
 * Se corre contra el build de producción (localhost:4173).
 */

const BASE_URL = 'http://localhost:4173';
const ITERATIONS = 5; // Abrimos/cerramos 5 veces para tener un promedio estable

(async () => {
  console.log('🔬 Diagnóstico de ModalRegistroProducto — performance.mark/measure\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,800']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Navegar a /productos
  console.log('Navegando a /productos...');
  await page.goto(`${BASE_URL}/productos`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000)); // Dejar que React se asiente

  // Inyectar la instrumentación en el contexto de la página
  await page.evaluate(() => {
    // Creamos un objeto global para recoger las mediciones
    window.__MODAL_PERF__ = {
      measurements: []
    };

    // Observer que detecta cuándo el contenido del modal aparece en el DOM
    // Radix monta el DialogContent dentro de un portal
    window.__MODAL_OBSERVER__ = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            // Radix DialogContent usa data-slot="dialog-content"
            const dialogContent = node.querySelector?.('[data-slot="dialog-content"]') || 
                                   (node.getAttribute?.('data-slot') === 'dialog-content' ? node : null);
            if (dialogContent) {
              performance.mark('modal-content-mounted');
            }
          }
        }
      }
    });
    window.__MODAL_OBSERVER__.observe(document.body, { childList: true, subtree: true });
  });

  const results = [];

  for (let i = 0; i < ITERATIONS; i++) {
    console.log(`\n--- Iteración ${i + 1}/${ITERATIONS} ---`);

    // Limpiar marcas previas
    await page.evaluate(() => {
      performance.clearMarks();
      performance.clearMeasures();
    });

    // Marcar el instante del click
    await page.evaluate(() => {
      performance.mark('modal-click-start');
    });

    // Click en "Nuevo Producto"
    const clicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        b => b.textContent && (b.textContent.includes('Nuevo Producto') || b.textContent.includes('Agregar Producto'))
      );
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clicked) {
      console.log('⚠ No se encontró el botón de Nuevo Producto');
      continue;
    }

    // Esperamos a que el modal se monte y los efectos se ejecuten
    // requestIdleCallback nos asegura que el browser terminó con todo el trabajo pendiente
    await page.evaluate(() => {
      return new Promise(resolve => {
        // Damos 2 frames para que los efectos de Radix se ejecuten
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            performance.mark('modal-effects-done');
            resolve();
          });
        });
      });
    });

    // Pequeña pausa extra para asegurar que el focus trap terminó
    await new Promise(r => setTimeout(r, 100));

    // Marcar después de que absolutamente todo se asentó
    await page.evaluate(() => {
      performance.mark('modal-fully-settled');
    });

    // Recoger las mediciones
    const measurement = await page.evaluate(() => {
      const marks = performance.getEntriesByType('mark');
      const clickStart = marks.find(m => m.name === 'modal-click-start');
      const contentMounted = marks.find(m => m.name === 'modal-content-mounted');
      const effectsDone = marks.find(m => m.name === 'modal-effects-done');
      const fullySettled = marks.find(m => m.name === 'modal-fully-settled');

      if (!clickStart) return null;

      const result = {
        clickToMount: contentMounted ? contentMounted.startTime - clickStart.startTime : null,
        clickToEffects: effectsDone ? effectsDone.startTime - clickStart.startTime : null,
        clickToSettled: fullySettled ? fullySettled.startTime - clickStart.startTime : null,
        mountToEffects: (contentMounted && effectsDone) ? effectsDone.startTime - contentMounted.startTime : null,
        effectsToSettled: (effectsDone && fullySettled) ? fullySettled.startTime - effectsDone.startTime : null,
      };

      return result;
    });

    if (measurement) {
      results.push(measurement);
      console.log(`  Click → Mount:      ${measurement.clickToMount?.toFixed(2) ?? 'N/A'} ms`);
      console.log(`  Click → Effects:    ${measurement.clickToEffects?.toFixed(2) ?? 'N/A'} ms`);
      console.log(`  Click → Settled:    ${measurement.clickToSettled?.toFixed(2) ?? 'N/A'} ms`);
      console.log(`  Mount → Effects:    ${measurement.mountToEffects?.toFixed(2) ?? 'N/A'} ms  (costo efectos Radix)`);
      console.log(`  Effects → Settled:  ${measurement.effectsToSettled?.toFixed(2) ?? 'N/A'} ms  (focus trap + paint final)`);
    }

    // Cerrar el modal
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 500));
  }

  // ── Resumen ──
  if (results.length > 0) {
    const avg = (arr, key) => arr.reduce((s, r) => s + (r[key] || 0), 0) / arr.length;

    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 RESUMEN — Promedios de', results.length, 'iteraciones');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Click → Mount (render puro):     ${avg(results, 'clickToMount').toFixed(2)} ms`);
    console.log(`  Mount → Effects (Radix effects): ${avg(results, 'mountToEffects').toFixed(2)} ms`);
    console.log(`  Click → Effects (total útil):    ${avg(results, 'clickToEffects').toFixed(2)} ms`);
    console.log(`  Click → Settled (todo incluido): ${avg(results, 'clickToSettled').toFixed(2)} ms`);
    console.log(`  Effects → Settled (tail):        ${avg(results, 'effectsToSettled').toFixed(2)} ms`);
    console.log('═══════════════════════════════════════════════════');

    const mountTime = avg(results, 'clickToMount');
    const effectsTime = avg(results, 'mountToEffects');
    const totalTime = avg(results, 'clickToSettled');

    if (effectsTime > mountTime * 1.5) {
      console.log('\n⚠ Los efectos de Radix (focus trap, scroll lock, portales) consumen');
      console.log(`  significativamente más tiempo que el render puro de React.`);
      console.log(`  Render: ${mountTime.toFixed(2)}ms vs Efectos: ${effectsTime.toFixed(2)}ms`);
      console.log('  → Considerar desactivar focus trap si no es necesario o usar un modal más liviano.');
    } else {
      console.log('\n✅ Los efectos de Radix no son un cuello de botella significativo.');
      console.log(`  El costo está distribuido entre render (${mountTime.toFixed(2)}ms) y efectos (${effectsTime.toFixed(2)}ms).`);
    }
  }

  await browser.close();
  console.log('\n✅ Diagnóstico finalizado.');
})();
