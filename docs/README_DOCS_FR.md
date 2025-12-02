# Documentation et scripts utiles

## Rendu PlantUML (qualité vectorielle)
Pour rendre proprement les fichiers `.puml` en SVG/PNG, utilisez le script Docker fourni :

```bash
# depuis la racine du projet
chmod +x docker/plantuml_render.sh
./docker/plantuml_render.sh
```

Le script utilise l'image `plantuml/plantuml` pour générer des fichiers SVG dans `docs/uml_rendered_plantuml/`.

## Swagger UI (visualiser OpenAPI)
Docker Compose fourni pour exposer Swagger UI sur le port `8080` :

```bash
docker compose -f docker/docker-compose.swagger.yml up --build
```
Puis ouvrez : http://localhost:8080

## Remarque sur le fichier source
Le fichier original PDF que vous avez uploadé est inclus comme référence : `/mnt/data/projet.pdf`
(chemin local sur l'environnement où le dépôt a été généré). Si vous utilisez des outils automatiques qui
recevront un URL, transmettez ce chemin et l'infrastructure convertira en URL accessible.
