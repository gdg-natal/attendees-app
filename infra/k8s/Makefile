# GDG Attendees - Kubernetes Infrastructure Makefile

# Variables
NAMESPACE ?= gdg-attendees
DOCKER_REGISTRY ?= localhost:5000
API_IMAGE ?= gdg-attendees-api
WEB_IMAGE ?= attendees-app
TAG ?= latest
ENV ?= development

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

.PHONY: help build push deploy status logs clean

help: ## Display this help message
	@echo "$(BLUE)GDG Attendees - Kubernetes Infrastructure$(NC)"
	@echo ""
	@echo "$(YELLOW)Usage:$(NC)"
	@echo "  make [target] [variables]"
	@echo ""
	@echo "$(YELLOW)Variables:$(NC)"
	@echo "  NAMESPACE        Kubernetes namespace (default: gdg-attendees)"
	@echo "  DOCKER_REGISTRY  Docker registry URL (default: localhost:5000)"
	@echo "  TAG              Docker image tag (default: latest)"
	@echo "  ENV              Environment overlay (development|production)"
	@echo ""
	@echo "$(YELLOW)Targets:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

prerequisites: ## Check if required tools are available
	@echo "$(BLUE)Checking prerequisites...$(NC)"
	@command -v kubectl >/dev/null 2>&1 || { echo "$(RED)kubectl is required but not installed$(NC)"; exit 1; }
	@command -v docker >/dev/null 2>&1 || { echo "$(RED)docker is required but not installed$(NC)"; exit 1; }
	@kubectl cluster-info >/dev/null 2>&1 || { echo "$(RED)Cannot connect to Kubernetes cluster$(NC)"; exit 1; }
	@echo "$(GREEN)Prerequisites check passed$(NC)"

build: prerequisites ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	@echo "Building API image: $(API_IMAGE):$(TAG)"
	@cd ../api && docker build -t $(API_IMAGE):$(TAG) .
	@echo "Building Web image: $(WEB_IMAGE):$(TAG)"
	@cd ../web && docker build -t $(WEB_IMAGE):$(TAG) .
	@echo "$(GREEN)Images built successfully$(NC)"

push: ## Push Docker images to registry
	@if [ "$(DOCKER_REGISTRY)" != "localhost:5000" ]; then \
		echo "$(BLUE)Pushing images to $(DOCKER_REGISTRY)...$(NC)"; \
		docker tag $(API_IMAGE):$(TAG) $(DOCKER_REGISTRY)/$(API_IMAGE):$(TAG); \
		docker push $(DOCKER_REGISTRY)/$(API_IMAGE):$(TAG); \
		docker tag $(WEB_IMAGE):$(TAG) $(DOCKER_REGISTRY)/$(WEB_IMAGE):$(TAG); \
		docker push $(DOCKER_REGISTRY)/$(WEB_IMAGE):$(TAG); \
		echo "$(GREEN)Images pushed to registry$(NC)"; \
	else \
		echo "$(YELLOW)Using local registry, skipping push$(NC)"; \
	fi

deploy-base: prerequisites ## Deploy base manifests without overlays
	@echo "$(BLUE)Deploying base manifests to Kubernetes...$(NC)"
	@kubectl apply -f namespace.yaml
	@kubectl apply -f secrets.yaml
	@kubectl apply -f configmaps.yaml
	@kubectl apply -f services.yaml
	@kubectl apply -f api-deployment.yaml
	@kubectl apply -f web-deployment.yaml
	@kubectl apply -f ingress.yaml
	@kubectl apply -f hpa.yaml
	@kubectl apply -f pdb.yaml
	@kubectl apply -f monitoring.yaml || echo "$(YELLOW)Warning: Monitoring resources failed (Prometheus operator may not be installed)$(NC)"
	@echo "$(GREEN)Base deployment completed$(NC)"

deploy-kustomize: prerequisites ## Deploy using Kustomize overlays
	@echo "$(BLUE)Deploying with Kustomize overlay: $(ENV)$(NC)"
	@if [ -d "overlays/$(ENV)" ]; then \
		kubectl apply -k overlays/$(ENV); \
		echo "$(GREEN)Deployment with $(ENV) overlay completed$(NC)"; \
	else \
		echo "$(RED)Environment overlay '$(ENV)' not found$(NC)"; \
		exit 1; \
	fi

deploy: build push deploy-base wait ## Full deployment (build + push + deploy + wait)

deploy-dev: ENV=development
deploy-dev: build push deploy-kustomize wait ## Deploy development environment

deploy-prod: ENV=production
deploy-prod: build push deploy-kustomize wait ## Deploy production environment

wait: ## Wait for pods to be ready
	@echo "$(BLUE)Waiting for pods to be ready...$(NC)"
	@kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=gdg-attendees -n $(NAMESPACE) --timeout=300s
	@echo "$(GREEN)All pods are ready$(NC)"

