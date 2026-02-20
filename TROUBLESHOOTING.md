# Troubleshooting Guide

Common issues and their solutions during deployment.

---

## 🔴 Backend Issues

### Issue: "Application failed to respond"

**Symptoms:**
- Render shows service as "Live" but doesn't respond
- Timeout errors when accessing backend URL

**Solutions:**
1. Check Render logs for errors:
   - Go to Render Dashboard → Your Service → Logs
   - Look for error messages

2. Verify environment variables:
   - All 11 variables are set
   - No typos in variable names
   - Values don't have quotes or extra spaces

3. Check database connection:
   - Verify TiDB cluster is active
   - Test credentials in TiDB SQL Editor

### Issue: "Database connection failed"

**Symptoms:**
- Backend logs show: "Error: connect ETIMEDOUT"
- Or: "ER_ACCESS_DENIED_ERROR"

**Solutions:**
1. Verify TiDB credentials:
   ```
   DB_HOST = gateway01.xxx.prod.aws.tidbcloud.com (no http://)
   DB_PORT = 4000 (number, not string)
   DB_USER = xxx.root (exact match)
   DB_PASSWORD = [your password] (no quotes)
   DB_SSL = true (not "true")
   ```

2. Check TiDB cluster status:
   - Go to TiDB Cloud dashboard
   - Ensure cluster is "Active" (not paused)
   - Free tier may pause after inactivity

3. Regenerate password:
   - TiDB Cloud → Your Cluster → Connect
   - Click "Reset Password"
   - Update `DB_PASSWORD` in Render

### Issue: "CORS policy error"

**Symptoms:**
- Frontend works but API calls fail
- Browser console shows: "blocked by CORS policy"

**Solutions:**
1. Check `FRONTEND_URL` in Render:
   - Must match Vercel URL exactly
   - No trailing slash
   - Include https://
   - Example: `https://school-portal-xyz.vercel.app`

2. Wait for redeploy:
   - After changing env vars, Render auto-redeploys
   - Wait 1-2 minutes
   - Check logs for "Server is running"

3. Clear browser cache:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Issue: "JWT malformed" or "Invalid token"

**Symptoms:**
- Login works but subsequent requests fail
- Error: "jwt malformed" or "invalid signature"

**Solutions:**
1. Verify `JWT_SECRET`:
   - Must be at least 32 characters
   - Same across all backend instances
   - No special characters that need escaping

2. Generate new secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Update in Render environment variables

3. Clear frontend localStorage:
   - Browser DevTools → Application → Local Storage
   - Clear all items
   - Try logging in again

---

## 🔵 Frontend Issues

### Issue: "Failed to fetch" or "Network Error"

**Symptoms:**
- Frontend loads but shows network errors
- Can't login or load data

**Solutions:**
1. Verify `VITE_API_URL` in Vercel:
   - Go to Vercel → Project → Settings → Environment Variables
   - Should be: `https://your-backend.onrender.com/api/v1`
   - Must include `/api/v1` at the end
   - Must be https:// (not http://)

2. Test backend directly:
   - Open backend URL in browser
   - Should see: "School Portal API is running"
   - If not, backend has issues (see Backend Issues above)

3. Redeploy frontend:
   - Vercel → Deployments → Latest → Redeploy

### Issue: "Blank page" or "White screen"

**Symptoms:**
- Frontend URL loads but shows nothing
- No errors in browser console

**Solutions:**
1. Check build logs:
   - Vercel → Deployments → Latest → View Build Logs
   - Look for build errors

2. Check browser console:
   - F12 → Console tab
   - Look for JavaScript errors

3. Verify build output:
   - Ensure `dist` folder is generated
   - Check Vercel build settings:
     - Build Command: `npm run build`
     - Output Directory: `dist`

### Issue: "Module not found" during build

**Symptoms:**
- Vercel build fails
- Error: "Cannot find module 'xxx'"

**Solutions:**
1. Check package.json:
   - Ensure all dependencies are listed
   - Run locally: `npm install`

2. Clear Vercel cache:
   - Vercel → Deployments → Latest → Redeploy
   - Check "Clear cache and redeploy"

3. Verify Node version:
   - Vercel uses Node 18 by default
   - Add to package.json if needed:
     ```json
     "engines": {
       "node": "18.x"
     }
     ```

---

## 🟡 Database Issues

### Issue: "Table doesn't exist"

**Symptoms:**
- Backend logs: "ER_NO_SUCH_TABLE"
- API returns 500 errors

**Solutions:**
1. Run schema.sql:
   - TiDB Cloud → SQL Editor
   - Copy content from `backend/database/schema.sql`
   - Paste and execute

2. Verify database name:
   - Check `DB_NAME=school_portal` in Render
   - Run in TiDB: `SHOW DATABASES;`
   - Run: `USE school_portal;`
   - Run: `SHOW TABLES;`

3. Check table names:
   - Ensure case matches (MySQL is case-sensitive on Linux)

### Issue: "Too many connections"

**Symptoms:**
- Intermittent database errors
- Error: "ER_TOO_MANY_USER_CONNECTIONS"

**Solutions:**
1. Check connection pooling:
   - Verify `backend/src/config/db.js` uses connection pool
   - Set reasonable pool limits:
     ```javascript
     connectionLimit: 10
     ```

2. Close unused connections:
   - Ensure connections are released after queries
   - Use `connection.release()` or `connection.end()`

3. Restart backend:
   - Render → Manual Deploy → Clear build cache & deploy

