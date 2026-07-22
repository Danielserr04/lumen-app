# Handoff: Lumen — App de finanzas personales

> Paquete de especificación para implementar la app en un codebase real.
> Un desarrollador que **no** estuvo en la conversación debe poder construirla solo con este documento.

---

## 1. Overview

**Lumen** es una app de finanzas personales (gastos, ingresos, presupuestos, suscripciones y análisis) en español, con estética **glassmorphism profundo** sobre fondo oscuro. Plataforma principal: **móvil (390 × 844)**. Secundarias: tablet (820 × 1180) y escritorio (sidebar + contenido).

El usuario:
- ve su **balance mensual** y cuánto le queda de presupuesto,
- registra y categoriza **movimientos** (gasto / ingreso),
- crea **presupuestos** por categoría con avisos,
- conecta **cuentas bancarias** (solo lectura),
- consulta **informes** por movimiento/comercio con insights,
- gestiona **suscripciones/recurrentes** y **metas de ahorro** (nuevo),
- recibe **notificaciones** (avisos de presupuesto, sincronización, insights).

---

## 2. Sobre los archivos de diseño

Los archivos de este paquete (`Finanzas UI Kit.dc.html`) son **referencias de diseño creadas en HTML** — prototipos que muestran el aspecto y comportamiento buscados, **no código de producción para copiar tal cual**.

La tarea es **recrear estos diseños en el entorno del codebase destino** (React/React Native, Vue, SwiftUI, etc.) usando sus patrones y librerías. Si aún no hay entorno, elige el framework más adecuado (recomendado: **React + TypeScript** web, o **React Native / Expo** para móvil nativo) e impleméntalo ahí. No embarques el HTML directamente.

El HTML es un **Design Component** propietario (usa etiquetas `<x-dc>`, `<sc-if>`, `{{ }}`); ignora esa sintaxis de andamiaje y quédate con el markup, estilos y valores.

---

## 3. Fidelidad

**Alta fidelidad (hifi).** Colores, tipografía, espaciado, radios y sombras son finales. Recrea la UI de forma pixel-perfect usando las librerías del codebase. Las pantallas de formulario y estados son mocks estáticos: el desarrollador debe cablear la lógica real (estado, validación, fetch) descrita en las secciones 6–8.

---

## 4. Design tokens

### Color

| Token | Valor | Uso |
|---|---|---|
| `bg` | `#07080D` | Fondo de app (casi negro azulado) |
| `text` | `#EDEFF5` | Texto principal |
| `text-muted` | `#8B93A7` | Texto secundario |
| `text-dim` | `#5C6478` | Etiquetas, placeholders, iconos inactivos |
| `text-soft` | `#A9B0C0` | Texto de listas |
| `glass-fill` | `rgba(255,255,255,0.03–0.05)` | Relleno de vidrio |
| `glass-border` | `rgba(255,255,255,0.08–0.14)` | Borde de vidrio |
| `primary-a` | `#7C6CFF` | Índigo (inicio de degradado primario) |
| `primary-b` | `#42D0F4` | Cian (fin de degradado primario) |
| `primary-link` | `#8F86FF` | Enlaces, iconos activos, acciones |
| `expense` | `#FF6B7A` | Gasto (importes negativos) |
| `income` | `#4ADEA8` | Ingreso (importes positivos) |
| `warning` | `#FFC24B` | Aviso / cuidado |

Degradado primario: `linear-gradient(135deg, #7C6CFF, #42D0F4)` (botones/CTA a 135°, barras a 90°, fondos de tarjeta a 160°).

### Colores de categoría (icono + tinte)

| Categoría | Icono (Phosphor) | Color icono | Tinte rgb |
|---|---|---|---|
| Comida | `fork-knife` | `#FFA35C` | `255,163,92` |
| Transporte | `gas-pump` | `#5CB3FF` | `92,179,255` |
| Ocio | `popcorn` | `#B78CFF` | `183,140,255` |
| Suscripciones | `arrows-clockwise` | `#FF7FC4` | `255,127,196` |
| Salud | `heartbeat` | `#4FD9D0` | `79,217,208` |
| Otros | `dots-three-circle` | `#98A2B8` | `152,162,184` |

Chip de categoría: fondo `rgba(<tinte>,0.10)`, borde `rgba(<tinte>,0.35)`, texto una versión clara del tinte.

### Tipografía

- Familia: **Outfit** (Google Fonts), pesos 200/300/400/500/600. Fallback `sans-serif`.
- Cifras grandes (balance): **56px / peso 200 / letter-spacing −1px / line-height 1**.
- Importe de formulario: 44–52px / 200.
- Título de pantalla: 17px / 500. H1 landing: 40px / 200.
- Cuerpo: 13–15px / 300–400. Etiquetas de sección: 11–12px / 400–500, `letter-spacing` 1–3px, `text-transform: uppercase`, color `#5C6478`.

### Espaciado, radios, sombras

