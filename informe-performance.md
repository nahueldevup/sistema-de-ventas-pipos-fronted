# Informe de Performance — 2026-08-13

## Resumen
El mayor consumidor de tiempo de renderizado fue **RecalculateStyle** con 108.24ms. Se registraron 4 long tasks en total, mostrando los mayores picos de procesamiento.

## Tiempo por categoría
| Categoría | Tiempo total (ms) | % del trace |
|---|---|---|
| RecalculateStyle | 108.24 | 66.13% |
| Layout | 24.72 | 15.10% |
| Paint | 26.24 | 16.03% |
| CompositeLayers | 0.00 | 0.00% |
| UpdateLayer | 4.47 | 2.73% |

## Long tasks (>50ms)
| Evento | Duración (ms) | Momento aproximado (ms) |
|---|---|---|
| RunTask | 56.89 | 3696354.58 |
| Receive mojo message | 56.85 | 3696354.58 |
| RunMicrotasks | 56.27 | 3696355.12 |
| FunctionCall | 56.22 | 3696355.12 |

## Interpretación
El tiempo de **RecalculateStyle** es significativamente alto comparado con Layout. Esto corrobora que hay propiedades complejas recalcuándose en el DOM (como `transition-all` masivos o selectores pesados) durante las interacciones (hover y modales). Las long tasks también revelan cuellos de botella en la ejecución del script y el estilo.

## Recomendación
Se recomienda firmemente continuar con la **Fase 1.1 del refactor**, eliminando los `transition-all` globales o en componentes pesados, reemplazándolos por transiciones granulares (como `transition-colors` o `transition-opacity`).
