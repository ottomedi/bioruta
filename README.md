# BioRuta

Plantilla para el 8º Hackathon de Boehringer Ingelheim España: planificación de rutas de veterinarios con criterios de bioseguridad.

## Estructura

- `backend/`: API FastAPI
- `frontend/`: app React
- `data/mock/`: datos falsos
- `docs/`: documentación y hoja de reglas

## Arrancar en local

    cp .env.example .env
    docker compose up

## Reglas de trabajo

- `main` siempre desplegable; cada tarea en su rama (`feat/`, `fix/`, `chore/`) y PR pequeña.
- Un entregable no está cerrado si no está en `main`, desplegado y comprobado.
