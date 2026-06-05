# Módulo de Ventas — Descripción funcional y visual
> Documento de referencia para el diseño e implementación del POS de Pipos.
> En sintonía con la estética del módulo de productos ya construido.

---

## Concepto general

El módulo de ventas es una página propia en la ruta `/ventas`. Es el corazón operativo del sistema: el cajero pasa la mayor parte de su jornada en esta pantalla. Debe ser rápida, clara y sin distracciones. Todo lo que el cajero necesita tiene que estar a mano sin salir de la pantalla.

El layout es de **dos paneles horizontales**:

```
┌─────────────────────────────┬──────────────────────┐
│                             │                      │
│     Panel izquierdo         │   Panel derecho      │
│     Búsqueda + Productos    │   Carrito de venta   │
│     (65% del ancho)         │   (35% del ancho)    │
│                             │                      │
└─────────────────────────────┴──────────────────────┘
```

---

## Estética y coherencia visual

Sigue la misma línea del módulo de productos:

- **Fondo oscuro** (`bg-background`) con superficie de cards en `bg-card`.
- **Color de acento teal** (`#0e8a72`) para acciones primarias (confirmar venta, botones principales).
- **Bordes visibles** en lugar de sombras — importante para monitores TN de baja calidad.
- **Tipografía Geist Variable** en todos los textos.
- **Iconografía Lucide React** consistente con el resto del sistema.
- **Estados triple-señal** en elementos interactivos: color + borde + fondo.
- **Texto en español rioplatense** sin tecnicismos: "Confirmar venta", "Agregar al carrito", "Cobrar", nunca "Checkout" ni "Submit".

---

## Header de la página

Barra superior fina, igual al resto de la app. Muestra:

- **Título:** "Ventas"
- **Estado de caja** a la derecha: chip verde "Caja abierta" o rojo "Sin caja abierta".
  - Si no hay caja abierta, el chip es clickeable y abre el modal de apertura de caja.
- **Nombre del cajero** activo y su avatar/inicial.
- **Botón "Historial"** — abre un panel lateral con las ventas del turno actual.
- **Botón "Cerrar caja"** — visible solo si hay caja abierta.

---

## Panel izquierdo — Búsqueda y productos

### Barra de búsqueda

Input grande y prominente en la parte superior del panel. Es el elemento más importante de la pantalla: el cajero lo usa constantemente.

- **Placeholder:** "Escaneá o buscá un producto..."
- **Icono de lupa** a la izquierda.
- **Icono de código de barras** a la derecha — indica que acepta input del lector.
- Búsqueda en tiempo real por: nombre, código de barras, código interno.
- Al escribir, los resultados aparecen debajo sin necesidad de presionar Enter.
- El lector de código de barras dispara automáticamente: si el producto existe en la sucursal, se agrega directamente al carrito. Si no existe, abre el modal de registro rápido.
- **Focus automático** al entrar a la página y después de cada venta confirmada.

### Grilla de productos

Debajo de la búsqueda. Muestra los productos de la sucursal en formato **grilla de cards**.

Cada card de producto muestra:
- Imagen del producto (con fallback de ícono si no tiene imagen).
- Nombre del producto.
- Precio de venta en grande y destacado.
- Indicador de stock: verde si hay stock, amarillo si está bajo, rojo si está agotado.

Al hacer click en una card el producto se agrega al carrito. Si ya está en el carrito, incrementa la cantidad en 1.

**Filtros rápidos** sobre la grilla (chips horizontales):
- "Todos"
- Una chip por cada categoría de la sucursal.
- Permiten filtrar la grilla rápidamente sin salir del teclado.

**Productos agotados:**
- Se muestran con opacidad reducida y no son clickeables.
- El cajero puede verlos pero no agregarlos.

---

## Panel derecho — Carrito de venta

### Cabecera del carrito

- Título "Carrito" con el contador de items entre paréntesis: "Carrito (4)".
- Botón "Vaciar" en rojo tenue a la derecha — limpia el carrito con confirmación.

### Lista de items

Cada item del carrito muestra:
- Nombre del producto.
- Precio unitario.
- **Controles de cantidad:** botón `−`, cantidad editable, botón `+`.
  - La cantidad se puede editar escribiendo directamente el número.
  - El botón `−` en cantidad 1 elimina el producto del carrito (con ícono de papelera al llegar a 1).
- Subtotal del item a la derecha (precio × cantidad).
- Botón de descuento por item (ícono de etiqueta) — abre un pequeño input para ingresar % o monto fijo de descuento.

### Sección de totales

Separada con un divisor del resto del carrito. Muestra:

```
Subtotal                    $18.500
Descuento                   - $500
─────────────────────────────────
Total                       $18.000
```

- Si hay descuento global aplicado, se muestra la línea de descuento. Si no, se oculta.
- El total está en tipografía grande y destacada.

### Botón de descuento global

