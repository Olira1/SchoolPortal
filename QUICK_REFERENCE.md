# Quick Reference Card

Keep this handy during deployment!

---

## 🔗 Service URLs

### Sign Up Links
```
TiDB Cloud:  https://tidbcloud.com/
Render:      https://render.com/
Vercel:      https://vercel.com/
```

### Your Deployment URLs (fill in after deployment)
```
Database:    _________________________________
Backend:     _________________________________
Frontend:    _________________________________
```

---

## 📋 Environment Variables

### Render Backend (11 variables)
```bash
NODE_ENV=production
PORT=5000
JWT_SECRET=[generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]
JWT_EXPIRES_IN=24h
DB_HOST=[from TiDB]
DB_PORT=4000
DB_USER=[from TiDB]
DB_PASSWORD=[from TiDB]
DB_NAME=school_portal
DB_SSL=true
FRONTEND_URL=[from Vercel]
```

### Vercel Frontend (1 variable)
```bash
VITE_API_URL=[from Render]/api/v1
```

---

## ⚡ Quick Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Test Backend
```bash
curl https://your-backend.onrender.com/
```

### Test Login
```bash
curl -X POST https://your-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@schoolportal.com","password":"admin123"}'
```

---

## 🎯 Deployment Steps (35 min)

```
1. TiDB Cloud (10 min)
   ├─ Sign up
   ├─ Create Serverless cluster
   ├─ Save credentials
   └─ Create school_portal database

2. Render Backend (15 min)
   ├─ Sign up with GitHub
   ├─ Create Web Service
   ├─ Add 11 environment variables
   ├─ Deploy
   └─ Run database schema

3. Vercel Frontend (10 min)
   ├─ Sign up with GitHub
   ├─ Import project
   ├─ Add 1 environment variable
   └─ Deploy

4. Connect (5 min)
   ├─ Update FRONTEND_URL in Render
   └─ Test everything
```

---

## 🔍 Troubleshooting Quick Fixes

### CORS Error
```
Fix: Update FRONTEND_URL in Render to match Vercel URL exactly
Wait: 1-2 minutes for redeploy
```

### Database Connection Failed
```
Check: DB_HOST, DB_USER, DB_PASSWORD in Render
Verify: TiDB cluster is Active (not paused)
Ensure: DB_SSL=true (not "true")
```

### Frontend Network Error
```
Check: VITE_API_URL in Vercel
Verify: Backend URL is correct and includes /api/v1
Test: Backend URL in browser
```

### Backend 500 Error
```
Check: Render logs for error details
Verify: All 11 environment variables are set
Test: Database connection in TiDB
```

---

## 📊 Service Dashboards

### Render
```
Logs:     Dashboard → Your Service → Logs
Env Vars: Dashboard → Your Service → Environment
Redeploy: Dashboard → Your Service → Manual Deploy
```

### Vercel
```
Logs:     Dashboard → Deployments → Latest → View Logs
Env Vars: Dashboard → Settings → Environment Variables
Redeploy: Dashboard → Deployments → Latest → Redeploy
```

### TiDB Cloud
```
SQL Editor: Dashboard → Your Cluster → SQL Editor
Connect:    Dashboard → Your Cluster → Connect
Monitor:    Dashboard → Your Cluster → Monitoring
```

---

## ✅ Success Checklist

- [ ] Backend URL responds
- [ ] Frontend loads
- [ ] Can login
- [ ] Dashboard shows data
- [ ] No console errors
- [ ] No CORS errors
- [ ] All user roles work

---

## 🆘 Emergency Contacts

### Platform Status
```
Render:  https://status.render.com/
Vercel:  https://www.vercel-status.com/
TiDB:    https://status.pingcap.com/
```

### Documentation
```
Render:  https://render.com/docs
Vercel:  https://vercel.com/docs
TiDB:    https://docs.pingcap.com/tidbcloud/
```

---

## 💾 Backup Commands

### Export Database
```sql
-- In TiDB SQL Editor
SELECT * FROM users INTO OUTFILE 'users_backup.csv';
```

### Rollback Deployment
```
Render: Events tab → Rollback
Vercel: Deployments → Previous → Promote to Production
```

---

## 📝 Test Credentials

```
Admin:
Email:    admin@schoolportal.com
Password: admin123

School Head:
Email:    schoolhead@schoolportal.com
Password: schoolhead123

Teacher:
Email:    teacher@schoolportal.com
Password: teacher123

Student:
Email:    student@schoolportal.com
Password: student123
```

(Update based on your seed data)

---

## 🎓 Free Tier Limits

```
TiDB Cloud:  5GB storage, 50M RU/month
Render:      750 hours/month, sleeps after 15 min
Vercel:      Unlimited, 100GB bandwidth/month
```

---

## 🔧 Common Fixes

### Render Service Slow
```
Reason: Free tier sleeps after 15 min inactivity
Fix:    First request takes 30-60 seconds (normal)
```

### TiDB Cluster Paused
```
Reason: Free tier pauses after 24h inactivity
Fix:    Resume in TiDB dashboard
```

### Build Failed
```
Check:  Build logs for specific error
Test:   Run locally first (npm install && npm start)
Fix:    Resolve errors before redeploying
```

---

## 📞 Need Help?

1. Check **TROUBLESHOOTING.md**
2. Review **DEPLOYMENT_GUIDE.md**
3. Check service status pages
4. Review logs in dashboards
5. Ask in community forums

---

**Print this page and keep it handy during deployment!**

---

*School Portal v1.0 - Deployment Quick Reference*