- Escala de gap: 6 / 8 / 10 / 14 / 18 / 24 / 40 / 64 / 72 px.
- Padding tarjeta: 28–32px. Padding fila: 13–14px.
- **Radios (esquinas casi afiladas):** chips/filas 4px, inputs/tarjetas pequeñas 8–10px, tarjetas grandes 8px, marco de móvil 44px, pills 999px.
- `blur`: vidrio 20–32px (`backdrop-filter: blur(24px)` típico).
- Sombras: tarjeta `0 24px 60px rgba(0,0,0,0.4)`; móvil `0 40px 90px rgba(0,0,0,0.6)`; CTA `0 16px 36px rgba(124,108,255,0.35)`.

### Iconos

- **Phosphor Icons** (`@phosphor-icons/web` 2.1.1), peso `light` por defecto y `fill` para el ítem activo de la navegación. Mapea a la librería equivalente del codebase manteniendo el trazo fino.
- Logos de marca (bancos): **Simple Icons**.

### Botones

Todos con esquinas casi afiladas (radio 8–10px, salvo pills 999px), texto **peso 500**, transición `all 0.2s`. En estados hover subir ligeramente el brillo/opacidad; `active` bajar a `scale(0.98)`.

| Variante | Uso | Fondo | Texto | Borde | Extra |
|---|---|---|---|---|---|
| **Primario (CTA)** | Acción principal ("Guardar movimiento", "Crear presupuesto") | `linear-gradient(135deg, #7C6CFF, #42D0F4)` | `#0A0C13` | ninguno | sombra `0 16px 36px rgba(124,108,255,0.35)`, padding `15px`, ancho completo, centrado, radio 10px |
| **Secundario (glass)** | Acción secundaria | `rgba(255,255,255,0.05)` | `#EDEFF5` | `1px rgba(255,255,255,0.12)` | `backdrop-filter: blur(24px)`, padding `13–15px`, radio 8–10px. Hover: fondo `rgba(255,255,255,0.08)` |
| **Terciario / texto** | Acciones inline ("Guardar" de cabecera, enlaces) | transparente | `#8F86FF` | ninguno | hover texto `#B4ADFF` |
| **Ghost / fila-acción** | Ítems de lista pulsables | transparente | `#A9B0C0` | ninguno | hover fondo `rgba(255,255,255,0.05)` |
| **Destructivo** | Eliminar | `rgba(255,107,122,0.10)` | `#FF9AA5` | `1px rgba(255,107,122,0.4)` | radio 8px |
| **Icono redondo** | FAB / acción flotante | `linear-gradient(135deg,#7C6CFF,#42D0F4)` | `#0A0C13` | ninguno | círculo 56px, icono `plus` 24px, sombra CTA |

**Toggle segmentado** (Gasto/Ingreso, periodos): contenedor `rgba(255,255,255,0.03)` + borde `rgba(255,255,255,0.10)`, radio 10px, padding 4px. Segmento activo: fondo `rgba(<color>,0.16)` + borde `rgba(<color>,0.4)` + texto claro del color; inactivo: peso 300, `#8B93A7`. Para Gasto usar tinte `expense`, Ingreso `income`.

**Chip seleccionable** (categorías): pill 999px, padding `8px 14px`, icono + texto. Seleccionado: fondo `rgba(<tinte>,0.16)` + borde `rgba(<tinte>,0.5)`; sin seleccionar: borde `rgba(255,255,255,0.10)`, texto `#A9B0C0`.

**Tamaños:** grande (CTA) padding vertical 15px, texto 14px · medio 12–13px vertical, texto 13px · pequeño/inline 9px, texto 12–13px. Estado disabled: opacidad 0.4, sin sombra, cursor `not-allowed`.

### Formularios y campos

Estética común: fondo `rgba(255,255,255,0.03)`, borde `1px rgba(255,255,255,0.08)`, radio 8–10px, padding `13–14px`, texto 13px. Label encima: 11px / 400, `#5C6478`, `letter-spacing 1px`, `text-transform: uppercase`. Placeholder: `#5C6478`, peso 300. Foco: borde `rgba(124,108,255,0.4)` + fondo `rgba(124,108,255,0.08)`. Error: borde `rgba(255,107,122,0.5)` + fondo `rgba(255,107,122,0.05)`, mensaje debajo en `#FF9AA5` 11px con icono `warning-circle`.

Tipos de campo usados en los formularios de crear:
- **Importe grande**: número centrado 44–52px / peso 200 / `letter-spacing −1px`, con línea de 1px `rgba(255,255,255,0.15)` debajo y hint "Toca para editar el importe" (11px `#5C6478`). Es el input hero de "Añadir movimiento".
- **Toggle segmentado** Gasto/Ingreso — ver sección Botones.
- **Chips de categoría** (selección única) — ver sección Botones.
- **Fila de selección** (Fecha, Cuenta, Periodo, Aviso…): fila glass con label a la izquierda (`#8B93A7` peso 300) y valor a la derecha (`#EDEFF5` peso 400); abre selector al pulsar. Radio 8px, padding `13–14px`.
- **Selector desplegable** (categoría en presupuesto): fila con icono de categoría + nombre + caret `caret-down`, borde/fondo tintados con el color de la categoría elegida.
- **Slider** (límite mensual): pista 6px `rgba(255,255,255,0.08)`, relleno `linear-gradient(90deg,#B78CFF,#7C6CFF)`, thumb círculo 18px `#EDEFF5` con sombra `0 2px 8px rgba(0,0,0,0.4)`.
- **Buscador**: fila glass con icono `magnifying-glass` a la izquierda + placeholder; foco índigo como el resto.
- **Textarea/nota**: mismo estilo, multilínea, marcada "(opcional)".
- **Caja de insight/ayuda**: fondo `rgba(66,208,244,0.06)` + borde `rgba(66,208,244,0.30)`, icono `lightbulb` `#42D0F4`, texto 12px `#A9B0C0` line-height 1.45. Variante de éxito con `income` + `check-circle`.