Botón secundario debajo de los totales: "Aplicar descuento". Abre un input donde el cajero ingresa un porcentaje o monto fijo de descuento sobre el total de la venta. Visible solo si el usuario tiene el permiso `APLICAR_DESCUENTOS`.

### Asignar cliente

Debajo del descuento. Un selector con búsqueda:
- **Placeholder:** "Asignar cliente (opcional)"
- Busca por nombre o DNI.
- Si el cliente tiene deuda pendiente, se muestra un badge rojo con el monto: "Deuda: $2.500".
- Si tiene saldo a favor, badge verde: "Saldo: $500".
- Botón "+" para crear un cliente nuevo rápido sin salir de la pantalla.

### Sección de cobro

La parte más importante del carrito. Aparece cuando hay al menos un item.

**Métodos de pago:**
Chips seleccionables, uno o más a la vez:
- Efectivo
- Transferencia
- Mercado Pago
- QR
- Débito
- Crédito
- Otro

Al seleccionar un método, aparece un input para ingresar el monto. Si se selecciona solo uno, el monto se completa automáticamente con el total.

**Cálculo automático:**
```
Total:             $18.000
Efectivo:          $20.000
─────────────────────────
Vuelto:            $2.000
```

Si el monto ingresado es menor al total:
```
Total:             $18.000
Efectivo:          $15.000
─────────────────────────
Pendiente:         $3.000  ← en rojo
```
## Fiado parcial por producto

El sistema debe permitir registrar fiado de dos maneras:

1. **Fiado por saldo pendiente:** cuando el cliente paga una parte del total y queda una diferencia pendiente.
2. **Fiado por producto específico:** cuando uno o más productos del carrito se marcan como fiados, mientras el resto se cobra normalmente.

Ejemplo:

- Coca Cola $3.000 → pagado ahora
- Pan $1.500 → pagado ahora
- Shampoo $4.200 → fiado

Total de venta: $8.700  
Pagado ahora: $4.500  
Fiado: $4.200

Para usar fiado parcial por producto debe haber un cliente asignado. Si no hay cliente, el sistema debe pedir seleccionar o crear uno antes de confirmar.

Cada item del carrito puede tener una opción secundaria:

- "Cobrar ahora"
- "Marcar como fiado"

Los productos marcados como fiados deben seguir descontando stock, porque el cliente se los lleva físicamente.

La deuda generada debe asociarse al cliente, a la venta original y, si corresponde, a los items específicos que fueron fiados.

En el ticket debe quedar claro qué productos fueron pagados y cuáles quedaron fiados.
En ese caso se muestra la opción "Registrar como fiado" si hay cliente asignado.

**Botón principal — Confirmar venta:**
- Grande, color teal (`#0e8a72`), texto blanco, ancho completo.
- Texto: "Confirmar venta — $18.000"
- Muestra el total en el propio botón para confirmación visual.
- Deshabilitado si: no hay items, no hay caja abierta, o el monto ingresado no cubre el total (a menos que sea fiado).
- Al confirmar: animación de éxito, se imprime ticket si hay impresora configurada, el carrito se vacía y el foco vuelve a la búsqueda.

---

## Modal — Apertura de caja

Se muestra automáticamente si el cajero entra a `/ventas` sin caja abierta, o al hacer click en el chip "Sin caja abierta".

Campos:
- **Fondo inicial:** input numérico con prefijo `$`. Default: $0.
- **Nota de apertura:** opcional. "Turno mañana", "Reemplazando a María".
- **Botón:** "Abrir caja" en teal.

Al confirmar se crea el `CashRegister` y el `CashMovement` de apertura.

---

## Modal — Cierre de caja

Accesible desde el botón "Cerrar caja" del header. Flujo en pasos:

**Paso 1 — Resumen del turno**
Muestra lo que el sistema calculó:
- Total vendido.
- Desglose por método de pago (efectivo, Mercado Pago, transferencia, etc.).
- Total de gastos del turno.
- Total de pagos a proveedores del turno.
- Efectivo esperado en caja.

**Paso 2 — Conteo de efectivo**
El cajero ingresa cuántos billetes de cada denominación tiene:
```
$10.000  × [  ] = $0
$5.000   × [  ] = $0
$2.000   × [  ] = $0
$1.000   × [  ] = $0
$500     × [  ] = $0
$200     × [  ] = $0
$100     × [  ] = $0
─────────────────────
Total contado: $0
```
El total se calcula automáticamente al completar las cantidades.

**Paso 3 — Confirmación y diferencias**
```
Efectivo esperado:    $52.500
Efectivo contado:     $52.000
Diferencia:           -$500 ← en rojo si negativo, verde si positivo
```
Campo de nota opcional: "Revisé dos veces, no encontré el faltante".
Botón: "Cerrar caja" en rojo (acción irreversible).

---

## Panel lateral — Historial del turno

