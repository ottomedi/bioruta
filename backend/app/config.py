from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./bioruta.db"
    cors_origins: str = "http://localhost:5173"
    environment: str = "dev"


settings = Settings()
