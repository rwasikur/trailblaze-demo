# Quick script to authenticate and push images to ECR
# Run this after building images with docker-compose build

$REGION = "ap-south-1"
$ACCOUNT_ID = "822038677286"
$ECR_REGISTRY = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
$AWS_PROFILE = "ramu"

Write-Host "Authenticating to AWS ECR..." -ForegroundColor Green
aws ecr get-login-password --region $REGION --profile $AWS_PROFILE | docker login --username AWS --password-stdin $ECR_REGISTRY

if ($LASTEXITCODE -ne 0) {
    Write-Host "Authentication failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nPushing backend..." -ForegroundColor Yellow
docker push $ECR_REGISTRY/survey-builder-pro-backend:latest

Write-Host "`nPushing frontend..." -ForegroundColor Yellow
docker push $ECR_REGISTRY/survey-builder-pro-frontend:latest

Write-Host "`nPushing nginx..." -ForegroundColor Yellow
docker push $ECR_REGISTRY/survey-builder-pro-nginx:latest

Write-Host "`nAll images pushed successfully!" -ForegroundColor Green