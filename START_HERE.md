# 🚀 START HERE - Deploy Your School Portal

Follow these steps in order. Check each box as you complete it.

---

## Before You Start

- [ ] Your code is pushed to GitHub: https://github.com/Olira1/SchoolPortal.git
- [ ] You have 35 minutes available
- [ ] You're ready to create 3 free accounts

---

## STEP 1: Database (10 min) ⏱️

### Go to TiDB Cloud
1. [ ] Open https://tidbcloud.com/ in new tab
2. [ ] Click "Sign Up" (use GitHub or Google)
3. [ ] Click "Create Cluster"
4. [ ] Select "Serverless" (Free)
5. [ ] Name it: `school-portal-db`
6. [ ] Choose region closest to you
7. [ ] Click "Create" and wait 2-3 minutes

### Get Credentials
8. [ ] Click "Connect" button
9. [ ] Click "Generate Password" or "Reset Password"
10. [ ] **COPY AND SAVE** these immediately:
   ```
   Host: _________________________________
   Port: 4000
   User: _________________________________
   Password: _________________________________
   ```

### Create Database
11. [ ] Go to "SQL Editor" or "Chat2Query"
12. [ ] Run: `CREATE DATABASE school_portal;`
13. [ ] Verify: `SHOW DATABASES;`

✅ **Step 1 Complete!** Keep credentials handy.

---

## STEP 2: Backend API (15 min) ⏱️

### Push Code to GitHub
1. [ ] Open terminal in SchoolPortal folder
2. [ ] Run:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Deploy to Render
3. [ ] Open https://render.com/ in new tab
4. [ ] Click "Get Started" → Sign up with GitHub
5. [ ] Authorize Render to access your repos
6. [ ] Click "New +" → "Web Service"
7. [ ] Select your `SchoolPortal` repository
8. [ ] Configure:
   - Name: `school-portal-backend`
   - Region: Same as TiDB (or closest)
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

### Add Environment Variables
9. [ ] In "Environment" section, click "Add Environment Variable"
10. [ ] Add these 11 variables (one by one):

```
NODE_ENV = production
PORT = 5000
JWT_SECRET = [Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_EXPIRES_IN = 24h
DB_HOST = [Your TiDB host from Step 1]
DB_PORT = 4000
DB_USER = [Your TiDB user from Step 1]
DB_PASSWORD = [Your TiDB password from Step 1]
DB_NAME = school_portal
DB_SSL = true
FRONTEND_URL = http://localhost:5173
```

(We'll update FRONTEND_URL in Step 4)

### Deploy
11. [ ] Click "Create Web Service"
12. [ ] Wait 3-5 minutes for deployment
13. [ ] **SAVE YOUR BACKEND URL**: _________________________________
    (Example: https://school-portal-backend.onrender.com)

### Initialize Database
14. [ ] Go back to TiDB Cloud SQL Editor
15. [ ] Copy content from `backend/database/schema.sql`
16. [ ] Paste and execute in SQL Editor
17. [ ] Copy content from `backend/database/seed-tidb.sql`
18. [ ] Paste and execute in SQL Editor

✅ **Step 2 Complete!** Backend is live.

---

## STEP 3: Frontend (10 min) ⏱️

### Deploy to Vercel
1. [ ] Open https://vercel.com/ in new tab
2. [ ] Click "Sign Up" → Sign up with GitHub
3. [ ] Authorize Vercel to access your repos
4. [ ] Click "Add New..." → "Project"
5. [ ] Import your `SchoolPortal` repository
6. [ ] Configure:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)

### Add Environment Variable
7. [ ] In "Environment Variables" section:
   ```
   VITE_API_URL = [Your backend URL from Step 2]/api/v1
   ```
   Example: `https://school-portal-backend.onrender.com/api/v1`

### Deploy
8. [ ] Click "Deploy"
9. [ ] Wait 2-3 minutes
10. [ ] **SAVE YOUR FRONTEND URL**: _________________________________
    (Example: https://school-portal-xyz.vercel.app)

✅ **Step 3 Complete!** Frontend is live.

---

## STEP 4: Connect Everything (5 min) ⏱️

### Update Backend CORS
1. [ ] Go back to Render dashboard
2. [ ] Open your backend web service
3. [ ] Click "Environment" tab
4. [ ] Find `FRONTEND_URL` variable
5. [ ] Update value to your Vercel URL from Step 3
6. [ ] Click "Save Changes"
7. [ ] Wait 1-2 minutes for auto-redeploy

✅ **Step 4 Complete!** Everything is connected.

---

## STEP 5: Test Everything (5 min) ⏱️

### Test Backend
1. [ ] Open: `[Your backend URL]` in browser
2. [ ] Should see: "School Portal API is running"

### Test Frontend
3. [ ] Open: `[Your frontend URL]` in browser
4. [ ] Should see login page
5. [ ] Try logging in with test credentials:
   - Email: `admin@schoolportal.com`
   - Password: `admin123`
6. [ ] Should redirect to dashboard
7. [ ] Check if data loads

### Check for Errors
8. [ ] Open browser DevTools (F12)
9. [ ] Check Console tab - should be no red errors
10. [ ] Check Network tab - all requests should be green

✅ **Step 5 Complete!** Everything works!

---

## 🎉 SUCCESS!

Your School Portal is now live at:
- **Frontend**: [Your Vercel URL]
- **Backend**: [Your Render URL]
- **Database**: TiDB Cloud

### Save These URLs
```
Frontend: _________________________________
Backend: _________________________________
TiDB Host: _________________________________
```

### Share with Others
Send your frontend URL to users/stakeholders!

---

## 🆘 Having Issues?

### Backend shows 500 error
- Check Render logs: Dashboard → Logs tab
- Verify database credentials are correct

### Frontend shows "Network Error"
- Verify `VITE_API_URL` in Vercel is correct
- Check backend URL is accessible

### CORS error in browser console
- Verify `FRONTEND_URL` in Render matches Vercel URL exactly
- Wait for backend to finish redeploying

### Need more help?
- See `DEPLOYMENT_GUIDE.md` for detailed instructions
- See `TEST_DEPLOYMENT.md` for troubleshooting
- See `ENV_VARIABLES_REFERENCE.md` for environment variables

---

## 📚 Next Steps

- [ ] Set up custom domain (optional)
- [ ] Add more test data
- [ ] Share with team
- [ ] Monitor usage in dashboards
- [ ] Plan for production upgrades

---

**Congratulations on deploying your School Portal! 🎓🚀**
