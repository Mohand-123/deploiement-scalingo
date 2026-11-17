# TP Déploiement Scalingo

Mettre en production un client React/TypeScript et une API FastAPI/Python, avec une base PostgreSQL managée, sur Scalingo.

Module Déploiement — Bachelor Informatique (Ynov).

## Architecture

Deux applications Scalingo et une base PostgreSQL managée :

- **`client/`** : React + TypeScript (Vite). Buildpack Node.js. Sert le build statique, appelle l'API en JSON via `fetch`. L'URL de l'API (`VITE_API_URL`) est figée au build.
- **`api/`** : FastAPI + Python. Buildpack Python, `uvicorn` sur `$PORT`. Seule l'API parle à la base PostgreSQL.
- **Addon PostgreSQL** (Starter 512), relié à l'API via `SCALINGO_POSTGRESQL_URL`.

```
Navigateur → client (Scalingo app 1, HTTPS) → appels fetch JSON → api (Scalingo app 2) → PostgreSQL (addon)
```

_Schéma détaillé et choix d'architecture à compléter au fil des étapes._

## Développement local

Prérequis : Node.js, Python 3.12, Docker.

```bash
# 1. Base PostgreSQL locale (jamais SQLite, voir le sujet)
docker compose up -d postgres

# 2. API
cd api
python -m venv .venv && source .venv/Scripts/activate   # ou .venv/bin/activate sous macOS/Linux
pip install -r requirements-dev.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# 3. Client (dans un second terminal)
cd client
npm install
cp .env.example .env
npm run dev
```

## Procédure de déploiement

_À documenter aux étapes 2-3 (création des apps Scalingo, buildpacks, migrations en production)._

## Variables d'environnement

| Variable | Partie | Rôle | Défaut / origine |
| --- | --- | --- | --- |
| `SCALINGO_POSTGRESQL_URL` | api | Connexion PostgreSQL | injectée automatiquement par l'addon, en production uniquement |
| `DATABASE_URL` | api | Connexion PostgreSQL en local (repli si `SCALINGO_POSTGRESQL_URL` est absente) | `api/.env.example` |
| `CORS_ORIGINS` | api | Origines web autorisées, séparées par des virgules | `api/.env.example` |
| `PORT` | api, client | Port d'écoute, fourni par Scalingo en production | — |
| `VITE_API_URL` | client | Adresse de l'API, figée au build par Vite | `client/.env.example` |

(Les valeurs réelles ne sont jamais commitées : voir `api/.env.example` et `client/.env.example`.)

## Coût d'hébergement

| | Estimé | Réel |
| --- | --- | --- |
| App client | | |
| App API | | |
| Addon PostgreSQL | | |
| **Total mensuel** | | |

_Estimation à faire avec le simulateur de prix Scalingo avant de créer les ressources (étape 2)._

## En cas de panne

_À documenter à l'étape 5 : commandes de logs, rollback, sauvegarde et restauration de la base, réellement testées._
