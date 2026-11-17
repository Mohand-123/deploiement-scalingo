"""Connexion SQLAlchemy à PostgreSQL. Le schéma est géré par Alembic (voir api/alembic/),
jamais par Base.metadata.create_all() : les migrations sont versionnées et rejouées
automatiquement après chaque déploiement (Procfile, process `postdeploy`)."""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(settings.sqlalchemy_database_uri, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
