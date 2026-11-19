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

Deux apps Scalingo, région `osc-fr1` (Paris), liées au dépôt GitHub [`Mohand-123/deploiement-scalingo`](https://github.com/Mohand-123/deploiement-scalingo) avec déploiement automatique sur `master` (voir « Automatiser ») :

- **API** : `mohand-deploiement-api` — https://mohand-deploiement-api.osc-fr1.scalingo.io
- **Client** : `mohand-deploiement-client` — https://mohand-deploiement-client.osc-fr1.scalingo.io

Mise en place (faite une fois) :

```bash
scalingo create mohand-deploiement-api --remote scalingo-api
scalingo create mohand-deploiement-client --remote scalingo-client

scalingo --app mohand-deploiement-api env-set PROJECT_DIR=api
scalingo --app mohand-deploiement-client env-set PROJECT_DIR=client

scalingo --app mohand-deploiement-api addons-add postgresql postgresql-starter-512
# SCALINGO_POSTGRESQL_URL est alors injectée automatiquement

scalingo --app mohand-deploiement-api env-set CORS_ORIGINS=https://mohand-deploiement-client.osc-fr1.scalingo.io
scalingo --app mohand-deploiement-client env-set VITE_API_URL=https://mohand-deploiement-api.osc-fr1.scalingo.io

# Taille S suffisante pour les deux apps (voir « Coût »)
scalingo --app mohand-deploiement-api scale web:1:S
scalingo --app mohand-deploiement-client scale web:1:S
```

Pour déployer une mise à jour : `git push origin master`. Les deux apps sont liées au dépôt GitHub (compte Mohand-123, intégration SCM) avec déploiement automatique activé sur `master` — chaque push y déploie l'API et le client sans action manuelle. Les remotes `scalingo-api` / `scalingo-client` restent disponibles en secours pour un déploiement manuel (`git push scalingo-api master`).

Contrôlé après déploiement : `GET /health` et `GET /docs` répondent `200` sur l'API ; le client affiche la liste des notes et permet d'en créer une (écriture puis lecture réelles en base), sans erreur CORS dans la console.

## Automatiser

- Dépôt GitHub : https://github.com/Mohand-123/deploiement-scalingo (privé)
- Intégration SCM Scalingo ↔ GitHub : compte GitHub `Mohand-123` connecté dans Account > SCM Integrations
- Les deux apps sont liées à ce dépôt, branche `master`, déploiement automatique activé (Deploy > Configuration > GitHub)
- CI : `.github/workflows/api.yml` et `client.yml` — lint (ruff) + tests (pytest) côté API, build (tsc + vite build) côté client, déclenchés uniquement sur le dossier modifié (`api/**`, `client/**`)

⚠️ **Limite connue** : GitHub Actions ne s'exécute pas actuellement sur ce compte GitHub (`Mohand-123`) — le budget "Actions" y est fixé à 0 € et son édition exige une carte bancaire enregistrée (`Settings > Billing and licensing > Payment information`), non faite à ce jour. Les workflows sont écrits et validés en local (`ruff check .` et `pytest -q` passent). Conséquence vérifiée en conditions réelles : un commit cassant volontairement l'API (import inexistant) a tout de même été déployé et a planté en production (voir « En cas de panne »), alors que des GitHub Actions vertes auraient dû l'en empêcher — la CI ne protège donc pas encore le déploiement sur ce compte, uniquement à cause de ce blocage de facturation, pas du code.

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

### Lire les logs

```bash
scalingo --app mohand-deploiement-api logs --lines 200
scalingo --app mohand-deploiement-api logs --addon ad-232c660f-de28-4cb7-ac27-a9061c8839b6 --lines 200  # logs de la base
```

**Testé réellement** le 19/11 : un import cassé (`import nonexistent_module_for_incident_drill`) a été poussé volontairement sur `api/app/main.py`. Le build a réussi mais le déploiement est passé en statut `crashed-error` ; `/health` a continué à répondre (l'ancien conteneur restait actif) jusqu'à ce que `scalingo apps` confirme le crash. Les logs ont immédiatement montré la cause :

```
ModuleNotFoundError: No module named 'nonexistent_module_for_incident_drill'
```

### Rollback

Les deux apps sont liées à GitHub avec déploiement automatique sur `master` (pas de commande `scalingo rollback` dédiée pour ce mode). Pour revenir en arrière : `git revert <commit-cassé> && git push` — le revert redéclenche l'auto-deploy avec le code d'avant.

**Testé réellement** : le commit cassé ci-dessus a été annulé avec `git revert --no-edit <sha>` puis poussé ; nouveau déploiement en `success` en 48s, `/health` de nouveau à `200`.

### Sauvegarder / restaurer PostgreSQL

```bash
scalingo --app mohand-deploiement-api backups --addon <addon-id>                 # lister les sauvegardes (auto quotidiennes)
scalingo --app mohand-deploiement-api backups-create --addon <addon-id>          # forcer une sauvegarde
scalingo --app mohand-deploiement-api backups-download --addon <addon-id> \
  --backup <backup-id> --output backup.sql.gz                                    # télécharger
```

Restauration (toujours sur une base locale jetable, jamais sur la prod) :

```bash
gunzip backup.sql.gz && tar -xf backup.sql          # l'archive téléchargée est un tar contenant le dump pg_dump custom
pg_restore --no-owner --dbname "$DATABASE_URL" <fichier>.pgsql
```

**Testé réellement** : backup quotidien du 19/11 téléchargé, puis restauré dans un PostgreSQL local jetable (`docker compose`, aligné en version 18 sur l'addon Scalingo — voir ci-dessous). Les données restaurées (table `notes`, 1 ligne réelle) et la version Alembic ont été vérifiées par requête `SELECT`.

⚠️ Point trouvé en testant : l'addon Scalingo tourne en **PostgreSQL 18.6**, alors que `docker-compose.yml` était resté en `postgres:16-alpine` — corrigé en `postgres:18-alpine` pour que l'environnement local corresponde réellement à la prod (sinon un `pg_restore` local échoue avec `unsupported version`, et la parité dev/prod n'est que de façade).

### Metrics (mémoire / CPU)

```bash
scalingo --app mohand-deploiement-api stats
scalingo --app mohand-deploiement-client stats
```

**Relevé réel** le 19/11 (conteneurs S = 256 MiB) :

| App | Mémoire utilisée | Pic | CPU |
| --- | --- | --- | --- |
| API | 78 MiB / 256 MiB (30 %) | 84 MiB | 0 % |
| Client | 164 MiB / 256 MiB (64 %) | 175 MiB | 0 % |

La taille S suffit largement pour l'API ; le client (serveur statique Node) est plus proche de la limite mais reste confortable. À resurveiller si le trafic augmente.
