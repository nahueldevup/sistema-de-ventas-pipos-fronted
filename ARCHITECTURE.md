# Arquitectura del Proyecto PIPOS

## Contexto

PIPOS es un sistema POS (Point of Sale) para Argentina construido con:

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4**
- **TanStack Query** para fetching y caché de datos
- **TanStack Table** para tablas
- **Zod** para validación de schemas
- **React Hook Form** para formularios
- **React Router v7** para navegación
- **shadcn/ui** como base de componentes UI

Actualmente es **frontend únicamente**. La capa de datos es mock (localStorage).
Más adelante se integrará un backend **nextjs**.

---

## Estructura de carpetas

```
src/
├── assets/          → Recursos estáticos (SVG, imágenes)
├── components/      → Componentes React reutilizables entre features
├── config/          → Configuración de entorno y constantes de mock
├── constants/       → Constantes compartidas entre features (se crea cuando surja la necesidad)
├── contexts/        → Contextos React (theme, auth, etc.)
├── datos/           → Datos mock TEMPORALES (reemplazados por API en el futuro)
├── features/        → Módulos funcionales del negocio
├── hooks/           → Hooks React reutilizables entre features
├── layouts/         → Componentes de estructura de pantalla (sidebar, layout principal)
├── lib/             → Infraestructura de UI (cn(), dependencias de shadcn)
├── pages/           → Páginas de la app (solo composición, sin lógica de negocio)
├── schemas/         → Schemas Zod compartidos entre features
├── services/        → Capa de datos (mock hoy, API real en el futuro)
├── types/           → Tipos TypeScript compartidos entre features
└── utils/           → Funciones puras reutilizables entre features
```

---

## Reglas por capa

### `features/`

Una Feature es un módulo de negocio autocontenido. Cada Feature tiene su propia estructura interna:

```
features/<nombre>/
├── components/   → Componentes específicos de esta feature
├── hooks/        → Hooks específicos de esta feature
├── services/     → Llamadas a API específicas de esta feature (si las tiene)
├── stores/       → Estado global específico (Zustand, cuando aplique)
├── types/        → Tipos específicos de esta feature
└── engines/      → Lógica de cálculo pura (sin efectos secundarios)
```

**Regla fundamental:** una Feature **no importa** código de otra Feature directamente.

Si dos features necesitan compartir algo, ese código sube a una capa superior:
`components/`, `hooks/`, `utils/`, `services/`, `types/` o `constants/`.

**Excepción permitida:** una Feature puede importar tipos de `@/schemas/` y `@/types/`, ya que son infraestructura global.

Features existentes:
| Feature | Descripción |
|---------|-------------|
| `features/panel/` | Dashboard / Panel de Control |
| `features/productos/` | Gestión de inventario y productos |
| `features/ventas/` | Proceso de venta (POS), caja registradora |

Features planificadas:
| Feature | Descripción |
|---------|-------------|
| `features/clientes/` | Gestión de clientes |
| `features/caja/` | Gestión de caja (cuando tenga página propia) |
| `features/reportes/` | Reportes y analytics |

---

### `components/`

Componentes React **reutilizables entre features**. No contienen lógica de negocio específica de un dominio.

```
components/
└── ui/           → Primitivas de UI (Button, Input, Dialog, etc.)
```

**Cuándo poner un componente en `components/`:**
- Lo usan 2 o más features distintas
- Es una primitiva visual sin conocimiento del dominio de negocio
- Es un componente generado o extendido desde shadcn/ui

**Cuándo NO ponerlo en `components/`:**
- Solo lo usa una feature → va en `features/<nombre>/components/`
- Tiene lógica específica de un dominio → va en `features/<nombre>/components/`

---

### `hooks/`

Hooks React **reutilizables entre features**. Si un hook solo lo usa una feature, va dentro de `features/<nombre>/hooks/`.

**Cuándo poner un hook en `hooks/`:**
- Lo usan 2 o más features distintas
- Es un hook de infraestructura (teclado, resize, scroll, etc.)

---

### `utils/`

Funciones **puras** (sin efectos secundarios) reutilizables. No tienen conocimiento de React, no tienen estado.

```
utils/
├── id.utils.ts        → generateId()
├── precio.utils.ts    → calcularPrecioVenta(), calcularUtilidad()
├── venta.utils.ts     → generarNumeroVenta(), getMetodoPagoLabel(), getEstadoVenta()
└── producto.utils.ts  → formatearPesos(), getRowBg()
```

