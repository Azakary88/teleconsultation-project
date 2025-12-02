# Teleconsultation - Projet (PoC)

**Basé sur :** `/mnt/data/projet.pdf`

## Contenu du dépôt
- `backend/` : scaffold Node.js + Express (endpoints de base)
- `frontend/` : scaffold React Native (squelette)
- `docs/` : OpenAPI (openapi.yaml), diagrammes PlantUML (.puml)
- `docker/` : Dockerfile et docker-compose pour déploiement local
- `scripts/` : scripts d'initialisation et d'aide

## Objectif
Ce dépôt fournit un point de départ prêt à l'emploi pour une application mobile de téléconsultation :
- API REST avec endpoints d'auth, utilisateurs, rendez-vous, prescriptions
- Schémas OpenAPI pour documentation
- Diagrammes UML (PlantUML) pour cas d'usage & classes
- Docker + Compose pour exécution locale rapide

## Démarrage rapide (démo PoC)
1. Extraire l'archive et se placer dans `backend/` :
   ```bash
   cd backend
   npm install
   node server.js
   ```
2. Le serveur écoute par défaut sur `http://localhost:3000`.

## Notes
- Les diagrammes UML sont fournis au format PlantUML (.puml) — vous pouvez les ouvrir avec un rendu PlantUML (local ou service en ligne).
- Le fichier source original fourni par l'utilisateur est inclus comme référence : `/mnt/data/projet.pdf`.


## Sujets additionnels automatisés
- Rendu PlantUML via Docker : `docker/plantuml_render.sh`
- Swagger UI Docker Compose : `docker/docker-compose.swagger.yml` (port 8080)
- CI : `.github/workflows/ci.yml`
