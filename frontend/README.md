# Frontend de BioRuta

React 19 + TypeScript + Vite + Tailwind + React Router, con pnpm.

- `pnpm dev`: servidor de desarrollo en http://localhost:5173. Usa el backend local (`http://localhost:8000`) salvo que pongas otra URL en `.env.local` (ver `.env.example`).
- `pnpm dev:mocks`: igual, pero sin backend: MSW responde con los datos falsos de `src/mocks` (activa `VITE_USE_MOCKS` desde `.env.mocks`).
- `pnpm gen:api`: regenera `src/api/schema.d.ts` desde `docs/openapi.json`. Hay que lanzarlo cada vez que cambie el contrato; el CI falla si se olvida.
- `pnpm build`: build de producción. Toma la URL del backend de `.env.production` (Render).
- `pnpm test`, `pnpm coverage`: tests con Vitest y Testing Library.
- `pnpm lint`, `pnpm format`: oxlint y Prettier.

Despliegue: Vercel con `frontend` como Root Directory (`vercel.json` hace que las rutas de la SPA carguen `index.html`). Con Docker, `Dockerfile` compila y sirve con nginx.

Estructura de `src/`:

- `api/`: llamadas al backend. `schema.d.ts` es el contrato en tipos (generado, no se edita a mano) y `types.ts` tiene los atajos que usa la app.
- `components/ui/`: componentes base (Button, Card, RiskBadge, DataTable, Toast, EmptyState, Spinner, KpiCard). Se ven todos en `/dev/componentes`.
- `components/`: piezas propias de la app, como el estado del servidor.
- `domain/`: etiquetas en español y nivel visual de riesgo de cada estado.
- `mocks/`: handlers de MSW tipados con el contrato y sus datos falsos.
- `layout/`: barra superior y navegación.
- `pages/`: una por ruta. Hoy son pantallas vacías que se rellenan según el plan.
- `router.tsx`: tabla de rutas.
