"""Configuration lue uniquement depuis l'environnement (TP Scalingo, étape 01).

En local : variables définies dans api/.env (copie de .env.example, jamais commité).
En production : Scalingo injecte SCALINGO_POSTGRESQL_URL (addon PostgreSQL) et les
variables définies dans le dashboard ou via `scalingo env-set`.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Scalingo fournit SCALINGO_POSTGRESQL_URL ; DATABASE_URL sert de repli pour le
    # développement local (docker-compose) et les tests.
    scalingo_postgresql_url: str | None = None
    database_url: str = "postgresql://postgres:postgres@localhost:5432/deploiement_scalingo"

    # Liste d'origines séparées par des virgules, ex. http://localhost:5173,https://mon-client.osc-fr1.scalingo.io
    cors_origins: str = "http://localhost:5173"

    @property
    def sqlalchemy_database_uri(self) -> str:
        url = self.scalingo_postgresql_url or self.database_url
        # Scalingo (comme Heroku) fournit un schéma `postgres://` ; SQLAlchemy 2.x
        # n'accepte que `postgresql://`.
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
