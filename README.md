# Exam1 - Docker Quickstart

Ce repo contient un frontend React, un backend Express, un gateway et deux microservices (notifications, gestion de stock) plus MongoDB.

## Ce qui a été configuré
- Ajout des Dockerfiles et .dockerignore pour tous les services (frontend, backend, gateway, notifications, stock-management).
- Ajout du service `gateway` (port 8000) et alignement des ports notifications/stock sur 4002/4003 pour coller aux URLs du code.
- Variables d'environnement renseignées dans `docker-compose.yml` (Mongo, JWT, email) pour éviter les crash au démarrage.
- Correction frontend : `react-scripts` fixé en 5.0.1 et `npm install` rejoué pour régénérer le `package-lock.json`.

## Démarrage avec Docker
1) Installer Docker/Docker Compose.
2) À la racine du projet, lancer :
   ```bash
   docker compose up --build
   ```
3) Points d'accès locaux :
   - Frontend : http://localhost:3000
   - Backend API : http://localhost:5000/api
   - Gateway : http://localhost:8000 (routes `/notify`, `/update-stock`)
   - MongoDB : localhost:27018 (exposé) / service `mongo` dans le réseau Docker

## Données de test
- Pour pré-remplir les produits : `docker compose run --rm backend node seeder.js` (ou `cd backend && node seeder.js` si vous utilisez Mongo local).

## Notes
- Les services communiquent entre eux via les hostnames Docker (ex. `http://notifications:4002`).
- Le frontend expose `HOST=0.0.0.0` pour être joignable depuis l'hôte. Remplacez les secrets (JWT, email) avant toute utilisation publique.
