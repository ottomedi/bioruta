#!/bin/sh
# Arranque en Render: migra, carga los datos de la demo y levanta la API.
# De momento recarga el seed en cada arranque (la base SQLite del contenedor es efímera).
set -e
alembic upgrade head
python -m app.seed
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