**Estructura de pantalla de formulario** (móvil 390×844): status bar → cabecera (icono `x` o `caret-left` a la izquierda + título 17px/500 centrado o alineado + acción de texto opcional a la derecha) → cuerpo con `gap:16–18px` en scroll → **CTA primario anclado abajo** (`margin-top:auto`). Fondos con blob radial decorativo por pantalla (índigo/cian/verde).

**Validación (cliente):** importe ≠ 0 €, categoría requerida, campos obligatorios marcados; deshabilitar el CTA mientras el formulario no sea válido y mostrar el primer error inline al intentar guardar. Formularios que crean entidades: Añadir movimiento → `Transaction`, Nuevo presupuesto → `Budget`, Conectar cuenta → `Account`, (nuevos) Nueva categoría → `Category`, Nueva meta → `SavingsGoal`.

### Animaciones (respetar `prefers-reduced-motion`)

- `screenIn`: entrada de pantalla, 0.55s `cubic-bezier(0.22,1,0.3,1)` — opacity 0→1, translateY 14→0, scale 0.985→1.
- Slide lateral entre tabs: pantalla saliente se desplaza ±28px según dirección.
- `gradFlow` (18s) en tarjetas de gráfico; blobs de fondo `floatA/B/C` (26–38s); spinner `spin` 0.8s en cargas.

---

## 5. Pantallas / vistas

Navegación inferior móvil (5 tabs): **Dashboard · Movimientos · Recurrentes · Análisis · Config**. En PC, la misma navegación como sidebar de 240px. Ítem activo: icono `fill` color `#8F86FF`, fondo `linear-gradient(90deg, rgba(124,108,255,0.18), rgba(66,208,244,0.08))`, borde `rgba(124,108,255,0.35)`.

### 5.1 Dashboard (tab 0)
- **Tarjeta de balance mensual** (390px): mes en mayúsculas + pill de estado ("Vas bien" income / "Cuidado" warning / "Te queda poco" expense), cifra 56px, subtítulo "disponibles de X € de presupuesto", barra de progreso 4px (degradado según estado) + "% gastado" y euros a los lados.
- Gráficos de referencia (Ingresos/Gastos): al 0.22 de opacidad, **no interactivos**, detrás del texto.
- Lista de movimientos recientes (ver 5.2 fila).

### 5.2 Fila de movimiento (componente base)
Chip de icono con halo (color de categoría) · nombre + subtítulo (categoría · fecha · cuenta) · importe firmado (verde `+` / rojo `−`) · pill de estado tintado. **Sin barra lateral de color.**

### 5.3 Movimientos (tab 1)
Lista completa + búsqueda y filtros (sección 12 del HTML): campo de búsqueda activo (borde índigo), chips de filtro por categoría/tipo/fecha.

### 5.4 Informe por movimiento (móvil) — **una vista por CADA caso**

Pantalla de detalle 390×844 que se abre al pulsar cualquier fila de movimiento. Estructura base común y luego **una variante por cada caso posible**; el desarrollador debe implementar TODAS. Ninguna transacción debe quedarse sin su informe.

**Estructura base (todas las variantes):**
1. Cabecera: `caret-left` volver · título "Movimiento" · `dots-three` (menú: Editar, Duplicar, Eliminar).
2. Bloque hero: chip de icono grande con halo del color de categoría, nombre del comercio, importe firmado 44px (rojo `expense` / verde `income`), pill de estado.
3. Filas de detalle (glass, label izq `#8B93A7` / valor der `#EDEFF5`): Categoría · Cuenta · Fecha y hora · Método · Estado.
4. Caja de **insight** tintada (bombilla `lightbulb`) con el dato contextual del caso.
5. Acciones inferiores: "Editar movimiento" (secundario glass) + enlace "Eliminar" (destructivo texto).

**Casos a cubrir (cada uno es una variante del informe, con su insight propio):**