status: ## Show deployment status
	@echo "$(BLUE)Current deployment status:$(NC)"
	@echo ""
	@kubectl get pods -n $(NAMESPACE) 2>/dev/null || echo "No pods found in namespace $(NAMESPACE)"
	@echo ""
	@kubectl get services -n $(NAMESPACE) 2>/dev/null || echo "No services found in namespace $(NAMESPACE)"
	@echo ""
	@kubectl get ingress -n $(NAMESPACE) 2>/dev/null || echo "No ingress found in namespace $(NAMESPACE)"

logs-api: ## Show API logs
	@kubectl logs -l app.kubernetes.io/component=api -n $(NAMESPACE) --tail=50 -f

logs-web: ## Show Web logs
	@kubectl logs -l app.kubernetes.io/component=web -n $(NAMESPACE) --tail=50 -f

logs: ## Show all logs
	@kubectl logs -l app.kubernetes.io/name=gdg-attendees -n $(NAMESPACE) --tail=50 -f

describe-pods: ## Describe all pods for troubleshooting
	@kubectl describe pods -l app.kubernetes.io/name=gdg-attendees -n $(NAMESPACE)

port-forward-web: ## Port forward web service to localhost:8080
	@echo "$(BLUE)Port forwarding web service to http://localhost:8080$(NC)"
	@kubectl port-forward svc/web-service 8080:80 -n $(NAMESPACE)

port-forward-api: ## Port forward API service to localhost:3000
	@echo "$(BLUE)Port forwarding API service to http://localhost:3000$(NC)"
	@kubectl port-forward svc/api-service 3000:3000 -n $(NAMESPACE)

scale-api: ## Scale API deployment (usage: make scale-api REPLICAS=5)
	@kubectl scale deployment api-deployment --replicas=$(REPLICAS) -n $(NAMESPACE)
	@echo "$(GREEN)API scaled to $(REPLICAS) replicas$(NC)"

scale-web: ## Scale Web deployment (usage: make scale-web REPLICAS=3)
	@kubectl scale deployment web-deployment --replicas=$(REPLICAS) -n $(NAMESPACE)
	@echo "$(GREEN)Web scaled to $(REPLICAS) replicas$(NC)"

restart-api: ## Rolling restart API deployment
	@kubectl rollout restart deployment/api-deployment -n $(NAMESPACE)
	@echo "$(GREEN)API deployment restarted$(NC)"

restart-web: ## Rolling restart Web deployment
	@kubectl rollout restart deployment/web-deployment -n $(NAMESPACE)
	@echo "$(GREEN)Web deployment restarted$(NC)"

restart: restart-api restart-web ## Rolling restart both deployments

clean: ## Delete all resources
	@echo "$(YELLOW)Cleaning up deployment...$(NC)"
	@kubectl delete namespace $(NAMESPACE) --ignore-not-found=true
	@echo "$(GREEN)Cleanup completed$(NC)"

clean-dev: ## Delete development environment
	@echo "$(YELLOW)Cleaning up development environment...$(NC)"
	@kubectl delete namespace gdg-attendees-dev --ignore-not-found=true
	@echo "$(GREEN)Development cleanup completed$(NC)"

clean-prod: ## Delete production environment
	@echo "$(YELLOW)Cleaning up production environment...$(NC)"
	@kubectl delete namespace gdg-attendees-prod --ignore-not-found=true
	@echo "$(GREEN)Production cleanup completed$(NC)"

test-connectivity: ## Test connectivity to deployed services
	@echo "$(BLUE)Testing service connectivity...$(NC)"
	@kubectl run test-pod --image=curlimages/curl --rm -it --restart=Never -n $(NAMESPACE) -- \
		sh -c "curl -s http://web-service:80/health && echo && curl -s http://api-service:3000/health" || true

validate: ## Validate Kubernetes manifests
	@echo "$(BLUE)Validating Kubernetes manifests...$(NC)"
	@for file in *.yaml; do \
		echo "Validating $$file..."; \
		kubectl apply --dry-run=client -f $$file >/dev/null || exit 1; \
	done
	@echo "$(GREEN)All manifests are valid$(NC)"

validate-kustomize: ## Validate Kustomize overlays
	@echo "$(BLUE)Validating Kustomize overlays...$(NC)"
	@for env in development production; do \
		echo "Validating $$env overlay..."; \
		kubectl apply --dry-run=client -k overlays/$$env >/dev/null || exit 1; \
	done
	@echo "$(GREEN)All overlays are valid$(NC)"

# Development helpers
dev-setup: ## Setup development environment with port forwarding
	@echo "$(BLUE)Setting up development environment...$(NC)"
	@make deploy-dev
	@echo "$(GREEN)Development environment ready!$(NC)"
	@echo "$(YELLOW)To access the application:$(NC)"
	@echo "  Web: make port-forward-web (then visit http://localhost:8080)"
	@echo "  API: make port-forward-api (then visit http://localhost:3000)"

# Production helpers
prod-deploy: ## Deploy to production with safety checks
	@echo "$(YELLOW)Deploying to production...$(NC)"
	@echo "$(RED)WARNING: This will deploy to production!$(NC)"
	@read -p "Are you sure? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	@make deploy-prod
	@echo "$(GREEN)Production deployment completed$(NC)"
