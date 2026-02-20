# School Portal Deployment Guide

Complete step-by-step guide to deploy your School Portal application.

## Overview

We'll deploy:
1. **Database**: TiDB Cloud (Free Tier)
2. **Backend API**: Render (Free Tier)
3. **Frontend**: Vercel (Free Tier)

---

## STEP 1: Create TiDB Cloud Database

### 1.1 Sign Up for TiDB Cloud
1. Go to https://tidbcloud.com/
2. Click "Sign Up" (use GitHub, Google, or Email)
3. Verify your email if required

### 1.2 Create a New Cluster
1. After login, click "Create Cluster"
2. Select **"Serverless"** (Free tier)
3. Configure:
   - **Cluster Name**: `school-portal-db` (or your choice)
   - **Cloud Provider**: AWS or GCP (choose closest region)
   - **Region**: Select closest to your users (e.g., eu-central-1)
4. Click "Create"
5. Wait 2-3 minutes for cluster creation

### 1.3 Get Database Credentials
1. Once cluster is ready, click on it
2. Click "Connect" button
3. Select "General" connection type
4. You'll see connection details:
   ```
   Host: gateway01.xxx.prod.aws.tidbcloud.com
   Port: 4000
   User: xxxxxx.root
   Password: [Click "Generate Password" or "Reset Password"]
   ```
5. **IMPORTANT**: Copy and save these credentials immediately!

### 1.4 Create Database
1. In TiDB Cloud console, go to "SQL Editor" or "Chat2Query"
2. Run this command:
   ```sql
   CREATE DATABASE school_portal;
   ```
3. Verify: `SHOW DATABASES;` should list `school_portal`

### 1.5 Set Up Database Schema
1. In your local terminal, navigate to backend folder:
   ```bash
   cd SchoolPortal/backend
   ```
2. Update `database/seed-tidb.sql` if needed
3. You'll run the schema after backend deployment

---

## STEP 2: Deploy Backend to Render

### 2.1 Prepare Backend for Deployment
1. Ensure your backend code is pushed to GitHub:
   ```bash
   cd SchoolPortal
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

### 2.2 Sign Up for Render
1. Go to https://render.com/
2. Click "Get Started" or "Sign Up"
3. Sign up with GitHub (recommended for easy deployment)
4. Authorize Render to access your repositories

### 2.3 Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository (SchoolPortal)
3. Configure the service:
   - **Name**: `school-portal-backend` (or your choice)
   - **Region**: Choose closest to your TiDB region
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 2.4 Add Environment Variables
In the "Environment" section, add these variables:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random
JWT_EXPIRES_IN=24h
DB_HOST=your-tidb-host-from-step-1.3
DB_PORT=4000
DB_USER=your-tidb-user-from-step-1.3
DB_PASSWORD=your-tidb-password-from-step-1.3
DB_NAME=school_portal
DB_SSL=true
FRONTEND_URL=https://your-app.vercel.app
```

**Note**: We'll update `FRONTEND_URL` after deploying frontend (Step 3)

### 2.5 Deploy
1. Click "Create Web Service"
2. Wait 3-5 minutes for deployment
3. Once deployed, you'll get a URL like: `https://school-portal-backend.onrender.com`
4. **Save this URL** - you'll need it for frontend!

### 2.6 Initialize Database Schema
1. Use a tool like Postman, curl, or create a temporary script
2. Or manually run SQL in TiDB Cloud SQL Editor:
   - Copy content from `backend/database/schema.sql`
   - Paste and execute in TiDB SQL Editor
   - Then run `backend/database/seed-tidb.sql` for initial data

---

## STEP 3: Deploy Frontend to Vercel

### 3.1 Sign Up for Vercel
1. Go to https://vercel.com/
2. Click "Sign Up"
3. Sign up with GitHub (recommended)
4. Authorize Vercel to access your repositories

### 3.2 Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository (SchoolPortal)
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)

### 3.3 Add Environment Variables
In "Environment Variables" section, add:

