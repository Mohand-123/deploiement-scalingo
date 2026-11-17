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

## Procédure de déploiement

_À documenter à l'étape 2-3 (création des apps Scalingo, Procfile, migrations, buildpacks)._

## Variables d'environnement

| Variable | Partie | Rôle |
| --- | --- | --- |
| _à compléter_ | | |

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