Se abre desde el botón "Historial" del header. Es un panel deslizable desde la derecha (no reemplaza la pantalla).

Muestra las ventas del turno actual ordenadas por hora descendente.

Cada venta muestra:
- Hora de la venta.
- Número de venta.
- Nombre del cliente (si fue asignado).
- Método/s de pago con iconos.
- Total cobrado.
- Badge de estado: verde "Completada", rojo "Anulada", amarillo "Pendiente".

Al hacer click en una venta se expande mostrando:
- Lista de productos vendidos con cantidades y precios.
- Botón "Reimprimir ticket" (si tiene permiso `REIMPRIMIR_TICKET`).
- Botón "Anular venta" en rojo (si tiene permiso `ANULAR_VENTA`).

**Anulación de venta:**
Abre un modal de confirmación con campo obligatorio de motivo. Al confirmar:
- La venta pasa a estado CANCELLED.
- El stock de todos los productos se devuelve automáticamente.
- Se registra en el historial quién anuló y cuándo.

---

## Modal — Registro rápido de gasto

Accesible desde un botón secundario en el header o el panel de historial: "Registrar gasto". Visible solo si tiene permiso `REGISTRAR_GASTO`.

Campos:
- **Descripción:** obligatorio.
- **Categoría:** select (Insumos, Servicios, Limpieza, Transporte, Otro).
- **Monto:** input numérico con prefijo `$`.
- **Método de pago:** chips (Efectivo, Transferencia, Otro).
- **Nota:** opcional.
- **Botón:** "Registrar gasto".

Al confirmar genera un `Expense` y un `CashMovement OUT`.

---

## Modal — Registro rápido de producto (autocompletado fallido)

Si el cajero escanea un código de barras que no existe en la sucursal ni en el catálogo global, se abre un modal simplificado de registro rápido:

- Código de barras (ya completado).
- Nombre del producto.
- Precio de venta.
- Stock actual.
- Categoría (opcional).

Es una versión reducida del modal completo de productos. Al guardar, el producto queda registrado y se agrega automáticamente al carrito.

---

## Estados y casos edge

| Situación | Comportamiento |
|---|---|
| Sin caja abierta | Modal de apertura bloqueante, no se puede vender |
| Carrito vacío | Botón "Confirmar venta" deshabilitado |
| Producto agotado escaneado | Toast de advertencia: "Sin stock disponible" |
| Cliente con límite de crédito superado | Advertencia visible, el cajero decide si continuar |
| Monto ingresado menor al total sin cliente | No se puede confirmar como fiado |
| Monto ingresado menor al total con cliente | Opción de registrar diferencia como deuda |
| Cliente con saldo a favor | Se ofrece aplicar el saldo automáticamente |
| Venta confirmada exitosamente | Toast verde, carrito vacío, foco en búsqueda |
| Error al confirmar | Toast rojo con mensaje, carrito intacto |

---

## Accesos directos de teclado

El módulo está pensado para uso intensivo con teclado y lector de código de barras:

| Tecla | Acción |
|---|---|
| Cualquier tecla alfanumérica | Foco automático en la búsqueda |
| `Enter` con un solo resultado | Agrega el producto al carrito |
| `Escape` | Limpia la búsqueda |
| `F1` | Abre historial del turno |
| `F2` | Registrar gasto |
| `F10` | Confirmar venta (si está habilitado) |

---

## Permisos que afectan la UI

| Permiso | Qué se oculta si no lo tiene |
|---|---|
| `APLICAR_DESCUENTOS` | Botón de descuento global y por item |
| `ANULAR_VENTA` | Botón "Anular venta" en el historial |
| `REIMPRIMIR_TICKET` | Botón "Reimprimir ticket" en el historial |
| `ABRIR_CAJA` | Botón de apertura de caja |
| `CERRAR_CAJA` | Botón "Cerrar caja" en el header |
| `REGISTRAR_GASTO` | Botón "Registrar gasto" |
| `GESTIONAR_FIADOS` | Opción de registrar venta como fiado |
| `VER_COSTOS` | Precio de costo no se muestra en ningún lado |

---

## Lo que NO está en este módulo

Por decisión de diseño, estas funciones tienen su propio módulo separado:

- Gestión completa de clientes (historial, edición, límites de crédito).
- Gestión completa de proveedores y pagos.
- Reportes y estadísticas.
- Configuración de impresora.
- Gestión de productos (edición, importación, categorías).

Desde ventas solo se pueden hacer operaciones rápidas: asignar cliente existente, crear cliente básico, registrar gasto, abrir/cerrar caja.
---

# Ampliación recomendada — detalles funcionales que faltaban

Esta ampliación completa el módulo de ventas con decisiones importantes para que el POS sea sólido en un comercio real: kiosco, minimarket, almacén, tienda chica o negocio con varios cajeros.

---

## Principio operativo principal