```
VITE_API_URL=https://your-backend-url-from-step-2.5.onrender.com/api/v1
```

Replace with your actual Render backend URL!

### 3.4 Deploy
1. Click "Deploy"
2. Wait 2-3 minutes for build and deployment
3. You'll get a URL like: `https://school-portal-xyz.vercel.app`
4. **Save this URL**

### 3.5 Update Backend CORS
1. Go back to Render dashboard
2. Open your backend web service
3. Go to "Environment" tab
4. Update `FRONTEND_URL` with your Vercel URL:
   ```
   FRONTEND_URL=https://school-portal-xyz.vercel.app
   ```
5. Save changes (this will trigger a redeploy)

---

## STEP 4: Verify Deployment

### 4.1 Test Backend
1. Open: `https://your-backend.onrender.com/api/v1/health` (if you have health endpoint)
2. Or test login endpoint with Postman

### 4.2 Test Frontend
1. Open your Vercel URL: `https://your-app.vercel.app`
2. Try logging in with test credentials
3. Check browser console for any errors

### 4.3 Test Full Flow
1. Login as different user roles
2. Verify data loads correctly
3. Test CRUD operations

---

## STEP 5: Post-Deployment Configuration

### 5.1 Custom Domain (Optional)
**Vercel:**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**Render:**
1. Go to Service Settings → Custom Domain
2. Add your custom domain
3. Update DNS records

### 5.2 Environment Variables Management
Create local files for reference (DON'T commit to Git):

**backend/.env.production** (for your records only):
```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-actual-secret
JWT_EXPIRES_IN=24h
DB_HOST=your-tidb-host
DB_PORT=4000
DB_USER=your-tidb-user
DB_PASSWORD=your-tidb-password
DB_NAME=school_portal
DB_SSL=true
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**frontend/.env.production** (for your records only):
```env
VITE_API_URL=https://your-backend.onrender.com/api/v1
```

### 5.3 Update .gitignore
Ensure these are in `.gitignore`:
```
.env
.env.local
.env.production
.env.*.local
```

---

## Troubleshooting

### Backend Issues
- **500 Error**: Check Render logs for database connection issues
- **CORS Error**: Verify `FRONTEND_URL` matches your Vercel URL exactly
- **Database Connection**: Verify TiDB credentials and SSL setting

### Frontend Issues
- **API Errors**: Check `VITE_API_URL` is correct
- **Build Fails**: Check for TypeScript/ESLint errors locally first
- **Blank Page**: Check browser console for errors

### Database Issues
- **Connection Timeout**: Check TiDB cluster is active (free tier may sleep)
- **Authentication Failed**: Regenerate password in TiDB Cloud
- **SSL Error**: Ensure `DB_SSL=true` in backend env vars

---

## Important Notes

1. **Free Tier Limitations**:
   - Render: Service sleeps after 15 min inactivity (first request may be slow)
   - TiDB: Limited storage and requests
   - Vercel: Unlimited for personal projects

2. **Security**:
   - Never commit `.env` files to Git
   - Use strong JWT_SECRET in production
   - Regularly rotate database passwords

3. **Monitoring**:
   - Check Render logs for backend errors
   - Use Vercel Analytics for frontend monitoring
   - Monitor TiDB usage in dashboard

---

## Quick Reference

### Your Deployment URLs
```
Database: [TiDB Host]
Backend: https://[your-service].onrender.com
Frontend: https://[your-app].vercel.app
```

### Useful Commands
```bash
# Update backend
git push origin main  # Auto-deploys on Render

# Update frontend
git push origin main  # Auto-deploys on Vercel

# View logs
# Render: Dashboard → Logs tab
# Vercel: Dashboard → Deployments → View Function Logs
```

---

## Next Steps

1. Set up monitoring and alerts
2. Configure custom domains
3. Set up CI/CD pipelines
4. Implement backup strategy for database
5. Add error tracking (e.g., Sentry)

---

Good luck with your deployment! 🚀