| # | Caso | Diferencia respecto a la base | Insight de ejemplo |
|---|---|---|---|
| A | **Gasto normal** (Mercadona −42,80 €) | importe rojo, fila "Media aquí" y "Presupuesto restante" | "Has gastado 180 € en Comida este mes, un 12% menos que el pasado." |
| B | **Ingreso** (Nómina +1.850 €) | importe verde, sin presupuesto; fila "Frecuencia" (Mensual día 1) | "Tu ingreso principal. Representa el 92% de tus ingresos del mes." |
| C | **Gasto recurrente / suscripción** (Spotify −10,99 €) | badge "Recurrente", filas "Desde" (Ene 2022), "Cargos" (42), "Próximo cargo" | "Llevas 42 cargos · 461,58 € en total desde que te suscribiste." |
| D | **Transacción pendiente** (`status: pending`) | pill ámbar "Pendiente", importe en `text-muted`, nota "Aún no confirmada por el banco" | "Los importes pendientes pueden cambiar hasta que el banco los confirme." |
| E | **Transferencia entre cuentas propias** | icono `arrows-left-right`, muestra origen → destino, sin categoría de gasto | "Movimiento interno: no cuenta como gasto ni ingreso." |
| F | **Gasto que supera el presupuesto** | barra de presupuesto en rojo al 100%+, pill "Cuidado" | "Con este gasto superas tu presupuesto de Ocio en 18 €." |
| G | **Reembolso / devolución** | importe verde con etiqueta "Reembolso", vinculado al gasto original | "Devolución de tu compra en Zara del 3 jul (−59,90 €)." |
| H | **Sin categorizar** | chip gris `dots-three-circle`, CTA "Asignar categoría" destacado | "Categoriza este movimiento para mejorar tus informes." |
| I | **En moneda extranjera** | importe original (USD) + convertido a EUR, fila "Tipo de cambio" | "Convertido a 0,92 €/$ el día de la operación." |
| J | **Efectivo (cash)** | cuenta "Efectivo", sin método/mask, sin banco | "Los gastos en efectivo los añadiste manualmente." |
| K | **Financiación / a plazos** | filas "Cuota X de N", "Pendiente", mini-barra de progreso | "Cuota 3 de 12 · quedan 9 cargos (540 €)." |

En **PC** el mismo detalle es master-detail: lista a la izquierda, panel a la derecha; al pulsar una fila se abre; "Resumen" por defecto sin selección. Datos de ejemplo base en `reports` (Mercadona, Nómina, Repsol, Spotify) — ver sección 7.

> Implementación: una sola pantalla de informe parametrizada por el tipo/estado de `Transaction` (ver modelo de datos §8). Las variantes se derivan de `amount` (signo), `status`, `is_recurring`, `category_id` (null = H), `type` de la cuenta (cash = J), y campos de moneda/financiación. No hardcodear 11 pantallas: una plantilla + lógica condicional que cubra los 11 casos.

### 5.5 Recurrentes (tab 2)
Lista de suscripciones/recurrentes con próximo cargo, frecuencia e importe. Tarjeta de suscripción/financiación (sección 05 del HTML).

### 5.6 Análisis (tab 3)
Gráficos de gasto por categoría e ingresos/gastos en el tiempo.

### 5.7 Config (tab 4) — **A DISEÑAR/AMPLIAR**
Perfil, seguridad, idioma, moneda (EUR), tema, notificaciones, cuentas conectadas, categorías.

### 5.8 Formularios (sección 11 del HTML)
- **Añadir movimiento**: toggle Gasto/Ingreso, importe grande editable, chips de categoría, filas Fecha/Cuenta, nota opcional, validación "El importe no puede ser 0 €", CTA "Guardar movimiento".
- **Nuevo presupuesto**: selector de categoría, límite mensual con slider, periodo, umbral de aviso (80%), insight de gasto histórico, CTA "Crear presupuesto".
- **Conectar cuenta**: buscador de banco, secciones Conectada (check verde) / Conectando (skeleton + spinner) / Disponibles (lista con `+`), nota "Conexión cifrada, solo lectura".

### 5.9 Estados (sección 15): vacío, carga (skeleton), error/offline.
### 5.10 Onboarding (sección 16): 3 pasos.
### 5.11 Notificación — detalle (sección 17).

### 5.12 Nuevas pantallas a construir (pendientes, no en el HTML)
Prioridad sugerida:
1. **Login / Signup / recuperar contraseña** — entrada a la app (email + contraseña, seguir estética glass, CTA con degradado primario).
2. **Ajustes (Config)** — ver 5.7.
3. **Editar categorías** — crear/renombrar, color y icono, tipo gasto/ingreso.
4. **Metas de ahorro** — objetivo con importe meta, progreso, fecha límite, color/icono.

Extras opcionales: transferencias, exportar CSV/PDF, escanear recibo, modo claro, estado de cuenta mensual comparativo.

---

## 6. Interacciones y comportamiento

- **Navegación por tabs**: cambia el contenido con animación `screenIn` + slide lateral (±28px según si el tab destino está antes/después). Ítem activo pasa a icono `fill`/color activo.
- **Abrir informe (PC)**: click en fila de movimiento → panel de detalle a la derecha; fila seleccionada resalta (fondo `rgba(124,108,255,0.12)`, borde `rgba(124,108,255,0.4)`). "Resumen" es la vista por defecto cuando no hay selección.
- **Formularios**: validación en cliente (importe ≠ 0, campos requeridos). Mostrar error en rojo `#FF9AA5` con icono `warning-circle`.
- **Conectar banco**: estados conectada / conectando (loading) / disponible.
- **Estados**: vacío, loading (skeleton con shimmer), error/offline.
- **Accesibilidad**: soportar `prefers-reduced-motion` (desactiva animaciones/transiciones), foco visible, contraste suficiente en pills tintados.