El módulo de ventas no debe ser solo una pantalla para cobrar. Tiene que actuar como centro de operación del turno.

Desde ventas el cajero debe poder:
- Abrir varias pestañas de ventas individuales en el mismo modulo (para gestionar distintas ventas al mismo tiempo)
- Vender rápido.
- Buscar productos por nombre, código interno o código de barras.
- Cobrar con uno o varios métodos de pago.
- Manejar vuelto, pendiente, fiado y saldo a favor.
- Abrir y cerrar caja.
- Registrar gastos rápidos.
- Reimprimir tickets.
- Anular ventas completas cuando corresponda.
- Registrar devoluciones parciales sin romper la venta original.
- Registrar cambios de productos.
- Consultar ventas del turno sin salir de la pantalla.

### Justificación

En un comercio real el cajero no trabaja en módulos separados todo el tiempo. La velocidad manda. Si para cada acción tiene que salir de ventas, buscar otro menú y volver, el sistema se siente lento aunque técnicamente sea rápido.

---

## Tipos de operación dentro de ventas

El sistema debe diferenciar claramente entre estas operaciones:

| Operación | Cuándo se usa | Qué afecta |
|---|---|---|
| Venta normal | El cliente compra y paga | Stock, caja, historial, ticket |
| Venta fiada | El cliente compra pero queda deuda | Stock, deuda del cliente, historial |
| Venta con saldo a favor | El cliente paga usando saldo previo | Stock, saldo del cliente, historial |
| Anulación completa | La venta fue un error o no debía existir | Revierte toda la venta |
| Devolución parcial | El cliente devuelve uno o algunos productos | Revierte solo esos items |
| Devolución total | El cliente devuelve todo, pero la venta sí existió | Revierte todos los items como devolución |
| Cambio de producto | El cliente devuelve algo y se lleva otra cosa | Devuelve stock de un item y descuenta stock del nuevo |
| Gasto de caja | Sale dinero del turno | Caja y movimientos |
| Pago a proveedor | Sale dinero para pagar mercadería/proveedor | Caja, proveedor y movimientos |

### Justificación

No todo debe resolverse con “anular venta”. Si el cliente devuelve solo un producto, anular toda la venta y cargar otra genera historial sucio, caja confusa y reportes menos confiables.

---

## Estados recomendados de venta

La venta debería tener estados claros:

```ts
type EstadoVenta =
  | 'borrador'
  | 'completada'
  | 'pendiente_pago'
  | 'fiada'
  | 'parcialmente_devuelta'
  | 'devuelta_total'
  | 'anulada';
```

### Descripción visual de estados

| Estado | Badge recomendado | Uso |
|---|---|---|
| `completada` | Verde: “Completada” | Venta cobrada correctamente |
| `pendiente_pago` | Amarillo: “Pendiente” | Falta cobrar una parte |
| `fiada` | Naranja: “Fiado” | Quedó deuda asociada a cliente |
| `parcialmente_devuelta` | Azul/amarillo: “Dev. parcial” | Se devolvió parte de la venta |
| `devuelta_total` | Gris/azul: “Devuelta” | Se devolvió toda la venta |
| `anulada` | Rojo: “Anulada” | Venta cancelada por error |

### Justificación

Separar “anulada” de “devuelta” es clave. Una venta anulada normalmente representa un error operativo. Una devolución representa una operación comercial real que ocurrió después de vender.

---

## Estados recomendados por item de venta

Cada producto dentro de una venta también debe tener su propio estado:

```ts
type EstadoItemVenta =
  | 'vendido'
  | 'devuelto_parcial'
  | 'devuelto_total'
  | 'anulado';
```

Cada item debería guardar:

- Cantidad vendida original.
- Cantidad ya devuelta.
- Cantidad disponible para devolver.
- Precio unitario al momento de la venta.
- Descuento aplicado al momento de la venta.
- Subtotal final del item.

### Justificación

Esto permite devolver 1 unidad de 3 sin tocar las otras 2. También evita errores como devolver dos veces el mismo producto.

---

## Anulación completa de venta

La acción “Anular venta” debe usarse solo cuando la venta no debería existir.

Casos correctos:

- Venta cargada por error.
- Venta duplicada.
- Pago fallido.
- Cliente se fue antes de concretar la compra.
- Cajero seleccionó productos incorrectos y quiere cancelar todo antes de cerrar la operación.

Al anular:

- La venta pasa a estado `anulada`.
- Se devuelve todo el stock de los productos vendidos.
- Se revierte el movimiento de caja correspondiente.
- Se registra usuario, fecha, hora y motivo obligatorio.
- La venta no se elimina físicamente de la base de datos.
- El ticket queda marcado como anulado si se reimprime.

### Copy recomendado

Título del modal:

> Anular venta completa

Texto:

> Esta acción cancela toda la venta y devuelve al stock todos los productos vendidos. Usala solo si la venta fue cargada por error o no debía existir.

