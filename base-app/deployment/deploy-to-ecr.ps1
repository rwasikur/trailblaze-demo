# EventHive Docker Image Deployment Script
# This script builds, tags, and pushes all Docker images to AWS ECR

param (
    [switch]$Private
)

# Configuration
$REGION = "ap-south-1"
$ACCOUNT_ID = "822038677286"
$ECR_REGISTRY = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
$AWS_PROFILE = "ramu"
$APPLICATION_NAME = "trailblaze-auto"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host $APPLICATION_NAME" Docker Deployment to AWS ECR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build all images
Write-Host "[1/4] Building Docker images..." -ForegroundColor Green

if ($Private) {
    $IMAGE_TAG = "private"
    Write-Host "Building for PRIVATE environment..." -ForegroundColor Yellow
    docker-compose -f base-app/docker-compose.yml -f evaluation/docker-compose.private.yml build
} else {
    $IMAGE_TAG = "latest"
    Write-Host "Building for PUBLIC environment..." -ForegroundColor Yellow
    docker-compose -f base-app/docker-compose.yml build
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Authenticate to ECR
Write-Host "[2/4] Authenticating to AWS ECR - Profile: $AWS_PROFILE" -ForegroundColor Green
aws ecr get-login-password --region $REGION --profile $AWS_PROFILE | docker login --username AWS --password-stdin $ECR_REGISTRY
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: ECR authentication failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Authentication successful" -ForegroundColor Green
Write-Host ""

# Step 3: Tag all images
Write-Host "[3/4] Tagging images for ECR (Tag: $IMAGE_TAG)..." -ForegroundColor Green

docker tag base-app-backend:latest $ECR_REGISTRY/$APPLICATION_NAME-backend:$IMAGE_TAG
Write-Host "  ✓ Tagged backend" -ForegroundColor Gray

docker tag base-app-frontend:latest $ECR_REGISTRY/$APPLICATION_NAME-frontend:$IMAGE_TAG
Write-Host "  ✓ Tagged frontend" -ForegroundColor Gray

docker tag base-app-nginx:latest $ECR_REGISTRY/$APPLICATION_NAME-nginx:$IMAGE_TAG
Write-Host "  ✓ Tagged nginx" -ForegroundColor Gray

Write-Host "✓ All images tagged successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Push all images
Write-Host "[4/4] Pushing images to ECR..." -ForegroundColor Green

Write-Host "  Pushing backend..." -ForegroundColor Yellow
docker push $ECR_REGISTRY/$APPLICATION_NAME-backend:$IMAGE_TAG
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to push backend image!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Backend pushed" -ForegroundColor Gray

Write-Host "  Pushing frontend... "  -ForegroundColor Yellow
docker push $ECR_REGISTRY/$APPLICATION_NAME-frontend:$IMAGE_TAG
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to push frontend image!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Frontend pushed" -ForegroundColor Gray

Write-Host "  Pushing nginx..." -ForegroundColor Yellow
docker push $ECR_REGISTRY/$APPLICATION_NAME-nginx:$IMAGE_TAG
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to push nginx image!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Nginx pushed" -ForegroundColor Gray

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ All images pushed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Images available at:" -ForegroundColor White
Write-Host "  - $ECR_REGISTRY/$APPLICATION_NAME-backend:$IMAGE_TAG" -ForegroundColor Gray
Write-Host "  - $ECR_REGISTRY/$APPLICATION_NAME-frontend:$IMAGE_TAG" -ForegroundColor Gray
Write-Host "  - $ECR_REGISTRY/$APPLICATION_NAME-nginx:$IMAGE_TAG" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Register ECS task definition: aws ecs register-task-definition --cli-input-json file://deployment/ecs-task.json --region $REGION" -ForegroundColor Gray
Write-Host "  2. Update ECS service or create new task" -ForegroundColor Gray