---

## 7. Estado y datos de ejemplo

Estado de UI mínimo del prototipo:
- `page`: 'diseno' | 'movil' | 'tablet' | 'pc' (solo para el kit de referencia; no aplica a la app real).
- `tab`: 0–4 (Dashboard…Config).
- `rep`: informe seleccionado en PC (`'mercadona'|'nomina'|'repsol'|'spotify'|null`).

Datos de ejemplo de informes (usar como seed / fixtures):
```
Mercadona  −42,80 €  Comida · 17 jul 14:32 · Visa ·· 4821 · Contactless
Nómina    +1.850,00 € Ingreso · 1 jul 08:00 · Cuenta ·· 0093 · Mensual día 1
Repsol     −60,00 €  Transporte · 16 jul 09:15 · Visa ·· 4821
Spotify    −10,99 €  Suscripción · 15 jul 07:00 · desde Ene 2022 · 42 cargos
```
Balance de ejemplo: 1.284,50 € disponibles de 2.000 € (36% gastado). Moneda **EUR**, formato español (`1.284,50 €`, coma decimal, punto de miles, símbolo tras el número).

---

## 8. Modelo de datos (entidades de BD)

Relacional (PostgreSQL/MySQL) o equivalente. Todos los importes en **céntimos enteros** (evita floats) o `DECIMAL(12,2)`; fechas en UTC.

### User
`id` (uuid, pk) · `email` (unique) · `password_hash` · `name` · `avatar_url` · `locale` (default `es`) · `currency` (default `EUR`) · `theme` (`dark`/`light`) · `created_at` · `updated_at`

### Account (cuenta / banco conectado)
`id` · `user_id` → User · `name` ("Visa ·· 4821") · `type` (`checking`/`card`/`cash`) · `bank_name` · `mask` ("·· 4821") · `balance` · `is_connected` (bool) · `last_sync_at` · `created_at`

### Category
`id` · `user_id` → User (nullable: null = categoría global/sistema) · `name` · `icon` (nombre Phosphor, p.ej. `fork-knife`) · `color` (hex) · `tint` (rgb "255,163,92") · `kind` (`expense`/`income`) · `is_system` (bool) · `sort_order`

### Transaction (movimiento)
`id` · `user_id` → User · `account_id` → Account · `category_id` → Category · `amount` (con signo: − gasto, + ingreso) · `currency` · `name`/`merchant` · `note` (nullable) · `date` · `method` (nullable, "Contactless") · `status` (`cleared`/`pending`) · `is_recurring` (bool) · `recurring_id` → Recurring (nullable) · `created_at`

### Recurring (recurrente / suscripción)
`id` · `user_id` → User · `category_id` → Category · `account_id` → Account · `name` · `amount` · `frequency` (`monthly`/`weekly`/`yearly`) · `next_charge_date` · `start_date` · `active` (bool)

### Budget (presupuesto)
`id` · `user_id` → User · `category_id` → Category · `limit_amount` · `period` (`monthly`) · `alert_threshold` (0.80) · `start_date`
> `spent` / `available` / `% gastado` se **calculan** por query sobre Transaction; no se almacenan.

### SavingsGoal (meta de ahorro — nuevo)
`id` · `user_id` → User · `name` · `target_amount` · `current_amount` · `deadline` (nullable) · `color` · `icon` · `created_at`

### Notification
`id` · `user_id` → User · `type` (`budget_alert`/`sync`/`insight`) · `title` · `body` · `related_transaction_id` → Transaction (nullable) · `read` (bool) · `created_at`

### Relaciones
- User 1─N Account, Category, Transaction, Recurring, Budget, SavingsGoal, Notification
- Account 1─N Transaction · Account 1─N Recurring
- Category 1─N Transaction · Category 1─N Recurring · Category 1─1 Budget (por periodo activo)
- Recurring 1─N Transaction (cargos generados)

### Índices sugeridos
`Transaction(user_id, date)`, `Transaction(category_id)`, `Transaction(account_id)`, `Budget(user_id, category_id, period)`, `Recurring(user_id, next_charge_date)`, `Notification(user_id, read)`.

### Valores derivados (vistas / queries, no columnas)
Balance mensual, presupuesto disponible y % gastado, media por comercio, total anual por ingreso, suma de recurrentes del mes. Implementar como vistas SQL o agregaciones en el repositorio/servicio.

---

## 9. Assets

- **Fuente:** Outfit — Google Fonts (`https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600`).
- **Iconos:** Phosphor Icons 2.1.1 (light + fill). Sustituir por la librería del codebase manteniendo trazo fino.
- **Logos de banco:** Simple Icons.
- No hay imágenes bitmap; todo es CSS/glass/degradados. Si el diseño destino los necesita, pedir materiales reales.

---

## 10. Archivos incluidos

- `Finanzas UI Kit.dc.html` — prototipo hifi con todas las pantallas y estados, numeradas 01–18. Ábrelo en un navegador para inspeccionar valores exactos (colores, tamaños, espaciados). Las secciones 08/13/14 son PC, 09–12/15–17 móvil, 18 tablet, 01–07 el sistema de diseño.

