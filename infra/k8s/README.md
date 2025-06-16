# GDG Attendees Application - Kubernetes Infrastructure

This directory contains Kubernetes manifests for deploying the GDG Attendees application, which consists of:
- **API**: Go backend service
- **Web**: Angular frontend application

## 📁 Structure

```
k8s/
├── namespace.yaml          # Kubernetes namespace
├── secrets.yaml           # Sensitive configuration (DB credentials, JWT secrets)
├── configmaps.yaml        # Application configuration
├── services.yaml          # ClusterIP services for API and Web
├── api-deployment.yaml    # API deployment with Go backend
├── web-deployment.yaml    # Web deployment with Nginx + Angular
├── ingress.yaml           # Ingress controller configuration
├── hpa.yaml              # Horizontal Pod Autoscaler
├── pdb.yaml              # Pod Disruption Budget
├── monitoring.yaml       # ServiceMonitor for Prometheus
├── kustomization.yaml    # Kustomize configuration
├── deploy.sh             # Deployment automation script
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- Kubernetes cluster (v1.20+)
- kubectl configured
- Docker
- Nginx Ingress Controller (for ingress)
- Metrics Server (for HPA)

### Deploy Everything

```bash
./deploy.sh deploy
```

### Individual Commands

```bash
# Check prerequisites
./deploy.sh prerequisites

# Build Docker images only
./deploy.sh build

# Deploy to Kubernetes
./deploy.sh deploy

# Check deployment status
./deploy.sh status

# View logs
./deploy.sh logs api    # API logs
./deploy.sh logs web    # Web logs

# Clean up everything
./deploy.sh cleanup
```

## 🔧 Configuration

### Environment Variables

Set these environment variables before deployment:

```bash
export DOCKER_REGISTRY="your-registry.com"  # Optional, defaults to localhost:5000
```

### Secrets

Update `secrets.yaml` with your actual base64-encoded values:

```bash
# Example: encode a secret
echo -n "your-secret-value" | base64
```

**Important secrets to update:**
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: JWT signing secret
- `API_KEY`: API authentication key

### ConfigMaps

Modify `configmaps.yaml` to adjust:
- Database connection settings
- CORS allowed origins
- Nginx configuration

## 🏗️ Architecture

```
Internet
    │
    ▼
┌─────────────┐
│   Ingress   │ (attendees.gdg.local)
└─────────────┘
    │
    ▼
┌─────────────┐    ┌─────────────┐
│ Web Service │    │ API Service │
│   (Port 80) │    │ (Port 3000) │
└─────────────┘    └─────────────┘
    │                    │
    ▼                    ▼
┌─────────────┐    ┌─────────────┐
│Web Pods (2) │    │API Pods (3) │
│  Nginx +    │    │  Go Backend │
│  Angular    │    │             │
└─────────────┘    └─────────────┘
```

## 🔍 Monitoring & Scaling

### Horizontal Pod Autoscaler (HPA)

- **API**: 2-10 replicas based on CPU (70%) and Memory (80%)
- **Web**: 2-6 replicas based on CPU (70%) and Memory (80%)

### Pod Disruption Budget (PDB)

- **API**: Minimum 2 pods available during updates
- **Web**: Minimum 1 pod available during updates

### Monitoring

ServiceMonitor resources are included for Prometheus integration:
- Metrics endpoint: `/metrics`
- Scrape interval: 30s

## 🌐 Access

### Local Development

Add to your `/etc/hosts`:
```
127.0.0.1 attendees.gdg.local
```

### URLs

- **Web Application**: http://attendees.gdg.local
- **API**: http://attendees.gdg.local/api
- **Health Checks**: 
  - Web: http://attendees.gdg.local/health
  - API: http://attendees.gdg.local/api/health

## 🔒 Security Features

- Non-root containers
- Read-only root filesystem
- Security context with dropped capabilities
- Network policies (if supported)
- Resource limits and requests
- CORS configuration
- Security headers

## 🛠️ Troubleshooting

### Common Issues

1. **Pods not starting**:
   ```bash
   kubectl describe pods -n gdg-attendees
   kubectl logs -l app.kubernetes.io/name=gdg-attendees -n gdg-attendees
   ```

2. **Ingress not working**:
   ```bash
   kubectl get ingress -n gdg-attendees
   kubectl describe ingress gdg-attendees-ingress -n gdg-attendees
   ```

3. **HPA not scaling**:
   ```bash
   kubectl get hpa -n gdg-attendees
   kubectl describe hpa -n gdg-attendees
   ```

### Useful Commands

```bash
# Get all resources
kubectl get all -n gdg-attendees

# Port forward for local testing
kubectl port-forward svc/web-service 8080:80 -n gdg-attendees
kubectl port-forward svc/api-service 3000:3000 -n gdg-attendees

# Scale manually
kubectl scale deployment api-deployment --replicas=5 -n gdg-attendees

# Rolling restart
kubectl rollout restart deployment/api-deployment -n gdg-attendees
kubectl rollout restart deployment/web-deployment -n gdg-attendees
```

## 📦 Alternative Deployment Methods

### Using Kustomize

```bash
kubectl apply -k .
```

### Using Helm (if you convert to Helm chart)

```bash
helm install gdg-attendees ./chart -n gdg-attendees --create-namespace
```

## 🔄 CI/CD Integration

This setup is ready for CI/CD integration. Example workflow:

1. Build and tag images with commit SHA
2. Update image tags in deployments
3. Apply manifests
4. Wait for rollout completion
5. Run health checks

## 📊 Resource Requirements

### Minimum Cluster Resources

- **CPU**: 1.5 cores total
- **Memory**: 2GB total
- **Storage**: Ephemeral (no persistent volumes required)

### Production Recommendations

- **CPU**: 4+ cores
- **Memory**: 8GB+
- **Nodes**: 3+ for high availability
