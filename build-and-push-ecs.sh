#!/bin/bash
set -e

REGION="us-east-1"
ACCOUNT_ID="ACCOUNT_ID"
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

create_ecr_repo_if_not_exists() {
    REPO_NAME=$1
    if ! aws ecr describe-repositories --repository-names "$REPO_NAME" --region "$REGION" >/dev/null 2>&1; then
        aws ecr create-repository \
            --repository-name "$REPO_NAME" \
            --region "$REGION" \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256
    fi
}

echo "Authenticating Docker with ECR..."
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

echo "Ensuring ECR repositories exist..."
create_ecr_repo_if_not_exists "trailblaze-auto-backend"
create_ecr_repo_if_not_exists "trailblaze-auto-frontend-prod"

echo "Building backend image..."
cd base-app/src/backend
docker build -t trailblaze-auto-backend:latest .
docker tag trailblaze-auto-backend:latest "${ECR_REGISTRY}/trailblaze-auto-backend:latest"
docker push "${ECR_REGISTRY}/trailblaze-auto-backend:latest"
cd ../../..

echo "Building frontend production image..."
cd base-app/src/frontend
docker build -f Dockerfile.ecs -t trailblaze-auto-frontend-prod:latest .
docker tag trailblaze-auto-frontend-prod:latest "${ECR_REGISTRY}/trailblaze-auto-frontend-prod:latest"
docker push "${ECR_REGISTRY}/trailblaze-auto-frontend-prod:latest"
cd ../../..

echo "All ECS images built and pushed successfully."
