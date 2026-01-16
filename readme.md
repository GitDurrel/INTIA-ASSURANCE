# INTIA Assurance – Plateforme de Gestion Clients & Assurances

## 1. Présentation
Cette application web permet à **INTIA Assurance** de gérer :
- les **clients**
- les **contrats d’assurance**
- les **agences** (Douala, Yaoundé)
- les **statistiques administratives**

L’architecture est basée sur :
- **Backend** : NestJS + Prisma
- **Base de données** : PostgreSQL
- **Frontend** : React + PrimeReact
- **Conteneurisation** : Docker (PostgreSQL)

---

## 2. Prérequis
Avant l’installation, s’assurer d’avoir :
- Node.js >= 18
- npm ou yarn
- Docker & Docker Compose
- Git

---

## 3. Installation du Backend (API NestJS)

### 3.1 Cloner le projet
```bash
git clone <url-du-repo>
cd api-nest
```

### 3.2 Installer les dépendances
```bash
npm install
```

### 3.2 Configuration des variables d’environnement
Créer un fichier .env à la racine du backend 
```bash
DATABASE_URL=postgresql://api_user:api_pass@localhost:5433/api_nest?schema=public
```

## 4. Lancement de la base de données (PostgreSQL avec Docker)

### 4.1 Création du fichier `docker-compose.yml`

```yaml
services:
  db:
    image: postgres:16
    container_name: api_nest_postgres
    environment:
      POSTGRES_USER: api_user
      POSTGRES_PASSWORD: api_pass
      POSTGRES_DB: api_nest
    ports:
      - "5433:5432"
    volumes:
      - api_nest_pgdata:/var/lib/postgresql/data

volumes:
  api_nest_pgdata:
```

### 4.2 Démarrage de la base de données
```bash
docker compose up -d
```

### 4.3 Vérification du conteneur
```bash
docker ps
```

### 5. Initialisation de la base de données
#### 5.1 Génération du client Prisma
```bash
npx prisma generate
```

#### 5.2 Application des migrations
```bash
npx prisma migrate dev --name init
```

### 6. Démarrage du backend
```bash
npm run start:dev
```
Accès à l’API

L’API est accessible à l’adresse suivante :

```bash
http://localhost:3000
```