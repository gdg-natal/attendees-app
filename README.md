# 🚀 GDG Attendees - Local Development Guide

This guide will help you run the GDG Attendees application locally in development mode.

## 📋 Prerequisites

### Required Software
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Go** (v1.19 or higher) - [Download here](https://golang.org/dl/)
- **Git** - [Download here](https://git-scm.com/)

### Optional but Recommended
- **VS Code** with Angular and Go extensions
- **Postman** or **Insomnia** for API testing

## 🛠️ Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# From the root directory
./dev-setup.sh
```

### Option 2: Manual Setup

#### 1. **Setup API (Go Backend)**
```bash
# Navigate to API directory
cd api

# Install dependencies
go mod download

# Run the API server
go run main.go
```
The API will be available at: `http://localhost:3000`

#### 2. **Setup Web (Angular Frontend)**
```bash
# Navigate to web directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```
The web app will be available at: `http://localhost:4200`

## 🌟 Development Scripts

We've created convenient scripts to make development easier:

### Root Directory Scripts
- `./dev-setup.sh` - Complete setup and start both services
- `./dev-start.sh` - Start both API and Web in development mode
- `./dev-stop.sh` - Stop all development services
- `./dev-test.sh` - Run tests for both services

### API Scripts (in `/api` directory)
- `go run main.go` - Start API server
- `go test ./...` - Run tests
- `go mod tidy` - Clean up dependencies

### Web Scripts (in `/web` directory)
- `npm run dev` - Start development server with hot reload
- `npm run start` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run watch` - Build and watch for changes

## 🔗 Application URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Web App** | http://localhost:4200 | Angular frontend |
| **API** | http://localhost:3000 | Go backend API |
| **API Health** | http://localhost:3000/health | Health check endpoint |
| **API Docs** | http://localhost:3000/api/v1 | API endpoints |

## 🗂️ Project Structure

```
attendees-app/
├── 🚀 api/                    # Go backend
│   ├── main.go               # Entry point
│   ├── go.mod               # Go dependencies
│   ├── app/                 # Application logic
│   │   ├── app.go          # Main app configuration
│   │   └── handler/        # HTTP handlers
│   └── Dockerfile          # Docker configuration
│
├── 🌐 web/                   # Angular frontend
│   ├── package.json        # Node.js dependencies
│   ├── angular.json        # Angular configuration
│   ├── src/                # Source code
│   │   ├── app/           # Angular components
│   │   ├── environments/  # Environment configs
│   │   └── assets/        # Static assets
│   └── Dockerfile         # Docker configuration
│
├── 🏗️ infra/                # Infrastructure
│   └── k8s/               # Kubernetes manifests
│
└── 📝 Development files
    ├── dev-setup.sh       # Setup script
    ├── dev-start.sh       # Start script
    └── README.md          # This file
```

## 🔧 Environment Configuration

### API Environment Variables
Create a `.env` file in the `/api` directory (optional):
```bash
PORT=3000
GIN_MODE=debug
CORS_ALLOWED_ORIGINS=http://localhost:4200
LOG_LEVEL=debug
```

### Web Environment Configuration
The Angular app uses environment files:
- `src/environments/environment.ts` - Default (development)
- `src/environments/environment.dev.ts` - Development
- `src/environments/environment.prod.ts` - Production

## 🧪 Testing

### API Tests
```bash
cd api
go test ./...
```

### Web Tests
```bash
cd web
npm run test
```

### End-to-End Testing
```bash
# Start both services first
./dev-start.sh

# Then run E2E tests (if configured)
cd web
npm run e2e
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **Port Already in Use**
```bash
# Find process using port 3000 (API)
lsof -i :3000
kill -9 <PID>

# Find process using port 4200 (Web)
lsof -i :4200
kill -9 <PID>
```

#### 2. **Node Modules Issues**
```bash
cd web
rm -rf node_modules package-lock.json
npm install
```

#### 3. **Go Module Issues**
```bash
cd api
go clean -modcache
go mod download
```

#### 4. **CORS Issues**
Make sure the API is configured to allow requests from `http://localhost:4200`

### 📊 Development Monitoring

#### API Logs
The Go API provides structured logging. Check the console for:
- Request logs
- Error messages
- Performance metrics

#### Web Development Server
Angular CLI provides:
- Hot reload on file changes
- Build error reporting
- Lint warnings

## 🚀 Next Steps

### Development Workflow
1. **Start development servers**: `./dev-start.sh`
2. **Make changes** to code
3. **Test changes** automatically (hot reload)
4. **Test API endpoints** with Postman/curl
5. **Run tests** before committing
6. **Build for production** when ready

### Adding Features
1. **API**: Add new handlers in `/api/app/handler/`
2. **Web**: Add new components in `/web/src/app/`
3. **Update tests** for new functionality
4. **Update documentation**

### Production Deployment
When ready to deploy:
```bash
# Build production images
docker build -t gdg-attendees-api ./api
docker build -t attendees-app ./web

# Deploy to Kubernetes
cd infra/k8s
make deploy
```

## 📚 Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Go Fiber Documentation](https://docs.gofiber.io/)
- [Go Documentation](https://golang.org/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

Happy coding! 🎉
