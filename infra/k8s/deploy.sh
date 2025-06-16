#!/bin/bash

# GDG Attendees Application - Kubernetes Deployment Script
# This script builds and deploys both API and Web containers to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="gdg-attendees"
API_IMAGE="gdg-attendees-api:latest"
WEB_IMAGE="attendees-app:latest"
REGISTRY="${DOCKER_REGISTRY:-localhost:5000}"  # Default to local registry

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

build_images() {
    log_info "Building Docker images..."
    
    # Build API image
    log_info "Building API image: $API_IMAGE"
    cd ../api
    docker build -t $API_IMAGE .
    
    # Build Web image
    log_info "Building Web image: $WEB_IMAGE"
    cd ../web
    docker build -t $WEB_IMAGE .
    
    cd ../infra/k8s
    log_success "Docker images built successfully"
}

push_images() {
    if [ "$REGISTRY" != "localhost:5000" ]; then
        log_info "Pushing images to registry: $REGISTRY"
        
        # Tag and push API image
        docker tag $API_IMAGE $REGISTRY/$API_IMAGE
        docker push $REGISTRY/$API_IMAGE
        
        # Tag and push Web image
        docker tag $WEB_IMAGE $REGISTRY/$WEB_IMAGE
        docker push $REGISTRY/$WEB_IMAGE
        
        log_success "Images pushed to registry"
    else
        log_warning "Using local registry, skipping push"
    fi
}

deploy_to_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    # Apply manifests in order
    log_info "Creating namespace..."
    kubectl apply -f namespace.yaml
    
    log_info "Creating secrets..."
    kubectl apply -f secrets.yaml
    
    log_info "Creating configmaps..."
    kubectl apply -f configmaps.yaml
    
    log_info "Creating services..."
    kubectl apply -f services.yaml
    
    log_info "Creating deployments..."
    kubectl apply -f api-deployment.yaml
    kubectl apply -f web-deployment.yaml
    
    log_info "Creating ingress..."
    kubectl apply -f ingress.yaml
    
    log_info "Creating HPA..."
    kubectl apply -f hpa.yaml
    
    log_info "Creating PDB..."
    kubectl apply -f pdb.yaml
    
    log_info "Creating monitoring resources..."
    kubectl apply -f monitoring.yaml || log_warning "Monitoring resources failed (might need Prometheus operator)"
    
    log_success "Deployment completed"
}

wait_for_pods() {
    log_info "Waiting for pods to be ready..."
    
    kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=gdg-attendees -n $NAMESPACE --timeout=300s
    
    log_success "All pods are ready"
}

show_status() {
    log_info "Current deployment status:"
    echo
    kubectl get pods -n $NAMESPACE
    echo
    kubectl get services -n $NAMESPACE
    echo
    kubectl get ingress -n $NAMESPACE
}

show_logs() {
    if [ "$1" = "api" ]; then
        kubectl logs -l app.kubernetes.io/component=api -n $NAMESPACE --tail=50 -f
    elif [ "$1" = "web" ]; then
        kubectl logs -l app.kubernetes.io/component=web -n $NAMESPACE --tail=50 -f
    else
        log_info "Available log options: api, web"
    fi
}

cleanup() {
    log_info "Cleaning up deployment..."
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    log_success "Cleanup completed"
}

# Main script
case "${1:-deploy}" in
    "prerequisites")
        check_prerequisites
        ;;
    "build")
        check_prerequisites
        build_images
        ;;
    "push")
        check_prerequisites
        push_images
        ;;
    "deploy")
        check_prerequisites
        build_images
        push_images
        deploy_to_kubernetes
        wait_for_pods
        show_status
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs $2
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|*)
        echo "Usage: $0 {prerequisites|build|push|deploy|status|logs|cleanup|help}"
        echo
        echo "Commands:"
        echo "  prerequisites  - Check if required tools are available"
        echo "  build         - Build Docker images"
        echo "  push          - Push images to registry"
        echo "  deploy        - Full deployment (build + push + deploy)"
        echo "  status        - Show current deployment status"
        echo "  logs          - Show logs (usage: $0 logs [api|web])"
        echo "  cleanup       - Remove all deployed resources"
        echo "  help          - Show this help message"
        echo
        echo "Environment variables:"
        echo "  DOCKER_REGISTRY - Docker registry URL (default: localhost:5000)"
        ;;
esac