---

## 11. CRUD por entidad (para planning de backend)

Cada entidad expone las mismas operaciones. Todas las mutaciones son **scoped al `user_id`** autenticado (nadie ve/edita datos de otro). Respuestas de error uniformes (§14). Importes en céntimos enteros.

Formato de endpoint sugerido: REST `/{recurso}`. Ajusta a GraphQL/tRPC si el codebase lo usa; lo importante es cubrir estas operaciones.

### 11.1 Transaction (movimiento)
- `GET /transactions` — lista paginada. Filtros: `from`, `to` (fechas), `category_id`, `account_id`, `type` (expense/income), `status`, `q` (texto en name/note), `is_recurring`. Orden por `date desc`. Paginación cursor.
- `GET /transactions/:id` — detalle (alimenta el informe §5.4, resuelve la variante A–K).
- `POST /transactions` — crear. **Body:** `account_id`*, `category_id` (null = sin categorizar, caso H), `amount`* (signo define gasto/ingreso), `name`*, `date`* (default hoy), `method`, `note`, `status` (default `cleared`). Efecto lateral: recalcular presupuesto de la categoría y **disparar alerta** si cruza umbral (§14).
- `PATCH /transactions/:id` — editar cualquier campo (form "Editar movimiento", §12.2). Cambiar `category_id`/`amount`/`date` recalcula presupuestos afectados (el de antes y el de después).
- `DELETE /transactions/:id` — eliminar (con confirmación §14). Recalcula presupuesto.
- `POST /transactions/:id/duplicate` — duplicar (acción del menú `dots-three`).
- Reglas: `amount ≠ 0`. Si `is_recurring`, `recurring_id` obligatorio. Transferencia interna (caso E) = par de transacciones enlazadas (`transfer_id`) — ver §16.

### 11.2 Budget (presupuesto)
- `GET /budgets` — lista con campos derivados `spent`, `available`, `percent`, `state` (ok/warning/over) calculados en servidor para el periodo actual.
- `POST /budgets` — `category_id`*, `limit_amount`*, `period` (default `monthly`), `alert_threshold` (default 0.80). Una categoría no puede tener 2 presupuestos activos del mismo periodo (409).
- `PATCH /budgets/:id` — editar límite/umbral.
- `DELETE /budgets/:id`.

### 11.3 Recurring (recurrente/suscripción)
- `GET /recurrings` — lista, orden por `next_charge_date asc`.
- `POST /recurrings` — `name`*, `amount`*, `category_id`*, `account_id`*, `frequency`*, `start_date`*, `next_charge_date` (calculado si falta).
- `PATCH /recurrings/:id` · `DELETE /recurrings/:id` · `POST /recurrings/:id/pause` (toggle `active`).
- Job programado: cuando `next_charge_date <= hoy` y `active`, genera una `Transaction` con `is_recurring=true`, avanza `next_charge_date` según `frequency`, y crea notificación tipo `sync`.

### 11.4 Category
- `GET /categories` — sistema (globales) + del usuario.
- `POST /categories` — `name`*, `icon`*, `color`*, `tint`, `kind`*. `is_system=false`.
- `PATCH /categories/:id` — renombrar/color/icono (solo las del usuario; las de sistema no se editan → 403).
- `DELETE /categories/:id` — solo si no tiene transacciones, o reasignar a "Otros" (pedir en UI).

### 11.5 Account
- `GET /accounts` · `GET /accounts/:id`.
- `POST /accounts` — manual (`type: cash`) o iniciar conexión bancaria (`bank_name`, estado `connecting`).
- `PATCH /accounts/:id` — renombrar. `DELETE /accounts/:id` (bloquear si tiene transacciones o pedir confirmación).
- `POST /accounts/:id/sync` — refrescar (mock), actualiza `last_sync_at`.

### 11.6 SavingsGoal (meta de ahorro)
- `GET /goals` · `POST /goals` (`name`*, `target_amount`*, `deadline`, `color`, `icon`) · `PATCH /goals/:id` · `DELETE /goals/:id`.
- `POST /goals/:id/contribute` — `amount` → suma a `current_amount` (opcionalmente genera Transaction). Notifica al llegar al 100%.

### 11.7 User / Auth
- `POST /auth/signup` (`email`, `password`, `name`) · `POST /auth/login` · `POST /auth/logout` · `POST /auth/forgot-password` · `POST /auth/reset-password`.
- `GET /me` · `PATCH /me` (name, avatar, locale, currency, theme, prefs de notificación).

---

## 12. Formularios de añadir / editar (detallados)

Todos comparten la **estructura de pantalla** de §Formularios (cabecera → cuerpo scroll `gap:16–18px` → CTA anclado abajo) y los estilos de campo de §4. Añadir y Editar son la **misma pantalla**: en modo editar los campos vienen precargados, el título es "Editar …", el CTA dice "Guardar cambios" y aparece el enlace destructivo "Eliminar".

