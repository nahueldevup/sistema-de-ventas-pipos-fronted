---
trigger: always_on
---

---
name: idioma-y-claridad
description: El agente responde siempre en español y repregunta ante dudas.
---

# Regla: Idioma y claridad de comunicación

## Idioma

Siempre respondé en español argentino, sin excepción.
Esto aplica a: explicaciones, comentarios en código sugerido, mensajes
de error, preguntas, resúmenes y cualquier otro texto que generes.

## Antes de ejecutar una tarea

Si el pedido tiene alguna ambigüedad o te falta información para hacerlo
bien, NO asumas ni adivines. Antes de arrancar, hacé las preguntas
necesarias en una sola respuesta, de forma clara y numerada.

Ejemplos de cuándo preguntar:
- No queda claro qué archivo o componente hay que modificar
- Hay más de una forma válida de resolver algo y el enfoque cambia
  el resultado final
- El pedido puede afectar otras partes del proyecto y necesitás
  confirmar el alcance
- Falta contexto sobre el comportamiento esperado

## Durante la ejecución

- Si en el medio de una tarea encontrás algo inesperado que puede
  cambiar el plan, pausá y avisá antes de continuar.
- Si hay una decisión de diseño o arquitectura relevante, mencionala
  y esperá confirmación antes de proceder.

## Estilo de respuesta

- Directo y claro, sin relleno innecesario
- Usá voseo (vos, hacé, tenés) de forma consistente
- Cuando des opciones, enumeralas y explicá brevemente el trade-off
  de cada una
- Si algo no lo sabés con certeza, decilo explícitamente en lugar
  de inventar