Campo obligatorio:

> Motivo de anulación

Botón:

> Anular venta completa

### Justificación

Eliminar ventas o anularlas sin motivo rompe auditoría. En comercios con empleados, cada acción sensible debe dejar rastro.

---

## Devolución parcial

El historial de ventas debe incluir una acción separada llamada:

> Registrar devolución

No debe llamarse “Anular producto”, porque comercialmente es una devolución.

Flujo recomendado:

1. El cajero abre el historial del turno.
2. Selecciona una venta.
3. Toca “Registrar devolución”.
4. El sistema muestra los productos de esa venta.
5. El cajero selecciona qué producto se devuelve.
6. Indica cantidad devuelta.
7. Indica motivo.
8. Indica si el producto vuelve o no al stock.
9. Indica cómo se devuelve el dinero.
10. Confirma.

Campos:

- Producto a devolver.
- Cantidad a devolver.
- Motivo:
  - Producto fallado.
  - Error de carga.
  - Cliente se arrepintió.
  - Cambio de producto.
  - Producto vencido.
  - Otro.
- ¿Vuelve al stock?
  - Sí, vuelve disponible.
  - No, queda como pérdida/merma.
- Forma de devolución del dinero:
  - Efectivo.
  - Transferencia.
  - Mercado Pago.
  - Saldo a favor.
  - No devolver dinero.

### Justificación

Si el cliente compró tres productos y devuelve uno, la venta original sigue siendo válida. Solo se debe revertir el producto devuelto. Esto mantiene limpios los reportes, el stock y la caja.

---

## Devolución total

La devolución total ocurre cuando el cliente devuelve todos los productos de una venta que sí fue válida en su momento.

No es lo mismo que anular.

Ejemplo:

- El cliente compró a la mañana.
- Pagó correctamente.
- Se llevó los productos.
- A la tarde vuelve y devuelve todo.

Estado final recomendado:

```ts
estadoVenta = 'devuelta_total';
```

### Justificación

La venta existió, el pago existió y la devolución también existió. Contablemente es más correcto registrarlo como devolución total, no como anulación.

---

## Cambio de producto

Debe existir un flujo para cambios, aunque internamente pueda resolverse como devolución + nueva venta.

Flujo simple:

1. Seleccionar venta original.
2. Tocar “Registrar cambio”.
3. Elegir producto devuelto.
4. Elegir si vuelve al stock.
5. Agregar producto nuevo.
6. Calcular diferencia:
   - Si el nuevo producto cuesta más: cobrar diferencia.
   - Si cuesta menos: devolver diferencia o dejar saldo a favor.
   - Si cuesta igual: confirmar cambio sin cobro extra.

### Justificación

En la práctica, muchos comercios no hablan de “devolución + nueva venta”; hablan de “cambio”. La UI debe hablar como habla el usuario real, aunque internamente se guarde de forma más técnica.

---

## Producto devuelto: vuelve o no vuelve al stock

En devoluciones y cambios siempre debe aparecer la pregunta:

> ¿El producto vuelve al stock?

Opciones:

| Opción | Resultado |
|---|---|
| Sí, vuelve al stock | Aumenta el stock disponible |
| No, producto dañado/vencido | No aumenta stock, se registra como merma |

Ejemplos donde sí vuelve:

- Producto cerrado.
- Producto en buen estado.
- Error de carga del cajero.

Ejemplos donde no vuelve:

- Comida abierta.
- Producto roto.
- Producto vencido.
- Envase dañado.
- Producto usado.

### Justificación

No toda devolución debe aumentar inventario. Si el sistema devuelve automáticamente todo al stock, puede terminar vendiendo productos que en realidad están dañados o no aptos para vender.

---

## Stock y control de disponibilidad

Al agregar productos al carrito, el sistema debe validar stock de forma preventiva.

Reglas:

- No permitir vender más cantidad que el stock disponible, salvo permiso especial.
- Si el producto tiene stock 0, mostrarlo deshabilitado.
- Si el producto tiene stock bajo, mostrar advertencia visual.
- Si se aumenta cantidad desde el carrito y supera stock, mostrar toast.
- Si el negocio permite venta sin stock, requerir permiso `VENDER_SIN_STOCK`.

Copy recomendado:

> No hay stock suficiente para agregar más unidades.

### Justificación

En kioscos y minimarkets el stock cambia rápido. Validar en el carrito evita vender productos inexistentes y reduce errores en caja.

---

## Venta sin stock disponible

Algunos comercios pueden querer vender aunque el stock esté en cero, por mala carga previa o porque el producto existe físicamente pero no fue ingresado.

Debe ser configurable.

Opciones por negocio:

```ts
permitirVentaSinStock: boolean;
```

Si está activado, igual se debe mostrar advertencia:

> Este producto figura sin stock. Si continuás, el stock quedará en negativo.

