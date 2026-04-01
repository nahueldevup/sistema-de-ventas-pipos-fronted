---
trigger: always_on
---

---
name: commits-en-espanol
description: Genera mensajes de commit en español siguiendo Conventional Commits.
---

# Regla: Mensajes de commit en español

Siempre que generes un mensaje de commit, seguí estas reglas sin excepción.

## Formato obligatorio

<tipo>(alcance opcional): <descripción corta en español>

[cuerpo opcional]

[footer opcional]

## Tipos permitidos

- feat: nueva funcionalidad
- fix: corrección de un error
- refactor: cambio de código que no agrega funcionalidad ni corrige errores
- style: cambios de formato, espaciado, nombres (sin lógica)
- chore: tareas de mantenimiento, dependencias, configuración
- docs: cambios en documentación
- test: agrega o modifica tests
- perf: mejora de rendimiento
- ci: cambios en pipelines o configuración de CI/CD
- revert: revierte un commit anterior

## Reglas de escritura

- La descripción va en minúsculas
- Sin punto final
- Modo imperativo: "agrega", "corrige", "elimina" (no "agregado" ni "se agrega")
- Máximo 72 caracteres en la primera línea
- Si el cambio necesita más explicación, usá el cuerpo separado por una línea en blanco

## Ejemplos

feat(productos): agrega modal de ajuste masivo de precios
fix(sidebar): corrige colapso incorrecto en modo móvil
refactor(categorías): separa lógica de filtrado en hook propio
style(tabla): aplica zebra striping y alineación de columnas
chore: actualiza dependencias de Tailwind a v4