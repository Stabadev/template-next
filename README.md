# Juliedash

Socle minimal Next.js pour Juliedash, une future application de gestion simple pour praticienne bien-etre.

Ce jalon contient seulement :

- une page publique `/`
- une page admin protegee `/admin`
- une page de connexion `/admin/login`
- une auth admin simple par cookie httpOnly signe
- Prisma avec PostgreSQL
- Docker et Docker Compose avec bind mounts explicites

## Variables d'environnement

Copier l'exemple :

```bash
cp .env.example .env
```

Variables principales :

- `DATABASE_URL` : URL PostgreSQL utilisee par Prisma hors Docker, par exemple avec un PostgreSQL local
- `POSTGRES_USER` : utilisateur PostgreSQL
- `POSTGRES_PASSWORD` : mot de passe PostgreSQL
- `POSTGRES_DB` : base PostgreSQL
- `ADMIN_PASSWORD_HASH` : hash bcrypt du mot de passe admin
- `SESSION_SECRET` : secret long et aleatoire pour signer le cookie de session
- `UPLOAD_DIR` : dossier des futurs fichiers uploades, par defaut `/data/uploads` dans Docker

Generer le hash bcrypt du mot de passe admin :

```bash
npm install
npm run password:hash -- "votre-mot-de-passe"
```

Copier ensuite la valeur affichee dans `ADMIN_PASSWORD_HASH`.

Dans `.env`, gardez le hash entre apostrophes simples pour eviter que Docker Compose interprete les `$` du hash bcrypt :

```bash
ADMIN_PASSWORD_HASH='$2a$12$...'
```

Generer un secret de session :

```bash
openssl rand -base64 32
```

## Installation locale

Installer les dependances :

```bash
npm install
```

Si vous avez un PostgreSQL local expose sur l'hote, renseigner `DATABASE_URL`, puis appliquer les migrations :

```bash
npm run prisma:deploy
```

Si vous utilisez PostgreSQL via Docker Compose, appliquez les migrations depuis le conteneur app, car la base n'est pas exposee sur l'hote :

```bash
mkdir -p data/postgres data/uploads
docker compose up -d db
docker compose run --rm app npx prisma migrate deploy
```

Lancer Next.js en developpement :

```bash
npm run dev
```

L'application est disponible sur :

```text
http://localhost:3000
```

## Commandes Prisma

Generer le client Prisma :

```bash
npm run prisma:generate
```

Creer une migration en developpement apres modification du schema :

```bash
npm run prisma:migrate
```

Appliquer les migrations existantes :

```bash
npm run prisma:deploy
```

## Lancement avec Docker

Creer les dossiers persistants :

```bash
mkdir -p data/postgres data/uploads
```

Construire et lancer les services :

```bash
docker compose up --build
```

Appliquer les migrations dans le conteneur app :

```bash
docker compose exec app npx prisma migrate deploy
```

L'application Docker est exposee localement sur :

```text
http://127.0.0.1:3013
```

PostgreSQL n'est pas expose sur l'hote par defaut. L'app le joint uniquement dans le reseau Docker via `db:5432`.

## Stockage persistant

Les donnees persistantes sont stockees dans des dossiers explicites du projet :

```text
./data/postgres
./data/uploads
```

`./data/postgres` contient les donnees PostgreSQL.

`./data/uploads` est prevu pour les futurs fichiers stockes par l'application.

Le dossier `./data/` est ignore par Git et ne doit pas etre commite. Cette approche evite les volumes Docker anonymes ou nommes caches.

## Deploiement VPS

Structure cible :

```text
/opt/apps/juliedash/
├── docker-compose.yml
├── .env
├── data/
│   ├── postgres/
│   └── uploads/
```

Sur VPS, Caddy pourra servir de reverse proxy HTTPS vers le service app expose en interne. Le compose actuel publie l'app sur `127.0.0.1:${APP_PORT:-3013}`, ce qui convient a un proxy local sur la machine.

La base PostgreSQL reste uniquement accessible dans le reseau Docker, via `db:5432`. Elle n'a pas de mapping de port hote.

Avant de deployer :

- renseigner `.env` avec des secrets forts
- creer `data/postgres` et `data/uploads`
- lancer `docker compose up -d --build`
- appliquer `docker compose exec app npx prisma migrate deploy`

## Auth admin

L'authentification admin utilise :

- `ADMIN_PASSWORD_HASH` pour verifier le mot de passe avec bcrypt
- `SESSION_SECRET` pour signer un cookie httpOnly
- une duree de session de 8 heures

Le secret et le hash ne sont jamais exposes cote client.