### Justificación

Bloquear siempre puede frenar una venta real. Pero permitir siempre puede destruir el inventario. Por eso debe depender de configuración y permiso.

---

## Manejo de fiado y deuda

La opción “Registrar como fiado” solo debe aparecer si:

- Hay cliente asignado.
- El usuario tiene permiso `GESTIONAR_FIADOS`.
- El monto pagado es menor al total.

Al confirmar fiado:

- La venta descuenta stock normalmente.
- El monto pagado entra a caja si hubo pago parcial.
- La diferencia se registra como deuda del cliente.
- La venta queda como `fiada` o `pendiente_pago` según el modelo elegido.

Ejemplo:

```txt
Total: $18.000
Pagado: $10.000
Fiado: $8.000
```

### Justificación

El fiado no es una venta fallida. Es una venta válida con deuda. Tiene que afectar stock, historial y cuenta corriente del cliente.

---

## Saldo a favor del cliente

Si el cliente tiene saldo a favor, el sistema debe ofrecer aplicarlo al cobro.

Comportamientos:

- Mostrar badge verde: `Saldo a favor: $2.000`.
- Botón: “Aplicar saldo”.
- Si el saldo cubre todo, el total a cobrar queda en $0.
- Si el saldo cubre una parte, queda pendiente el resto.

### Justificación

El saldo a favor puede venir de una devolución anterior o pago extra. Si no aparece en ventas, el cajero se olvida y el cliente pierde confianza.

---

## Pagos combinados

El sistema debe permitir dividir una venta en varios métodos de pago.

Ejemplos reales:

```txt
Total: $20.000
Efectivo: $10.000
Mercado Pago: $10.000
```

```txt
Total: $35.000
Débito: $20.000
Transferencia: $15.000
```

Reglas:

- Si hay un solo método seleccionado, autocompletar con el total.
- Si hay varios métodos, cada monto debe ser editable.
- El sistema debe mostrar `Pendiente` o `Vuelto` en tiempo real.
- Solo efectivo genera vuelto.
- Mercado Pago, QR, transferencia, débito y crédito no deberían generar vuelto automáticamente.

### Justificación

En Argentina es muy común pagar mezclado: una parte en efectivo, otra por transferencia o Mercado Pago. Si el POS no lo soporta, el cajero termina haciendo cuentas por fuera.

---

## Vuelto

El vuelto debe calcularse solo sobre el efectivo entregado.

Ejemplo correcto:

```txt
Total: $18.000
Efectivo: $20.000
Vuelto: $2.000
```

Ejemplo combinado:

```txt
Total: $18.000
Mercado Pago: $10.000
Efectivo: $10.000
Vuelto: $2.000
```

### Justificación

El vuelto sale físicamente de la caja, por eso debe impactar en el cálculo de efectivo esperado al cierre.

---

## Descuentos por item y globales

El sistema ya contempla descuento por item y descuento global. La regla recomendada es:

1. Primero se aplican descuentos por item.
2. Después se calcula el subtotal.
3. Luego se aplica el descuento global.
4. Finalmente se calcula el total a cobrar.

Cada descuento debe guardar:

- Tipo: porcentaje o monto fijo.
- Valor aplicado.
- Usuario que lo aplicó.
- Motivo opcional si el descuento es grande.

Si el descuento supera un límite, pedir permiso especial:

```ts
APLICAR_DESCUENTO_ALTO
```

### Justificación

Los descuentos son sensibles. Pueden usarse correctamente para promociones o mal para ocultar errores/robo. Guardar usuario y motivo mejora auditoría.

---

## Historial del turno mejorado

El historial no debería mostrar solo ventas. Debería permitir ver la actividad comercial del turno.

Tabs recomendadas:

- Ventas.
- Devoluciones.
- Gastos.
- Movimientos de caja.

En la tab Ventas, cada venta debe mostrar:

- Número de venta.
- Hora.
- Cajero.
- Cliente si existe.
- Total.
- Métodos de pago.
- Estado.
- Cantidad de items.

Acciones posibles:

- Ver detalle.
- Reimprimir ticket.
- Registrar devolución.
- Registrar cambio.
- Anular venta completa.

### Justificación

El cajero necesita revisar rápidamente qué pasó en su turno. Separar ventas, devoluciones y gastos evita mezclar operaciones distintas.

---

## Movimientos de caja

Toda acción que afecte dinero debe generar un movimiento de caja.

Tipos recomendados:

```ts
type TipoMovimientoCaja =
  | 'apertura'
  | 'venta_efectivo'
  | 'venta_transferencia'
  | 'venta_mercado_pago'
  | 'venta_debito'
  | 'venta_credito'
  | 'vuelto'
  | 'gasto'
  | 'pago_proveedor'
  | 'devolucion_efectivo'
  | 'devolucion_transferencia'
  | 'ajuste_manual'
  | 'cierre';
```

