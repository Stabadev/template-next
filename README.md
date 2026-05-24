# Template Next

Socle reutilisable pour demarrer de petites applications Next.js auto-hebergees avec un espace d'administration simple, une base PostgreSQL et un deploiement Docker Compose.

## Stack

- Next.js avec App Router
- TypeScript
- authentification admin simple par cookie httpOnly signe
- Prisma
- PostgreSQL
- Docker Compose
- stockage persistant local prepare via `data/uploads`

Le template fournit une page publique `/`, une page de connexion `/admin/login` et une page admin protegee `/admin`.

Le dossier `data/uploads` est monte de maniere persistante pour de futurs fichiers. Il n'existe pas encore de fonctionnalite applicative d'upload ni de route d'upload dans ce socle.

## Variables d'environnement

Copier le fichier d'exemple :

```bash
cp .env.example .env
```

Variables principales :

- `POSTGRES_USER` : utilisateur PostgreSQL
- `POSTGRES_PASSWORD` : mot de passe PostgreSQL
- `POSTGRES_DB` : base PostgreSQL
- `DATABASE_URL` : URL PostgreSQL utilisee par Prisma hors Docker
- `ADMIN_PASSWORD_HASH` : hash bcrypt du mot de passe admin
- `SESSION_SECRET` : secret long et aleatoire pour signer le cookie de session
- `UPLOAD_DIR` : emplacement des fichiers persistants, `/data/uploads` dans Docker
- `APP_PORT` : port expose sur l'hote pour acceder a l'application

Generer un hash bcrypt pour le mot de passe admin :

```bash
npm install
npm run password:hash -- "votre-mot-de-passe"
```

### Important : hash bcrypt avec Docker Compose

Les hash bcrypt contiennent des caracteres `$`. Dans `.env`, avec Docker Compose, le hash doit etre entoure de quotes simples :

```bash
ADMIN_PASSWORD_HASH='$2a$12$...'
```

Ne mettez pas de backslash avant les `$`.

Generer un secret de session :

```bash
openssl rand -base64 32
```

## Demarrage local avec Docker

1. Copier la configuration :

```bash
cp .env.example .env
```

2. Dans `.env`, choisir un `APP_PORT` libre, par exemple :

```dotenv
APP_PORT=3013
```

Verifier que ce port n'est pas deja utilise par une autre application ou un autre conteneur.

3. Creer les dossiers persistants :

```bash
mkdir -p data/postgres data/uploads
```

4. Construire et demarrer les services :

```bash
docker compose up -d --build
```

5. Appliquer les migrations existantes dans le conteneur :

```bash
docker compose exec app npx prisma migrate deploy
```

6. Ouvrir l'application :

```text
http://localhost:<APP_PORT>
```

Par exemple, avec `APP_PORT=3013` :

```text
http://localhost:3013
```

## Ports Docker

L'application Next.js ecoute sur le port interne `3000` dans son conteneur.

Docker Compose publie ce port sur le port hote defini par `APP_PORT` :

```text
127.0.0.1:<APP_PORT> -> app:3000
```

Il n'est donc pas necessaire de changer le port interne `3000` pour executer plusieurs applications : il faut attribuer un `APP_PORT` distinct a chaque instance.

PostgreSQL reste accessible uniquement dans le reseau Docker via `db:5432` et n'est pas expose sur l'hote par defaut.

## Commandes utiles

Verifier l'etat des services :

```bash
docker compose ps
```

Afficher les derniers logs de l'application :

```bash
docker compose logs app --tail=80
```

Appliquer les migrations Prisma existantes :

```bash
docker compose exec app npx prisma migrate deploy
```

Arreter et supprimer les conteneurs :

```bash
docker compose down
```

## Stockage persistant

Les donnees persistantes sont conservees dans des dossiers explicites du projet :

```text
./data/postgres
./data/uploads
```

`./data/postgres` contient les donnees PostgreSQL.

`./data/uploads` est un volume local pret pour de futurs fichiers applicatifs. Le template ne fournit pas encore l'implementation d'un upload.

Le dossier `./data/` est ignore par Git et ne doit pas etre commite.

## Deploiement VPS

Structure type sur le serveur :

```text
/opt/apps/template-next/
├── docker-compose.yml
├── .env
├── data/
│   ├── postgres/
│   └── uploads/
```

Principes de deploiement :

- placer le projet dans `/opt/apps/template-next`
- conserver le fichier `.env` uniquement sur le serveur avec des secrets forts
- attribuer un `APP_PORT` dedie a cette application
- creer `data/postgres` et `data/uploads` pour la persistance
- lancer les services avec `docker compose up -d --build`
- appliquer les migrations avec `docker compose exec app npx prisma migrate deploy`

Le compose publie l'application sur `127.0.0.1:<APP_PORT>`, ce qui permet a Caddy installe sur l'hote de servir de reverse proxy HTTPS :

```caddyfile
app.example.com {
    reverse_proxy 127.0.0.1:<APP_PORT>
}
```

Les donnees PostgreSQL et le volume prepare pour les fichiers restent persistants respectivement dans `data/postgres` et `data/uploads`.

## Auth admin

L'authentification admin utilise :

- `ADMIN_PASSWORD_HASH` pour verifier le mot de passe avec bcrypt
- `SESSION_SECRET` pour signer un cookie httpOnly
- une duree de session de 8 heures

Le secret et le hash ne sont jamais exposes cote client.
