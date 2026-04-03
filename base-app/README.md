# TrailBlazer Auto

TrailBlazer Auto is a full-stack car discovery and dealership management application. It includes a public catalogue for browsing premium vehicles and an admin area for managing inventory, media, and profile information.

## Architecture

TrailBlazer Auto uses the following services:

- `frontend`: React + Vite development server on port `5173` for local development
- `backend`: Express + Sequelize API on port `3000`
- `postgres`: PostgreSQL database on port `5432`
- `nginx`: reverse proxy and public entrypoint on port `80`

Local development uses the Vite dev server behind nginx. Production-style ECS deployment uses a built frontend served by nginx.

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Tailwind CSS utilities
- Framer Motion

### Backend

- Node.js
- Express
- Sequelize
- PostgreSQL
- JWT authentication

### Infrastructure

- Docker
- Docker Compose
- nginx
- Amazon ECS / Fargate artifacts

## Main Features

- Polished public landing page
- Car catalogue with rich cards and filtering/search support
- Car details page with pricing, specifications, gallery, and other metadata
- Admin registration and login
- Admin dashboard and inventory management
- Public and private seed data for evaluation

## Local Development

### Prerequisites

- Docker Desktop
- Node.js (only needed if you want to run tests from the host)

### Start the application

From the `base-app` directory:

```bash
docker compose up -d --build
```

### Access points

- App through nginx: [http://localhost](http://localhost)
- Frontend dev server: [http://localhost:5173](http://localhost:5173)
- Backend health endpoint: [http://localhost:3000/health](http://localhost:3000/health)

## Private Evaluation Setup

The repository includes a private compose override and private seed script for evaluation.

From `base-app`, you can combine the public and private compose files:

```bash
docker compose -f docker-compose.yml -f ../evaluation/docker-compose.private.yml up --build
```

The private setup changes seeded data and backend environment values for evaluation.

## Tests

Playwright tests are defined at the repository root.

Install root dependencies once:

```bash
npm install
```

Run all Playwright tests:

```bash
npx playwright test
```

Base public tests live under:

- `tasks/test-cases/base-tests/`

Private evaluation tests live under:

- `evaluation/private-test-cases/`

## ECS Deployment

Production deployment artifacts are stored at the repository root and in `base-app/deployment/`.

Important files:

- `ecs-task-prod.json`
- `build-and-push-ecs.sh`
- `ECS_DEPLOYMENT.md`
- `base-app/src/frontend/Dockerfile.ecs`
- `base-app/deployment/nginx/nginx.ecs.conf`

For the production deployment flow and troubleshooting steps, see:

- [ECS_DEPLOYMENT.md](../ECS_DEPLOYMENT.md)

## Notes

- Local development and ECS production are intentionally different:
  - local uses the Vite dev server
  - ECS uses a built frontend served by nginx
- Backend production port is `3000`
- nginx is the public entrypoint in both local and production-style setups
