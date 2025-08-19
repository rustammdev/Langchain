# 🚀 Deployment Guide

This guide covers different deployment options for the LangChain Agent API.

## 📋 Prerequisites

- Node.js 18+ (for manual deployment)
- Docker & Docker Compose (for containerized deployment)
- Redis server
- OpenAI API key

## 🔧 Build Process

The project uses TypeScript and builds to the `dist/` folder:

```bash
# Clean previous build
npm run clean

# Build for production
npm run build

# Check build output
ls -la dist/
```

## 🖥️ Manual Deployment

### 1. Prepare Environment

```bash
# Clone repository
git clone <your-repo-url>
cd langchain-agent-api

# Install dependencies
npm ci --only=production

# Copy environment file
cp .env.production.example .env.production
# Edit .env.production with your values
```

### 2. Build Application

```bash
npm run build
```

### 3. Start Services

```bash
# Start Redis (if not using external Redis)
redis-server

# Start the application
npm run start:prod
```

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended)

```bash
# Copy environment file
cp .env.production.example .env

# Edit .env with your values
nano .env

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Option 2: Manual Docker

```bash
# Build image
docker build -t langchain-agent-api .

# Run Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Run application
docker run -d \
  --name langchain-api \
  -p 3000:3000 \
  --link redis:redis \
  --env-file .env \
  langchain-agent-api
```

## ☁️ Cloud Deployment

### Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-app-name

# Add Redis addon
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set OPENAI_API_KEY="your-key"
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set run command: `npm run start:prod`
4. Add environment variables
5. Add Redis database

## 🔍 Health Checks

The application includes health check endpoints:

```bash
# Basic health check
curl http://localhost:3000/

# Tool status
curl http://localhost:3000/ai/chat-with-memory/tools
```

## 📊 Monitoring

### Logs

```bash
# Docker Compose logs
docker-compose logs -f app

# Docker logs
docker logs -f langchain-api

# PM2 (if using PM2)
pm2 logs
```

### Metrics

Monitor these key metrics:
- Response time
- Token usage
- Error rates
- Redis memory usage
- Tool success rates

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env` files
- Use strong Redis passwords in production
- Rotate API keys regularly
- Use HTTPS in production

### Network Security

```bash
# Use reverse proxy (nginx example)
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Build fails**
   ```bash
   npm run clean
   npm run build
   ```

2. **Redis connection error**
   - Check Redis is running
   - Verify REDIS_URL in environment

3. **OpenAI API errors**
   - Verify API key is correct
   - Check API quota/billing

4. **Port already in use**
   ```bash
   # Find process using port
   lsof -i :3000
   # Kill process
   kill -9 <PID>
   ```

### Debug Mode

```bash
# Enable verbose logging
export AGENT_VERBOSE=true
export NODE_ENV=development

# Run with debug
npm run dev
```

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  app:
    deploy:
      replicas: 3
    # ... other config
  
  nginx:
    image: nginx:alpine
    # Load balancer config
```

### Vertical Scaling

```bash
# Increase memory limits
docker run --memory=2g langchain-agent-api
```

## 🔄 Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild
npm run build

# Restart services
docker-compose restart app
```

---

For more help, check the main [README.md](README.md) or create an issue in the repository.