**Cuándo crear una nueva util:**
- La función es pura (input → output, sin side effects)
- La necesitan 2 o más módulos distintos
- No pertenece a ninguna feature en particular

---

### `lib/`

**Exclusivamente** para infraestructura de UI y dependencias de terceros que requieren configuración.

Actualmente contiene:
- `lib/utils.ts` → función `cn()` de shadcn/tailwind-merge

**Regla estricta:** nada de lógica de negocio en `lib/`. Si shadcn agrega más archivos aquí, se mantienen. Nada más.

---

### `services/`

Capa de acceso a datos. Hoy son mocks (localStorage). En el futuro serán llamadas HTTP al backend Laravel.

```
services/
└── mock/              → Implementación mock (temporal)
    ├── product.service.ts
    ├── sale.service.ts
    └── cash-register.service.ts
```

Cuando se integre el backend real:
```
services/
├── mock/              → Se elimina o mantiene para desarrollo offline
├── api/               → Implementación real con fetch/axios
│   ├── product.service.ts
│   ├── sale.service.ts
│   └── cash-register.service.ts
└── http.client.ts     → Instancia base de axios/fetch con interceptores
```

Los hooks de cada feature consumen los services. Las páginas y componentes **no llaman services directamente**.

---

### `schemas/`

Schemas **Zod** que definen la forma de cada entidad del sistema. Son globales porque varias features los usan.

```
schemas/
├── base.schema.ts          → Enums compartidos, BaseSyncSchema
├── product.schema.ts       → ProductSchema, Product, PersistedProduct
├── sale.schema.ts          → SaleSchema, SaleItemSchema, SalePaymentSchema
├── cash-register.schema.ts → CashRegisterSchema, CashMovementSchema
├── customer.schema.ts      → CustomerSchema
├── expense.schema.ts       → ExpenseSchema
└── sale-return.schema.ts   → SaleReturnSchema
```

Los schemas cumplen doble función:
1. **Validación** — Zod valida los datos en runtime
2. **Tipado** — `z.infer<typeof XSchema>` genera los tipos TypeScript

---

### `types/`

Tipos TypeScript compartidos que **no tienen schema Zod** asociado (no necesitan validación en runtime, solo tipado).

```
types/
├── filtros.types.ts    → FiltrosAvanzados, FiltrosRapidosTabla, Ordenamiento
├── categoria.types.ts  → Categoria
├── navigation.ts       → NavMenuItem, NavSection, NavSubItem
└── table.types.ts      → Module augmentation para TanStack Table
```

---

### `constants/`

> Esta carpeta se crea cuando aparezca la primera constante compartida concreta.

Constantes compartidas entre features. No incluir valores que ya están como enums Zod en `schemas/`.

Candidatos para cuando se cree:
- Labels de métodos de pago (hoy en `venta.utils.ts`)
- Lista de permisos del sistema (hoy en `contexts/auth/usePermisos.ts`)
- Límites operativos (descuento máximo, stock mínimo default)

Convención de nombre de archivos: `<dominio>.constants.ts`
Convención de valores exportados: `UPPER_SNAKE_CASE`

---

### `contexts/`

Contextos React que proveen estado o funcionalidad global a través del árbol de componentes.

```
contexts/
├── theme/
│   ├── ThemeProvider.tsx   → Provider del contexto de tema (dark/light)
│   ├── theme-context.ts    → createContext()
│   ├── useTheme.ts         → Hook de consumo
│   └── index.ts            → Barrel export
└── auth/
    └── usePermisos.ts      → Hook de permisos (mock por ahora, JWT en el futuro)
```

**Cuándo crear un nuevo contexto:**
- El estado necesita estar disponible en múltiples niveles del árbol sin prop drilling
- El contexto agrupa provider + tipos + hook de consumo en un módulo cohesivo

---

### `layouts/`

Componentes de **estructura de pantalla**. No contienen lógica de negocio.

```
layouts/
├── PanelControlLayout.tsx  → Layout principal con sidebar
├── Sidebar.tsx             → Componente sidebar con navegación
├── Header.tsx              → Header (actualmente sin uso activo)
├── navigation-data.ts      → Configuración de ítems del menú
└── sidebar-tokens.ts       → Tokens de diseño del sidebar (colores, clases)
```

---

### `pages/`

Las páginas **solo componen**. No calculan ni procesan datos.

**Responsabilidades permitidas:**
- Invocar hooks para obtener datos
- Pasar props a componentes hijos
- Manejar estado de UI de alto nivel (modales abiertos/cerrados)
- Orquestar handlers simples

