from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .errors import registrar_errores
from .schemas import Health

VERSION = "0.1.0"

app = FastAPI(title="BioRuta API", version=VERSION)
registrar_errores(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=Health, operation_id="getHealth")
def health() -> Health:
    return Health(estado="ok", version=VERSION)
