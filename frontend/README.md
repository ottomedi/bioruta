# Frontend de BioRuta

React 19 + TypeScript + Vite + Tailwind + React Router, con pnpm.

- `pnpm dev`: servidor de desarrollo en http://localhost:5173. Usa el backend local (`http://localhost:8000`) salvo que pongas otra URL en `.env.local` (ver `.env.example`).
- `pnpm build`: build de producción. Toma la URL del backend de `.env.production` (Render).
- `pnpm test`, `pnpm coverage`: tests con Vitest y Testing Library.
- `pnpm lint`, `pnpm format`: oxlint y Prettier.

Despliegue: Vercel con `frontend` como Root Directory (`vercel.json` hace que las rutas de la SPA carguen `index.html`). Con Docker, `Dockerfile` compila y sirve con nginx.

Estructura de `src/`:

- `api/`: llamadas al backend, validadas contra `docs/openapi.json`.
- `components/`: piezas reutilizables.
- `layout/`: barra superior y navegación.
- `pages/`: una por ruta. Hoy son pantallas vacías que se rellenan según el plan.
- `router.tsx`: tabla de rutas.