**Responsabilidades prohibidas:**
- Lógica de cálculo de precios, totales, descuentos
- Transformación de datos complejos
- Llamadas directas a services
- Lógica de permisos

---

### `datos/`

Datos mock **temporales**. Representan registros que en producción vendrán de la base de datos Laravel.

```
datos/
└── productos.datos.ts   → Array de productos de ejemplo (PRODUCTOS_EJEMPLO)
```

> **Esta carpeta desaparece cuando se integre el backend real.** No agregarle lógica. No usarla como fuente de verdad en producción.

---

### `config/`

Configuración de entorno y constantes de inicialización del sistema mock.

```
config/
└── mock.config.ts    → MOCK_STORE_ID, MOCK_USER_ID, MOCK_CASH_REGISTER_ID
```

Cuando se integre el backend:
```
config/
├── mock.config.ts    → Se mantiene para desarrollo local sin API
├── api.config.ts     → Base URL, timeouts, headers
└── env.config.ts     → Variables de entorno tipadas con Zod
```

---

## Convenciones de Nomenclatura

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Carpetas | `kebab-case` minúsculas | `features/`, `cash-register/` |
| Componentes React | `PascalCase.tsx` | `ModalPago.tsx`, `TablaProductos.tsx` |
| Hooks | `camelCase.ts` comenzando con `use` | `useVentas.ts`, `useFiltrosProductos.ts` |
| Servicios | `kebab-case.service.ts` | `product.service.ts`, `cash-register.service.ts` |
| Schemas Zod | `kebab-case.schema.ts` | `product.schema.ts`, `base.schema.ts` |
| Types | `kebab-case.types.ts` | `filtros.types.ts`, `carrito.types.ts` |
| Utils | `kebab-case.utils.ts` | `precio.utils.ts`, `id.utils.ts` |
| Constants | `kebab-case.constants.ts` | `payment.constants.ts` |
| Constantes en código | `UPPER_SNAKE_CASE` | `MOCK_STORE_ID`, `PAYMENT_METHODS` |
| Assets SVG/PNG | `kebab-case` | `mercado-pago.svg`, `tarjeta-credito.svg` |

### Regla de renombramiento

**No renombrar archivos existentes solo por estética.** Los archivos se renombran únicamente cuando:
1. Se está refactorizando ese módulo por otra razón
2. El nombre actual causa confusión real o errores de mantenimiento
3. La inconsistencia impide la escalabilidad del proyecto

El objetivo es coherencia hacia **adelante**, no reescribir el historial de Git.

---

## Cuándo crear una nueva carpeta

| Situación | Acción |
|-----------|--------|
| Nueva funcionalidad de negocio (clientes, reportes, etc.) | Crear `features/<nombre>/` con subcarpetas necesarias |
| Componente reutilizable entre 2+ features | Crear en `components/` |
| Hook reutilizable entre 2+ features | Crear en `hooks/` |
| Función pura reutilizable | Crear en `utils/` |
| Constante compartida entre 2+ módulos | Crear en `constants/` |
| Nuevo contexto React (estado global) | Crear en `contexts/<nombre>/` |
| Nueva integración de terceros | Crear en `lib/` |
| Nuevo tipo de entidad con validación | Crear schema en `schemas/` |
| Nuevo tipo sin validación runtime | Crear en `types/` |

---

## Dependencias entre capas

```
pages/
  ↓ usa
features/<x>/hooks, features/<x>/components
  ↓ usa
services/ (datos), schemas/ (tipos), utils/ (funciones puras)
  ↓ usa
lib/ (cn), config/ (constantes de entorno)

contexts/ → puede ser consumido desde cualquier capa
types/     → puede ser consumido desde cualquier capa
constants/ → puede ser consumido desde cualquier capa
```

**Reglas de dependencia:**
- Las capas superiores pueden importar de las capas inferiores
- Las capas inferiores **nunca** importan de las capas superiores
- Las features son horizontales entre sí (no se importan entre ellas)

---

## Integración futura con Laravel

Cuando se integre el backend, la transición será:

1. `src/datos/` → **eliminado** (datos mock ya no necesarios)
2. `src/services/mock/` → reemplazado por `src/services/api/`
3. `src/config/mock.config.ts` → reemplazado por `src/config/api.config.ts`
4. `src/contexts/auth/usePermisos.ts` → expandido con JWT real

Los hooks de cada feature (`useProductos`, `useVentas`, `useCaja`) **no cambian** su interfaz pública. Solo cambia el service que consumen internamente. Las páginas y componentes no se tocan.

Este diseño garantiza que la migración al backend sea **incremental y sin romper la UI**.
