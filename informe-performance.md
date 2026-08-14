# Informe de Performance — 2026-08-14

## Resumen
El mayor consumidor de tiempo de renderizado fue **RecalculateStyle** con 111.28ms. Se registraron 0 long tasks en total, mostrando los mayores picos de procesamiento.

## Tiempo por categoría
| Categoría | Tiempo total (ms) | % del trace |
|---|---|---|
| RecalculateStyle | 111.28 | 64.96% |
| Layout | 26.12 | 15.25% |
| Paint | 30.87 | 18.02% |
| CompositeLayers | 0.00 | 0.00% |
| UpdateLayer | 3.04 | 1.77% |

## Long tasks (>50ms)
No se encontraron long tasks.

## Interpretación
El mayor consumidor de tiempo de renderizado es **RecalculateStyle** (111.28ms, 65% del trace). No se encontraron instancias de `transition-all` en el código fuente. El costo de RecalculateStyle puede deberse a:
- Selectores CSS complejos o con alta especificidad
- Animaciones CSS activas durante las interacciones (fade-in, zoom-in, slide-in)
- Cantidad de nodos DOM afectados por cambios de clase/estado
- Transiciones granulares que, en conjunto, siguen generando recálculos en muchos nodos


## Recomendación
Con 0 instancias de `transition-all`, el próximo paso es investigar:
1. Si las animaciones de entrada/salida de modales (Radix Dialog) contribuyen significativamente
2. Si la cantidad de nodos DOM en la grilla de productos es excesiva (considerar virtualización)
3. Si hay selectores CSS con alta complejidad que se puedan simplificar

Para un diagnóstico preciso, usar el Performance tab de Chrome DevTools con "Recalculate Style" detallado para ver qué reglas CSS disparan los recálculos.
