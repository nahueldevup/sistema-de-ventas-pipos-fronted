import fs from 'fs/promises';

async function analizar() {
  const file = await fs.readFile('perf-trace.json', 'utf8');
  const trace = JSON.parse(file);
  const events = trace.traceEvents || trace;

  const timeByCategory = {
    'RecalculateStyle': 0, // UpdateLayoutTree
    'Layout': 0,
    'Paint': 0,
    'CompositeLayers': 0,
    'UpdateLayer': 0,
  };

  const longTasks = [];
  let delayedFramesCount = 0;

  let lastFrameTime = 0;

  for (const event of events) {
    if (!event.name) continue;

    const name = event.name === 'UpdateLayoutTree' ? 'RecalculateStyle' : event.name;

    // Calcular tiempo por categoría
    if (timeByCategory[name] !== undefined && event.dur) {
      timeByCategory[name] += event.dur;
    }

    // Long tasks (> 50ms)
    // Filtramos un poco para que no haya spam de eventos internos de trace o v8.
    if (event.dur > 50000 && !['MessageLoop::RunTask', 'TaskQueueManager::ProcessTaskFromWorkQueue', 'ThreadControllerImpl::RunTask'].includes(name)) {
      longTasks.push({
        name,
        dur: event.dur / 1000,
        ts: event.ts / 1000
      });
    }

    // Frames
    if (event.name === 'DrawFrame' && event.ts) {
      if (lastFrameTime > 0) {
        const diff = (event.ts - lastFrameTime) / 1000;
        if (diff > 16.6) {
          delayedFramesCount++;
        }
      }
      lastFrameTime = event.ts;
    }
  }

  // Convertir microseg a ms
  for (const k in timeByCategory) {
    timeByCategory[k] = timeByCategory[k] / 1000;
  }

  const topLongTasks = longTasks.sort((a, b) => b.dur - a.dur).slice(0, 15);

  let totalTime = Object.values(timeByCategory).reduce((a, b) => a + b, 0);
  if (totalTime === 0) totalTime = 1; // Para evitar div/0

  let md = `# Informe de Performance — ${new Date().toISOString().split('T')[0]}\n\n`;
  md += `## Resumen\n`;
  const maxCategory = Object.entries(timeByCategory).sort((a, b) => b[1] - a[1])[0];
  md += `El mayor consumidor de tiempo de renderizado fue **${maxCategory[0]}** con ${maxCategory[1].toFixed(2)}ms. Se registraron ${topLongTasks.length > 0 ? longTasks.length : 0} long tasks en total, mostrando los mayores picos de procesamiento.\n\n`;

  md += `## Tiempo por categoría\n`;
  md += `| Categoría | Tiempo total (ms) | % del trace |\n`;
  md += `|---|---|---|\n`;
  for (const [k, v] of Object.entries(timeByCategory)) {
    const p = ((v / totalTime) * 100).toFixed(2);
    md += `| ${k} | ${v.toFixed(2)} | ${p}% |\n`;
  }

  md += `\n## Long tasks (>50ms)\n`;
  if (topLongTasks.length === 0) {
    md += `No se encontraron long tasks.\n`;
  } else {
    md += `| Evento | Duración (ms) | Momento aproximado (ms) |\n`;
    md += `|---|---|---|\n`;
    for (const task of topLongTasks) {
      md += `| ${task.name} | ${task.dur.toFixed(2)} | ${task.ts.toFixed(2)} |\n`;
    }
  }

  // ── Verificar estado real del codebase antes de generar interpretación ──
  let transitionAllCount = 0;
  try {
    const { execSync } = await import('child_process');
    const grepResult = execSync('grep -r "transition-all" src/ --include="*.tsx" --include="*.ts" --include="*.css" -c 2>/dev/null || echo "0"', { encoding: 'utf8' });
    // grep -c devuelve "archivo:N" por archivo, sumamos todos
    transitionAllCount = grepResult.trim().split('\n')
      .reduce((sum, line) => {
        const parts = line.split(':');
        const n = parseInt(parts[parts.length - 1], 10);
        return sum + (isNaN(n) ? 0 : n);
      }, 0);
  } catch {
    transitionAllCount = 0;
  }

  md += `\n## Interpretación\n`;

  const recalc = timeByCategory['RecalculateStyle'];
  const layout = timeByCategory['Layout'];
  const paint = timeByCategory['Paint'];

  if (recalc > layout && recalc > paint) {
    md += `El mayor consumidor de tiempo de renderizado es **RecalculateStyle** (${recalc.toFixed(2)}ms, ${((recalc / totalTime) * 100).toFixed(0)}% del trace). `;
    if (transitionAllCount > 0) {
      md += `Se encontraron **${transitionAllCount} instancias de \`transition-all\`** en el código fuente, lo cual es una causa probable de recálculos de estilo costosos durante hovers e interacciones. `;
    } else {
      md += `No se encontraron instancias de \`transition-all\` en el código fuente. El costo de RecalculateStyle puede deberse a:\n`;
      md += `- Selectores CSS complejos o con alta especificidad\n`;
      md += `- Animaciones CSS activas durante las interacciones (fade-in, zoom-in, slide-in)\n`;
      md += `- Cantidad de nodos DOM afectados por cambios de clase/estado\n`;
      md += `- Transiciones granulares que, en conjunto, siguen generando recálculos en muchos nodos\n`;
    }
  } else if (layout > recalc) {
    md += `El **Layout** (${layout.toFixed(2)}ms) consume la mayor cantidad de tiempo. Esto sugiere reflows frecuentes, probablemente por recalcular tamaño/posición de muchos elementos de la grilla simultáneamente.`;
  } else {
    md += `El tiempo está distribuido sin grandes picos entre categorías de renderizado. No hay una dominante abrumadora que señale un único culpable de rendimiento.`;
  }

  md += `\n\n## Recomendación\n`;

  if (recalc > layout && recalc > paint) {
    if (transitionAllCount > 0) {
      md += `Reemplazar las ${transitionAllCount} instancias de \`transition-all\` por transiciones granulares (\`transition-colors\`, \`transition-opacity\`, etc.) para reducir el costo de RecalculateStyle.\n`;
    } else {
      md += `Con 0 instancias de \`transition-all\`, el próximo paso es investigar:\n`;
      md += `1. Si las animaciones de entrada/salida de modales (Radix Dialog) contribuyen significativamente\n`;
      md += `2. Si la cantidad de nodos DOM en la grilla de productos es excesiva (considerar virtualización)\n`;
      md += `3. Si hay selectores CSS con alta complejidad que se puedan simplificar\n`;
      md += `\nPara un diagnóstico preciso, usar el Performance tab de Chrome DevTools con "Recalculate Style" detallado para ver qué reglas CSS disparan los recálculos.\n`;
    }
  } else if (layout > recalc) {
    md += `Optimizar los reflows: considerar virtualización si hay muchas tarjetas renderizándose, y evitar lecturas de layout (offsetHeight, getBoundingClientRect) dentro de loops de actualización.\n`;
  } else {
    md += `No hay un cuello de botella dominante. Se puede seguir con optimizaciones generales: virtualización de listas largas y reducción de nodos DOM innecesarios.\n`;
  }

  await fs.writeFile('informe-performance.md', md);
  console.log("Informe generado en informe-performance.md");
}

analizar().catch(console.error);