Cada movimiento debe guardar:

- Caja/turno.
- Usuario.
- Monto.
- Tipo.
- Método de pago.
- Referencia a venta/devolución/gasto si existe.
- Nota opcional.
- Fecha y hora.

### Justificación

La caja no debe calcularse únicamente desde ventas. Gastos, devoluciones, pagos a proveedores y ajustes también modifican el dinero real.

---

## Registro rápido de pago a proveedor

Además de “Registrar gasto”, conviene contemplar “Pago a proveedor”.

Campos:

- Proveedor.
- Monto.
- Método de pago.
- Nota.
- Asociar a deuda/compra pendiente si existe.

Visible solo con permiso:

```ts
REGISTRAR_PAGO_PROVEEDOR
```

### Justificación

En comercios chicos es común pagarle al proveedor desde la caja del turno. Si se registra como gasto genérico, después es difícil saber qué fue gasto operativo y qué fue pago de mercadería.

---

## Arqueo y cierre de caja más completo

El cierre debería separar dinero físico de dinero digital.

Resumen recomendado:

```txt
Ventas en efectivo:        $80.000
Vuelto entregado:         -$12.000
Gastos en efectivo:        -$8.000
Devoluciones efectivo:     -$3.000
Fondo inicial:             $20.000
────────────────────────────────
Efectivo esperado:         $77.000
```

Y por fuera:

```txt
Mercado Pago:              $45.000
Transferencias:            $22.000
Débito:                    $18.000
Crédito:                   $12.000
```

### Justificación

No todo método de pago afecta la caja física. Separarlo evita que el cajero busque en efectivo plata que entró por QR o transferencia.

---

## Impresión y ticket

Después de confirmar una venta, el sistema debería permitir:

- Imprimir automáticamente si hay impresora configurada.
- Preguntar si desea imprimir si la configuración es manual.
- Reimprimir desde historial.
- Enviar comprobante por WhatsApp en una etapa futura.

El ticket debe incluir:

- Nombre del comercio.
- Fecha y hora.
- Número de venta.
- Cajero.
- Items con cantidad, precio y subtotal.
- Descuentos si existen.
- Total.
- Método/s de pago.
- Vuelto si aplica.
- Cliente si fue asignado.
- Estado si es reimpresión de venta anulada/devuelta.

### Justificación

La reimpresión es muy necesaria en comercios reales. Pero si una venta fue anulada o devuelta, el ticket debe mostrarlo para no generar comprobantes engañosos.

---

## Registro rápido de producto: mejoras necesarias

El registro rápido por código no encontrado debería tener dos niveles:

### Registro mínimo

Para vender rápido:

- Código de barras.
- Nombre.
- Precio de venta.
- Stock inicial.
- Categoría opcional.

### Completar después

El producto queda marcado como “incompleto” para que luego, desde el módulo Productos, se cargue:

- Costo.
- Proveedor.
- Imagen.
- Stock mínimo.
- Categoría correcta.
- Margen.

Badge recomendado en productos:

> Incompleto

### Justificación

En caja no conviene frenar al cajero pidiendo todos los datos del producto. Pero tampoco conviene dejar productos incompletos para siempre.

---

## Búsqueda: comportamiento recomendado para nombres largos y códigos

La búsqueda debe tratar códigos de barras como texto, no como número.

Reglas:

- Código de barras siempre `string`.
- Permitir búsqueda parcial por código.
- Ignorar espacios accidentales al inicio/final.
- Soportar productos con nombres largos.
- Mostrar máximo 2 líneas del nombre en cards/items.
- Usar `break-words` o equivalente para palabras muy largas sin espacios.

### Justificación

Los códigos EAN pueden empezar con cero y no deben perder dígitos. Además, muchos productos tienen nombres largos o mal escritos; la UI debe aguantar esos casos sin romper el layout.

---

## Atajos de teclado ampliados

| Tecla | Acción |
|---|---|
| Cualquier tecla alfanumérica | Foco automático en búsqueda |
| `Enter` con un resultado | Agrega producto |
| `Enter` con carrito listo | Puede confirmar si el foco está en cobro |
| `Escape` | Limpia búsqueda o cierra modal/panel |
| `F1` | Historial del turno |
| `F2` | Registrar gasto |
| `F3` | Buscar/asignar cliente |
| `F4` | Aplicar descuento |
| `F8` | Reimprimir última venta |
| `F9` | Abrir/cerrar panel de cobro |
| `F10` | Confirmar venta |

### Justificación

Un POS usado muchas horas por día debe poder manejarse casi sin mouse. Esto acelera ventas y se siente más profesional.

---

## Permisos adicionales recomendados

