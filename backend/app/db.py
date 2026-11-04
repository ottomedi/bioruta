from sqlalchemy import event
from sqlmodel import Session, create_engine

from .config import settings


def normalizar_url(url: str) -> str:
    # Algunas plataformas dan postgres://, pero el driver necesita postgresql+psycopg://
    for prefijo in ("postgres://", "postgresql://"):
        if url.startswith(prefijo):
            return "postgresql+psycopg://" + url[len(prefijo):]
    return url


URL = normalizar_url(settings.database_url)
es_sqlite = URL.startswith("sqlite")
engine = create_engine(URL, connect_args={"check_same_thread": False} if es_sqlite else {})

if es_sqlite:
    @event.listens_for(engine, "connect")
    def _activar_claves_foraneas(dbapi_conn, _):
        # Sin esto SQLite ignora las claves foráneas y el ON DELETE CASCADE
        cur = dbapi_conn.cursor()
        cur.execute("PRAGMA foreign_keys=ON")
        cur.close()


def get_session():
    with Session(engine) as session:
        yield session
