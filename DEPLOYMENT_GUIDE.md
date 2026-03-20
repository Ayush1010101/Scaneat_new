# Food Lens - Complete Deployment & Launch Guide

## 🚀 Deployment Overview

This guide covers how to deploy Food Lens to production, choose hosting providers, configure domains, set up SSL/TLS, and prepare for launch. You have multiple deployment options depending on your budget, technical expertise, and scale requirements.

---

## 📋 Pre-Deployment Checklist

Before deploying to production, ensure the following are complete:

- [ ] All features tested locally (`pnpm test` passes)
- [ ] Environment variables configured (API keys, database URL, secrets)
- [ ] Database migrations applied (`pnpm db:push`)
- [ ] SSL/TLS certificates obtained
- [ ] Custom domain registered
- [ ] Payment processor configured (Stripe for subscriptions)
- [ ] Email service configured (SendGrid, Mailgun for notifications)
- [ ] Analytics configured (Google Analytics, Mixpanel)
- [ ] Error tracking configured (Sentry, LogRocket)
- [ ] Backup strategy defined
- [ ] Security audit completed
- [ ] Privacy policy and terms of service drafted
- [ ] GDPR/CCPA compliance reviewed

---

## 🏢 Deployment Option 1: Manus Hosting (Recommended)

**Why Manus Hosting?**
- Built-in OAuth integration (no setup needed)
- Automatic SSL/TLS certificates
- Managed database (MySQL/TiDB)
- CDN for static assets
- Environment variable management
- One-click deployment
- Custom domain support
- Automatic backups

### **Step 1: Prepare for Manus Deployment**

```bash
# 1. Ensure your code is clean and tested
pnpm test

# 2. Build the project
pnpm build

# 3. Check for TypeScript errors
pnpm check
```

### **Step 2: Configure Environment Variables**

Create a `.env.production` file with production values:

```env
# Database
DATABASE_URL=mysql://user:password@host/database

# OAuth
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im

# API Keys
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your-open-id

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# App Config
VITE_APP_TITLE=Food Lens
VITE_APP_LOGO=https://cdn.example.com/logo.png
```

### **Step 3: Deploy via Manus Dashboard**

1. Log in to Manus Dashboard
2. Click "Create New Project" or "Deploy"
3. Select "Food Lens" from your GitHub repository
4. Configure environment variables
5. Click "Deploy"
6. Wait for build to complete (typically 2-5 minutes)

### **Step 4: Configure Custom Domain**

1. Go to Project Settings → Domains
2. Click "Add Custom Domain"
3. Enter your domain (e.g., `foodlens.com`)
4. Update DNS records as instructed
5. Wait for DNS propagation (5-30 minutes)
6. SSL certificate auto-generated

**Your app is now live at**: `https://foodlens.com`

---

## 🏢 Deployment Option 2: Self-Hosted (AWS/DigitalOcean)

**Pros**: Full control, custom configurations, potentially cheaper at scale

**Cons**: More setup, ongoing maintenance, security responsibility

### **Step 1: Choose a VPS Provider**

| Provider | Cost | Best For |
|----------|------|----------|
| AWS EC2 | $10-100+/month | Large scale, enterprise |
| DigitalOcean | $5-50/month | Startups, small-medium |
| Heroku | $7-50+/month | Quick deployment, ease of use |
| Railway | $5-50+/month | Modern, developer-friendly |
| Render | $7-50+/month | Easy deployment, good free tier |

### **Step 2: Deploy on DigitalOcean (Example)**

**Create a Droplet**:
1. Sign up at DigitalOcean
2. Create a new Droplet (Ubuntu 22.04, $5-10/month)
3. Choose a region closest to your users
4. Add SSH key for secure access

**Connect to Droplet**:
```bash
ssh root@your_droplet_ip
```

**Install Dependencies**:
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# Install pnpm
npm install -g pnpm

# Install PostgreSQL/MySQL
apt install -y mysql-server

# Install Nginx (reverse proxy)
apt install -y nginx

# Install PM2 (process manager)
npm install -g pm2
```

**Clone and Setup Project**:
```bash
# Clone repository
git clone https://github.com/yourusername/food-lens.git
cd food-lens

# Install dependencies
pnpm install

# Create .env.production
nano .env.production
# (paste your production environment variables)

# Build project
pnpm build