| Permiso | Qué controla |
|---|---|
| `VENDER_SIN_STOCK` | Permite vender productos con stock insuficiente |
| `APLICAR_DESCUENTO_ALTO` | Permite descuentos superiores al límite configurado |
| `REGISTRAR_DEVOLUCION` | Muestra acción “Registrar devolución” |
| `REGISTRAR_CAMBIO` | Muestra acción “Registrar cambio” |
| `DEVOLVER_DINERO` | Permite devolver efectivo/transferencia/MP |
| `DEVOLVER_A_SALDO` | Permite dejar devolución como saldo a favor |
| `REGISTRAR_MERMA` | Permite marcar devolución como no retornable al stock |
| `REGISTRAR_PAGO_PROVEEDOR` | Permite registrar pagos a proveedores desde caja |
| `AJUSTAR_CAJA` | Permite ajustes manuales de caja |
| `VER_TODAS_LAS_VENTAS_TURNO` | Permite ver ventas de otros cajeros del mismo turno |

### Justificación

No todos los cajeros deben poder hacer operaciones sensibles. Devoluciones, descuentos altos, venta sin stock y ajustes de caja son puntos críticos.

---

## Confirmaciones obligatorias

Deben pedir confirmación fuerte:

- Vaciar carrito.
- Anular venta completa.
- Registrar devolución con devolución de dinero.
- Registrar producto como merma/no vuelve al stock.
- Cerrar caja.
- Vender sin stock, si está permitido.
- Aplicar descuento alto.

### Justificación

Son acciones que afectan dinero, stock o auditoría. Un click accidental puede generar problemas reales.

---

## Modelo de datos sugerido

Entidades mínimas:

- `Sale`
- `SaleItem`
- `SalePayment`
- `SaleReturn`
- `SaleReturnItem`
- `CashRegister`
- `CashMovement`
- `Expense`
- `SupplierPayment`
- `CustomerAccountMovement`

### Relaciones clave

- Una venta tiene muchos items.
- Una venta tiene uno o muchos pagos.
- Una venta puede tener muchas devoluciones.
- Una devolución tiene uno o muchos items devueltos.
- Todo pago/devolución/gasto relevante genera movimiento de caja.
- Toda deuda/saldo a favor genera movimiento en cuenta corriente del cliente.

### Justificación

Separar pagos, items y devoluciones evita estructuras rígidas. Permite pagos combinados, devoluciones parciales y auditoría clara.

---

## Comportamiento offline-first

El módulo de ventas debe funcionar aunque no haya internet.

Debe poder operar offline:

- Buscar productos locales.
- Agregar al carrito.
- Confirmar ventas.
- Descontar stock local.
- Registrar gastos.
- Abrir/cerrar caja.
- Registrar devoluciones.
- Imprimir tickets locales.

Al volver internet:

- Sincronizar ventas.
- Sincronizar movimientos de caja.
- Sincronizar stock.
- Resolver conflictos si otro dispositivo modificó el mismo producto.

### Justificación

En comercios chicos, la conexión puede fallar. Un POS que no vende sin internet no sirve como caja principal.

---

## Casos edge adicionales

| Situación | Comportamiento recomendado |
|---|---|
| Se escanea dos veces el mismo producto | Incrementa cantidad, no duplica línea |
| Producto con precio $0 | No permite vender salvo permiso/configuración |
| Producto sin costo cargado | Permite vender, pero no calcula ganancia confiable |
| Producto sin categoría | Se muestra igual, categoría “Sin categoría” |
| Se pierde internet durante la venta | La venta continúa en modo local |
| Se corta la luz antes de confirmar | El carrito no debería registrarse como venta |
| Se corta la luz después de confirmar | La venta ya debe quedar persistida localmente |
| Se intenta cerrar caja con venta en proceso | Advertir y pedir vaciar/finalizar carrito |
| Se intenta devolver más unidades de las vendidas | Bloquear |
| Se intenta devolver dos veces el mismo item | Permitir solo cantidad disponible para devolver |
| Se anula una venta con devoluciones previas | Bloquear o exigir flujo especial de administrador |
| Ticket de venta anulada | Reimpresión debe mostrar “VENTA ANULADA” |
| Ticket de venta parcialmente devuelta | Debe mostrar detalle de devolución si se reimprime detalle completo |

---

## Decisión UX final recomendada

El módulo debe tener dos niveles:

### Nivel 1 — Venta rápida

Lo que el cajero usa todo el tiempo:

- Buscar producto.
- Agregar al carrito.
- Cobrar.
- Confirmar venta.
- Dar vuelto.

### Nivel 2 — Operaciones del turno

Acciones menos frecuentes pero necesarias:

- Historial.
- Reimprimir ticket.
- Anular venta.
- Registrar devolución.
- Registrar cambio.
- Registrar gasto.
- Pago a proveedor.
- Cerrar caja.

### Justificación

Si todo está visible al mismo tiempo, la pantalla se vuelve pesada. Si todo está escondido, el cajero pierde tiempo. Separar venta rápida y operaciones del turno mantiene la pantalla simple pero completa.
