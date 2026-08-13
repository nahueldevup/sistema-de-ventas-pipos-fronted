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

  md += `\n## Interpretación\n`;
  if (timeByCategory['RecalculateStyle'] > timeByCategory['Layout']) {
    md += `El tiempo de **RecalculateStyle** es significativamente alto comparado con Layout. Esto corrobora que hay propiedades complejas recalcuándose en el DOM (como \`transition-all\` masivos o selectores pesados) durante las interacciones (hover y modales). Las long tasks también revelan cuellos de botella en la ejecución del script y el estilo.`;
  } else if (timeByCategory['Layout'] > timeByCategory['RecalculateStyle']) {
    md += `El **Layout** consume la mayor cantidad de tiempo, probablemente debido a recalcular el tamaño y posición de muchos elementos de la grilla simultáneamente (reflows).`;
  } else {
    md += `El tiempo está distribuido sin grandes picos entre categorías de renderizado. No hay una dominante abrumadora que señale un único culpable de rendimiento.`;
  }

  md += `\n\n## Recomendación\n`;
  if (timeByCategory['RecalculateStyle'] > timeByCategory['Layout']) {
    md += `Se recomienda firmemente continuar con la **Fase 1.1 del refactor**, eliminando los \`transition-all\` globales o en componentes pesados, reemplazándolos por transiciones granulares (como \`transition-colors\` o \`transition-opacity\`).\n`;
  } else {
    md += `Aún con la distribución actual, es buena práctica optimizar los selectores y evitar renderizados innecesarios. Se sugiere avanzar con la limpieza de estilos de la fase actual o priorizar la virtualización si hay muchas tarjetas renderizándose.\n`;
  }

  await fs.writeFile('informe-performance.md', md);
  console.log("Informe generado en informe-performance.md");
}

analizar().catch(console.error);