# Run database migrations
pnpm db:push
```

**Configure Nginx**:
```nginx
# /etc/nginx/sites-available/foodlens
server {
    listen 80;
    server_name foodlens.com www.foodlens.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name foodlens.com www.foodlens.com;
    
    # SSL certificates (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/foodlens.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/foodlens.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    location / {
        # Proxy to Node.js app running on port 3000
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Static files (cache aggressively)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable Nginx Configuration**:
```bash
ln -s /etc/nginx/sites-available/foodlens /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl restart nginx
```

**Setup SSL with Let's Encrypt**:
```bash
apt install -y certbot python3-certbot-nginx
certbot certonly --nginx -d foodlens.com -d www.foodlens.com
```

**Start Application with PM2**:
```bash
# Start app
pm2 start "pnpm start" --name "food-lens"

# Save PM2 config
pm2 save

# Enable PM2 startup
pm2 startup
```

**Setup Database Backups**:
```bash
# Create backup script
cat > /home/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/mysql"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p$MYSQL_PASSWORD food_lens > $BACKUP_DIR/backup_$TIMESTAMP.sql
# Keep only last 7 days of backups
find $BACKUP_DIR -mtime +7 -delete
EOF

chmod +x /home/backup-db.sh

# Schedule daily backups at 2 AM
crontab -e
# Add: 0 2 * * * /home/backup-db.sh
```

**Monitor Application**:
```bash
# View logs
pm2 logs food-lens

# Monitor processes
pm2 monit

# Setup alerts
pm2 install pm2-auto-pull  # Auto-restart on crashes
```

---

## 🏢 Deployment Option 3: Docker + Kubernetes (Enterprise)

**Best for**: Large-scale deployments, multiple servers, auto-scaling

### **Step 1: Create Dockerfile**

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Build application
RUN pnpm build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["pnpm", "start"]
```

### **Step 2: Build and Push Docker Image**

```bash
# Build image
docker build -t foodlens:latest .

# Tag for registry
docker tag foodlens:latest your-registry/foodlens:latest

# Push to registry (Docker Hub, AWS ECR, etc.)
docker push your-registry/foodlens:latest
```

### **Step 3: Deploy to Kubernetes**

```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: food-lens
spec:
  replicas: 3  # Run 3 instances
  selector:
    matchLabels:
      app: food-lens
  template:
    metadata:
      labels:
        app: food-lens
    spec:
      containers:
      - name: food-lens
        image: your-registry/foodlens:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: food-lens-service
spec:
  selector:
    app: food-lens
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

**Deploy**:
```bash
kubectl apply -f kubernetes/deployment.yaml
kubectl apply -f kubernetes/service.yaml
```

---

## 🔐 Security Configuration

### **Environment Variables Security**

```bash
# Never commit .env files
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use environment variable management tools
# Option 1: Manus Dashboard (built-in)
# Option 2: AWS Secrets Manager
# Option 3: HashiCorp Vault
# Option 4: Doppler
```

### **Database Security**

```sql
-- Create limited user for application
CREATE USER 'app_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON food_lens.* TO 'app_user'@'localhost';

-- Disable root remote access
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Enable SSL for database connections
-- (Configure in connection string)
```

### **API Security**

```typescript
// Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);

// CORS configuration
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://foodlens.com'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Helmet for security headers
import helmet from 'helmet';
app.use(helmet());
```

---

## 📊 Monitoring & Analytics

### **Application Monitoring**

```typescript
// Sentry for error tracking
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Log errors
try {
  // ... code
} catch (error) {
  Sentry.captureException(error);
}
```

### **Performance Monitoring**

```typescript
// Datadog or New Relic
import newrelic from 'newrelic';

// Automatically tracks:
// - Response times
// - Error rates
// - Database queries
// - External API calls
```

### **Analytics**

```typescript
// Google Analytics 4
import { GoogleAnalytics } from '@react-ga/react-ga4';

GoogleAnalytics.initialize('GA_MEASUREMENT_ID');

// Track events
GoogleAnalytics.event({
  category: 'Food Scan',
  action: 'Scan Completed',
  label: 'Grilled Chicken',
  value: 165 // calories
});
```

---

## 🚀 Continuous Deployment (CI/CD)

### **GitHub Actions Example**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm test
      - run: pnpm check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Manus
        run: |
          curl -X POST https://api.manus.im/deploy \
            -H "Authorization: Bearer ${{ secrets.MANUS_DEPLOY_TOKEN }}" \
            -d "project=food-lens&branch=main"
```

---

## 📈 Post-Deployment Tasks

### **Week 1: Monitoring**
- Monitor error rates and performance metrics
- Check database performance
- Monitor API response times
- Review user feedback

### **Week 2-4: Optimization**
- Optimize slow database queries
- Implement caching where needed
- Reduce bundle size
- Optimize images and assets

### **Month 2+: Growth**
- Implement analytics dashboard
- Set up marketing campaigns
- Monitor user acquisition
- Track conversion metrics

---

## 💰 Deployment Cost Comparison

| Option | Setup | Monthly | Annual | Best For |
|--------|-------|---------|--------|----------|
| Manus Hosting | Free | $20-100 | $240-1,200 | Startups, quick launch |
| DigitalOcean | Free | $5-50 | $60-600 | Small-medium apps |
| AWS | Free | $50-500+ | $600-6,000+ | Enterprise, scale |
| Heroku | Free | $7-50+ | $84-600+ | Rapid prototyping |
| Docker + K8s | Free | $100-1,000+ | $1,200-12,000+ | Large scale |

---

## 🎯 Launch Checklist

- [ ] Domain registered and configured
- [ ] SSL certificate installed
- [ ] Database backups configured
- [ ] Monitoring and alerts set up
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Email notifications working
- [ ] Payment processing tested
- [ ] User authentication tested
- [ ] Food scanning tested end-to-end
- [ ] Mobile responsiveness verified
- [ ] Performance tested (Lighthouse score > 90)
- [ ] Security audit completed
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Support email configured
- [ ] Social media accounts created
- [ ] Beta users invited
- [ ] Launch announcement prepared

---

**Document Version**: 1.0  
**Last Updated**: February 14, 2026  
**Status**: Production Ready
