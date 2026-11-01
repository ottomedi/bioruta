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

## Requisitos

- Docker y Docker Compose
- Python 3.14 (solo si ejecutas el backend sin Docker)

## Uso

La API queda en `http://localhost:8000` y la documentación en `http://localhost:8000/docs`.

## Contrato y dominio

- `docs/openapi.json`: contrato de la API acordado (OpenAPI 3.1). Los tipos del frontend se generan de aquí.
- `docs/modelo-dominio.md`: entidades, campos y por qué existe cada uno.
- Un test (`backend/tests/test_contrato.py`) comprueba que el backend no se aleja del contrato.
- Cambios en el contrato: solo de mutuo acuerdo y regenerando los tipos.
