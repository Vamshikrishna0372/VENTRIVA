# Ventriva Production Deployment Runbook

## Overview
This runbook covers the production deployment process for the **Ventriva Founder & Startup Discovery Platform**.

---

## 1. Backend Server Deployment (Express + Node.js)

### Environment Variables (`server/.env`)
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ventriva?retryWrites=true&w=majority
JWT_SECRET=<min-32-char-random-secure-key>
CLIENT_URL=https://app.ventriva.com
UPLOAD_DIR=./storage/uploads
LOG_LEVEL=info
SLOW_REQUEST_THRESHOLD_MS=1000
NOTIFICATION_RETENTION_DAYS=90
DRY_RUN_CLEANUP=true
```

### Installation & Process Start
```bash
cd server
npm install --production
npm start
```

---

## 2. Frontend Client Deployment (React + Vite)

### Environment Variables (`client/.env`)
```env
VITE_API_URL=https://api.ventriva.com/api
```

### Build Command
```bash
cd client
npm install
npm run build
```
Deploy the generated `client/dist/` directory to static hosting (AWS S3/CloudFront, Vercel, Netlify, or Nginx).

---

## 3. Production Health Probes & Monitoring

- **Liveness Probe**: `GET https://api.ventriva.com/api/health`
- **Readiness Probe**: `GET https://api.ventriva.com/api/health/ready`
- **Version Endpoint**: `GET https://api.ventriva.com/api/health/version`
- **Admin System Dashboard**: `https://app.ventriva.com/admin/system`