### Issue: "Cluster is paused"

**Symptoms:**
- Database suddenly stops responding
- TiDB dashboard shows "Paused"

**Solutions:**
1. Resume cluster:
   - TiDB Cloud → Your Cluster
   - Click "Resume"
   - Wait 1-2 minutes

2. Keep cluster active:
   - Free tier pauses after 24h inactivity
   - Set up a cron job to ping database every 12 hours

---

## 🟢 Deployment Issues

### Issue: "Build failed" on Render

**Symptoms:**
- Render shows "Build failed"
- Red error in deployment logs

**Solutions:**
1. Check build logs:
   - Look for specific error message
   - Common: missing dependencies, syntax errors

2. Test locally:
   ```bash
   cd backend
   npm install
   npm start
   ```
   - Fix any errors that appear

3. Verify package.json:
   - Ensure `"start": "node server.js"` exists
   - Check all dependencies are listed

### Issue: "Build failed" on Vercel

**Symptoms:**
- Vercel shows "Failed"
- Build logs show errors

**Solutions:**
1. Check build logs:
   - Vercel → Deployments → Failed → View Build Logs

2. Test locally:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   - Fix any errors

3. Check for TypeScript errors:
   - Run: `npm run lint`
   - Fix all errors before deploying

### Issue: "Deployment takes too long"

**Symptoms:**
- Render/Vercel stuck on "Building..."
- Takes more than 10 minutes

**Solutions:**
1. Cancel and retry:
   - Cancel current deployment
   - Try again

2. Check for infinite loops:
   - Review recent code changes
   - Look for build scripts that don't exit

3. Contact support:
   - Render/Vercel may have platform issues

---

## 🟣 Environment Variable Issues

### Issue: "Environment variable not found"

**Symptoms:**
- Backend logs: "undefined" for env vars
- Features don't work

**Solutions:**
1. Verify variable names:
   - Must match exactly (case-sensitive)
   - No spaces before/after names
   - Example: `DB_HOST` not `DB_HOST ` or ` DB_HOST`

2. Check variable values:
   - No quotes around values (Render adds them automatically)
   - No extra spaces
   - Example: `school_portal` not `"school_portal"` or ` school_portal `

3. Redeploy after adding:
   - Render auto-redeploys when env vars change
   - Vercel requires manual redeploy

### Issue: "Wrong environment variable value"

**Symptoms:**
- Variables are set but have wrong values
- Features behave incorrectly

**Solutions:**
1. Double-check values:
   - Copy-paste to avoid typos
   - Verify against source (TiDB, etc.)

2. Check for special characters:
   - Passwords with special chars may need escaping
   - Try regenerating password without special chars

3. Update and redeploy:
   - Change value in dashboard
   - Wait for redeploy to complete

---

## 🔧 General Debugging Steps

### 1. Check Logs

**Render:**
```
Dashboard → Your Service → Logs tab
```
Look for:
- Error messages (red text)
- Stack traces
- Database connection messages

**Vercel:**
```
Dashboard → Deployments → Latest → View Function Logs
```
Look for:
- Build errors
- Runtime errors
- API call failures

**Browser:**
```
F12 → Console tab
F12 → Network tab
```
Look for:
- JavaScript errors
- Failed API requests (red)
- CORS errors

### 2. Test Each Layer

**Database:**
```sql
-- In TiDB SQL Editor
USE school_portal;
SHOW TABLES;
SELECT * FROM users LIMIT 1;
```

**Backend:**
```bash
# In browser or curl
curl https://your-backend.onrender.com/
```

**Frontend:**
```
# Open in browser
https://your-app.vercel.app
# Check console for errors
```

### 3. Verify Configuration

**Checklist:**
- [ ] All environment variables are set
- [ ] No typos in variable names or values
- [ ] URLs match exactly (no trailing slashes)
- [ ] Database credentials are correct
- [ ] TiDB cluster is active
- [ ] Backend is deployed and running
- [ ] Frontend is deployed and running

### 4. Test Locally First

Before deploying, always test locally:

```bash
# Backend
cd backend
npm install
npm start
# Should see: "Server is running on port 5000"

# Frontend (new terminal)
cd frontend
npm install
npm run dev
# Should see: "Local: http://localhost:5173"
```

If it works locally but not in production, it's likely a configuration issue.

---

## 📞 Getting Help

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com/
- Status: https://status.render.com/

### Vercel Support
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Status: https://www.vercel-status.com/

### TiDB Cloud Support
- Docs: https://docs.pingcap.com/tidbcloud/
- Community: https://ask.pingcap.com/
- Support: support@pingcap.com

---

## 💡 Pro Tips

1. **Always check logs first** - 90% of issues are visible in logs

2. **Test locally before deploying** - Catch errors early

3. **Use environment variable templates** - Avoid typos

4. **Keep credentials secure** - Use password manager

5. **Document changes** - Note what you changed and why

6. **One change at a time** - Easier to identify what broke

7. **Clear cache when in doubt** - Browser, Vercel, Render

8. **Wait for deploys to complete** - Don't test while deploying

9. **Check service status pages** - Platform may be down

10. **Ask for help** - Community forums are helpful

---

Still stuck? Check the other documentation files:
- `DEPLOYMENT_GUIDE.md` - Step-by-step instructions
- `TEST_DEPLOYMENT.md` - Testing procedures
- `ENV_VARIABLES_REFERENCE.md` - Environment variable details
