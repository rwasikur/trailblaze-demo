# ECS Deployment Guide

## 1. Architecture Overview

TrailBlazer Auto uses three runtime containers in ECS:

- `frontend-nginx`: serves the built React frontend on port `80`
- `backend`: runs the Express API on port `3000`
- `db`: runs PostgreSQL on port `5432`

The frontend container serves static files and proxies `/api`, `/uploads`, and `/health` to the backend over `localhost`, which matches ECS `awsvpc` networking.

## 2. Prerequisites

Before deploying, make sure you have:

- AWS CLI installed and authenticated
- Docker installed and running
- permission to create and push to ECR repositories
- permission to register ECS task definitions and update ECS services

## 3. Build and Push Images

From the repository root:

```bash
chmod +x build-and-push-ecs.sh
./build-and-push-ecs.sh
```

The script will:

- log in to ECR
- create ECR repositories if they do not exist
- build the backend image from `base-app/src/backend`
- build the production frontend image from `base-app/src/frontend/Dockerfile.ecs`
- push both images to ECR

Before running the script, replace the placeholder `ACCOUNT_ID` in:

- `build-and-push-ecs.sh`
- `ecs-task-prod.json`

## 4. Register the ECS Task Definition

After pushing the images:

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-prod.json --region us-east-1
```

## 5. Create or Update the ECS Service

If the service does not exist yet, create it in your ECS cluster using the registered task definition.

If it already exists, update it:

```bash
aws ecs update-service \
  --cluster YOUR_CLUSTER_NAME \
  --service YOUR_SERVICE_NAME \
  --task-definition trailblaze-auto-prod-task \
  --force-new-deployment \
  --region us-east-1
```

## 6. Required Configuration Notes

- Backend production port is `3000`
- Frontend public port is `80`
- PostgreSQL port is `5432`
- `JWT_SECRET` in `ecs-task-prod.json` must be replaced with a secure secret before deployment
- If you use a managed database instead of a containerized Postgres service, update `DATABASE_URL` accordingly

## 7. Troubleshooting

### Backend health check fails

Check:

- the backend container is listening on port `3000`
- `/health` returns HTTP `200`
- `DATABASE_URL` points to the correct Postgres instance

### Frontend loads but API calls fail

Check:

- `base-app/src/frontend/nginx.ecs.conf` proxies `/api` to `http://localhost:3000`
- backend container is healthy

### Task starts but stops quickly

Check CloudWatch logs for:

- backend startup errors
- database connection errors
- missing environment variables

## 8. Monitoring and Logs

All containers in the task use the `awslogs` log driver.

Recommended checks:

- ECS task health status
- backend `/health` response
- CloudWatch logs for `frontend-nginx`, `backend`, and `db`

## 9. Local vs ECS

Local development uses:

- Vite dev server on port `5173`
- Docker Compose routing through local nginx

ECS production uses:

- built frontend files
- nginx serving static frontend on port `80`
- backend on port `3000`

This separation is intentional so local development stays fast while production remains stable and deployment-friendly.