### 12.1 Añadir/Editar movimiento → `Transaction`
| Campo | Control | Requerido | Notas |
|---|---|---|---|
| Tipo | Toggle segmentado Gasto/Ingreso | sí | define el signo de `amount` |
| Importe | Input hero 44–52px | sí | `≠ 0 €`; error "El importe no puede ser 0 €" |
| Categoría | Chips seleccionables | sí (gasto) | ingreso puede omitir; icono+color por categoría |
| Cuenta | Fila selección → sheet de cuentas | sí | default: última usada |
| Fecha y hora | Fila selección → date/time picker | sí | default: ahora |
| Método | Fila selección (Contactless, Transferencia, Efectivo…) | no | |
| Nota | Textarea "(opcional)" | no | |
| Recurrente | Toggle "Es recurrente" | no | si ON, muestra frecuencia → crea/enlaza `Recurring` |

CTA "Guardar movimiento" / "Guardar cambios". Al guardar: éxito con checkmark animado (§14) y volver a la lista.

### 12.2 Editar movimiento (variaciones)
Mismo form precargado. Menú `dots-three` del informe: **Editar · Duplicar · Eliminar**. Eliminar → confirm modal (§14). Cambiar categoría/importe recalcula presupuesto y puede disparar alerta.

### 12.3 Nuevo/Editar presupuesto → `Budget`
Selector de categoría (dropdown tintado) · Límite mensual (slider + valor editable) · Periodo · Umbral de aviso (slider 50–100%, default 80%) · caja insight con gasto histórico de esa categoría. CTA "Crear presupuesto" / "Guardar cambios".

### 12.4 Nueva/Editar suscripción → `Recurring`
Nombre · Importe · Categoría · Cuenta · Frecuencia (mensual/semanal/anual) · Fecha de inicio · Próximo cargo (auto). CTA "Guardar suscripción". Acción "Pausar" en editar.

### 12.5 Conectar/Añadir cuenta → `Account`
Buscador de banco · secciones Conectada (check verde) / Conectando (skeleton+spinner) / Disponibles (`+`). Alternativa "Añadir efectivo/manual" → nombre + saldo inicial (`type: cash`). Nota "Conexión cifrada, solo lectura".

### 12.6 Nueva/Editar categoría → `Category` *(a construir)*
Nombre · Selector de icono (grid de iconos Phosphor) · Selector de color (swatches) · Tipo Gasto/Ingreso. Preview de la fila en vivo. CTA "Guardar categoría".

### 12.7 Nueva/Editar meta → `SavingsGoal` *(a construir)*
Nombre · Importe objetivo · Fecha límite (opcional) · Color/icono · (editar) botón "Añadir aportación". CTA "Crear meta".

### 12.8 Auth / Ajustes *(a construir)*
Login (email+contraseña, "olvidé contraseña"), Signup (nombre+email+contraseña), Reset. Ajustes: Perfil (nombre, avatar), Seguridad (cambiar contraseña, biometría toggle), Preferencias (idioma, moneda, tema), Notificaciones (toggles por tipo §13), Cuentas, Categorías, Cerrar sesión.

---

## 13. Tipos de alertas y mensajes

Sistema unificado. Cada mensaje: `severity` (color), icono Phosphor, título, cuerpo, y opcionalmente acción. Respetar `prefers-reduced-motion` en las animaciones de entrada.

### 13.1 Toasts (efímeros, 3–4s, esquina/inferior)
| Tipo | Severity/Color | Icono | Ejemplo |
|---|---|---|---|
| Éxito | `income` verde | `check-circle` | "Movimiento guardado" (con checkmark animado) |
| Error | `expense` rojo | `warning-circle` | "No se pudo guardar. Inténtalo de nuevo." |
| Info | `primary` índigo/cian | `info` | "Sincronizando movimientos…" |
| Deshacer | neutro glass | `arrow-counter-clockwise` | "Movimiento eliminado · Deshacer" (5s) |

### 13.2 Inline (dentro de formularios)
Validación en rojo `#FF9AA5` 11px + `warning-circle` bajo el campo. Reglas: importe ≠ 0, requeridos vacíos, email inválido, contraseña débil, duplicado (presupuesto ya existe).

### 13.3 Banners (persistentes, cabecera de pantalla)
- **Offline** (neutro/ámbar): "Sin conexión · mostrando datos guardados".
- **Cuenta desconectada** (ámbar): "Reconecta tu banco para actualizar" + acción.
- **Presupuesto superado** (rojo): en Dashboard, "Has superado tu presupuesto de Ocio".

### 13.4 Modales de confirmación (destructivos / importantes)
Overlay glass. Título + cuerpo + 2 botones (Cancelar secundario / Confirmar destructivo). Casos: eliminar movimiento, eliminar categoría con transacciones (ofrecer reasignar), eliminar cuenta, cerrar sesión, borrar cuenta de usuario.

### 13.5 Alertas de negocio (generan `Notification` §14)
- `budget_alert`: al cruzar `alert_threshold` (aviso 80%) y al superar 100% (crítico).
- `sync`: cargo recurrente generado / sincronización de banco completada o fallida.
- `insight`: resumen semanal, gasto inusual, meta de ahorro alcanzada.

---

## 14. Centro de notificaciones

Pantalla dedicada (icono campana en cabecera con badge de no leídas) + pantalla de **detalle** (sección 17 del HTML).

