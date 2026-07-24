# Lumen — App de finanzas personales

Lumen es una app de finanzas personales en **español (es-ES)**: movimientos (gastos/ingresos),
presupuestos por categoría, cuentas bancarias (solo lectura), suscripciones/recurrentes,
metas de ahorro, informes por movimiento con insights, y notificaciones. Estética
**glassmorphism profundo** sobre fondo casi negro.

**Estado actual: frontend + backend real en Java** (`server-java/`: Spring Boot 3 + JPA +
Postgres/Supabase, arquitectura hexagonal). El frontend habla con él vía `src/lib/httpApi.ts`,
que `src/mocks/api.ts` reexporta — por eso las pantallas siguen importando de `@/mocks/api`.
El backend Node original (Fastify/Prisma) está retirado; queda recuperable en el tag de git
`backend-node-final`. La spec completa de diseño y datos vive en
`design_handoff_lumen_finanzas/README.md` (léela antes de tocar tokens, entidades o
endpoints — es la fuente de verdad) y el prototipo visual en
`design_handoff_lumen_finanzas/Finanzas UI Kit.dc.html` (solo referencia, no se copia).

## Stack

- React 18 + Vite + TypeScript, web responsive (móvil 390px primero; PC/tablet después).
- Sin librería de componentes UI de terceros: sistema de diseño propio en `src/components/`
  que replica el §4 del README (glass, botones, chips, campos…).
- Gráficos: SVG propio (donut, barras, línea) — sin librería pesada.
- Iconos: `@phosphor-icons/react` (peso `light`, `fill` para activos). Logos de banco:
  Simple Icons (`cdn.simpleicons.org`).
- Fuente: **Outfit** (Google Fonts), pesos 200–600.
- Routing: `react-router-dom`.

## Convenciones importantes

- **Código y comentarios en español.** Nombres de componentes, funciones y variables en
  español, claros y fáciles de modificar (`FilaMovimiento`, `formatearEuros`,
  `usarPresupuestos`). Excepción: los campos que vienen del contrato de datos del README
  §8/§11 (p.ej. `category_id`, `amount`, `is_recurring`) se mantienen tal cual están
  especificados, para no romper la correspondencia con el futuro backend.
- **Importes en céntimos enteros** (nunca floats para dinero). Formatear a es-ES con
  `src/lib/formato.ts`: `1.284,50 €` (coma decimal, punto de miles, símbolo tras el número).
- **Fechas en UTC**, formateadas en es-ES ("17 jul · 14:32", "Hoy", "Ayer", "hace 2 h").
- **Tokens de diseño = valores literales del §4**, no aproximaciones. Viven en
  `src/styles/tokens.css` (variables CSS) y `src/theme/tokens.ts` (mismos valores tipados
  para JS/SVG). Si un valor no está en el README, no se inventa: se pregunta o se sigue el
  patrón más cercano ya definido.
- **Entidades y endpoints deben coincidir exactamente con §8 y §11** del README (mismos
  campos, mismos nombres de operación), en las dos puntas: `src/lib/httpApi.ts` y los
  controllers de `server-java/`.
- **Cuidado con el JSON del backend**: Jackson va en `SNAKE_CASE` global porque el contrato
  de entidades del §8 lo es, pero los DTOs derivados del §15 (resumen, cashflow, informe…)
  van en español **camelCase** y el frontend los lee así — llevan `@JsonNaming` propio.
  Los booleanos `is_*` necesitan que el campo Java se llame `recurring`/`connected`/`system`
  (no `isRecurring`), o Jackson emite la clave dos veces. Todo esto está blindado en
  `server-java/src/test/java/com/lumen/backend/ContratoJsonTest.java`: si tocas un DTO o
  una entidad, ese test es el que avisa.
- **Los PATCH son parciales de verdad**: distinguen "campo ausente" (no se toca) de "campo
  a null" (se borra), vía `PatchBody` + el `Set<String> presentes` de los records `Cambios`.
  No vuelvas a asignar campos sin comprobar presencia: vacía notas y categorías ajenas.
- **`prefers-reduced-motion`**: todas las animaciones (glass, entrada de pantalla, spinners)
  deben respetarlo.
- Radios "casi afilados" (4–10px, pills 999px) — no usar radios grandes tipo iOS genérico.

## Flujo de trabajo con el usuario

- El usuario dio **autoaccept** para esta construcción inicial del frontend (2026-07-18):
  se avanza por las fases del plan sin pedir confirmación en cada paso. Si en el futuro
  no hay un autoaccept explícito, volver a parar entre secciones/fases antes de continuar.
- El usuario quiere exprimir el detalle del handoff: no simplificar entidades, pantallas
  ni variantes (p.ej. las 11 variantes A–K del informe de movimiento §5.4 se implementan
  todas mediante una plantilla parametrizada, no se recortan).

## Estructura del repo

```
design_handoff_lumen_finanzas/   ← spec de diseño (no tocar, es la fuente de verdad)
src/
  main.tsx, App.tsx, router.tsx
  styles/            tokens.css, global.css (reset, keyframes, prefers-reduced-motion)
  theme/tokens.ts     tokens tipados (colores, categorías, radios, sombras)
  lib/                formato.ts (es-ES), iconos.tsx, derive.ts (cálculos §8/§15)
  types/              entidades §8 (User, Account, Category, Transaction, Recurring,
                       Budget, SavingsGoal, Notification)
  mocks/              api.ts — hoy solo reexporta lib/httpApi.ts (backend real)
  components/         sistema de diseño reutilizable (glass, botones, campos, gráficos…)
  features/           pantallas, una carpeta por sección del §5
server-java/          backend real (Spring Boot 3, Java 21, hexagonal)
  domain/model        entidades §8 puras, sin JPA
  application/        service/ (casos de uso) + port/out/ (puertos de repositorio)
  infrastructure/     web/ (controllers, seguridad JWT), persistence/ (JPA + adaptadores),
                       scheduling/ (job de recurrentes), seed/ (perfil "seed")
  resources/db/migration/  esquema en Flyway (V1__init.sql)
```
