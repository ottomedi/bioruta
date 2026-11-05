from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

JWT_SECRET_POR_DEFECTO = "solo-para-desarrollo-cambiar"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(".env", "../.env"), extra="ignore")

    database_url: str = "sqlite:///./bioruta.db"
    cors_origins: str = "http://localhost:5173"
    environment: str = "dev"

    # Usuario de demo (lo crea el seed). La contraseña va solo en el .env, nunca en el código.
    demo_email: str = "demo@bioruta.es"
    demo_password: str | None = None
    demo_habilitado: bool = True  # POST /auth/demo devuelve 403 si es False

    # Sesión (JWT)
    jwt_secret: str = JWT_SECRET_POR_DEFECTO
    jwt_algoritmo: str = "HS256"
    jwt_minutos: int = 480

    @model_validator(mode="after")
    def _exigir_secreto_en_produccion(self):
        if self.environment == "prod" and self.jwt_secret == JWT_SECRET_POR_DEFECTO:
            raise ValueError("En producción hay que definir JWT_SECRET.")
        return self


settings = Settings()