### 14.1 Lista
- Filas agrupadas por fecha (Hoy / Ayer / Esta semana / Anteriores).
- Cada fila: chip de icono por `type` (color: budget_alert=ámbar/rojo, sync=cian, insight=índigo) · título · cuerpo (1 línea truncada) · hora relativa ("hace 2 h") · punto de no leída.
- No leídas con fondo glass ligeramente más brillante.
- Acciones: pulsar → detalle (marca leída); swipe → eliminar; botón "Marcar todas como leídas".
- Estado vacío: ilustración glass + "No tienes notificaciones".

### 14.2 Detalle
Icono grande, título, cuerpo completo, timestamp, y **acción contextual** según `type`:
- `budget_alert` → "Ver presupuesto" (abre §12.3) / "Ver movimientos de la categoría".
- `sync` → "Ver movimiento" (abre informe §5.4) o "Reintentar" si falló.
- `insight` → "Ver análisis" (tab 3) o "Ver meta".

### 14.3 Backend
- `GET /notifications` (paginado, filtro `read`) · `GET /notifications/:id` · `PATCH /notifications/:id` (marcar leída) · `POST /notifications/read-all` · `DELETE /notifications/:id`.
- `GET /notifications/unread-count` para el badge.
- Preferencias por tipo en `User` (qué tipos recibe / push on-off).
- Generación: por los jobs y efectos laterales descritos en §11 y §13.5. Push mockup (no requiere proveedor real para el MVP).

---

## 15. Endpoints derivados / analítica (para Dashboard y tab Análisis)

No son entidades; son agregaciones. Implementar como vistas SQL o servicios:
- `GET /summary?period=YYYY-MM` — balance del mes, ingresos, gastos, presupuesto total, disponible, % gastado, estado (ok/warning/over) → alimenta la tarjeta de balance §5.1.
- `GET /analytics/by-category?period=…` — gasto por categoría (para gráfico donut).
- `GET /analytics/cashflow?range=6m` — ingresos vs gastos por mes (gráfico de líneas).
- `GET /analytics/recurring-upcoming` — próximos cargos del mes (suma + lista).
- `GET /reports/transaction/:id` — detalle enriquecido con los campos calculados del informe (media por comercio, presupuesto restante, nº de cargos, total histórico) que resuelven las variantes A–K de §5.4.

---

## 16. Detalles NO implementados en el prototipo (a decidir/construir)

Lista para planning. El prototipo cubre la UI base; esto es lo que falta y conviene definir antes del backend:

**Pantallas/flows nuevos**
1. **Auth completo** — Login, Signup, recuperar/reset contraseña, biometría (toggle). Sesión/JWT.
2. **Ajustes (Config, tab 4)** — perfil, seguridad, preferencias, notificaciones, cuentas, categorías, cerrar sesión.
3. **Editar categorías** (§12.6) y **Metas de ahorro** (§12.7 + entidad SavingsGoal).
4. **Centro de notificaciones** completo (§14) — la lista aún no existe, solo el detalle (sección 17).
5. **Transferencias internas** (caso E §5.4) — modela como par de transacciones enlazadas por `transfer_id`; decidir si es entidad propia `Transfer` o convención. Recomendado: campo `transfer_id` (uuid) en Transaction que enlaza las dos patas.

**Reglas de negocio a confirmar**
6. **Recálculo de presupuesto** — momento (al crear/editar/borrar transacción) y qué presupuestos afecta un cambio de categoría/fecha.
7. **Umbrales de alerta** — 80% (aviso) y 100% (crítico); ¿configurables por presupuesto? (campo `alert_threshold` ya lo permite).
8. **Generación de recurrentes** — job diario; qué pasa si el usuario ya registró el cargo manualmente (evitar duplicados → dedupe por importe+fecha+recurring_id).
9. **Multi-moneda** (caso I) — guardar `currency` + `amount_original` + `fx_rate`; el balance se calcula en la moneda del usuario. Definir fuente de tipos de cambio.
10. **Reembolsos** (caso G) — enlace `refund_of` → Transaction original.
11. **Financiación a plazos** (caso K) — ¿entidad propia o campos `installment_current`/`installment_total` en Recurring/Transaction?
12. **Categoría "Otros"/sistema** — no borrable; destino al eliminar categorías con transacciones.
13. **Soft delete vs hard delete** — para deshacer (toast §13.1) conviene soft delete con ventana de 5s o `deleted_at`.
14. **Zonas horarias y periodo del presupuesto** — definir inicio de mes según `locale`/tz del usuario.

**Modelo — campos añadidos sugeridos** (respecto a §8)
- `Transaction`: `transfer_id`, `refund_of`, `amount_original`, `fx_rate`, `installment_current`, `installment_total`, `deleted_at`.
- `User`: `notification_prefs` (json por tipo), `biometric_enabled`.
- `Notification`: `severity`, `action_type`, `action_target_id`.

> Objetivo de este documento: que el backend se pueda planificar entidad por entidad (§8), operación por operación (§11), sin ambigüedad sobre qué pantalla consume cada dato (§5, §12, §14, §15).
