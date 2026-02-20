# Test Your Deployment

Quick tests to verify your deployment is working correctly.

## 1. Test Backend API

### Using Browser
Open these URLs in your browser:

```
https://your-backend.onrender.com/
```

You should see: "School Portal API is running"

### Using curl (Command Line)
```bash
# Test backend is alive
curl https://your-backend.onrender.com/

# Test login endpoint
curl -X POST https://your-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@schoolportal.com","password":"admin123"}'
```

### Using Postman
1. Import: `backend/postman/School_Portal_API.postman_collection.json`
2. Create new environment with:
   - `base_url`: `https://your-backend.onrender.com`
3. Test the login endpoint

## 2. Test Frontend

### Open in Browser
```
https://your-app.vercel.app
```

### Check Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any errors (red text)
4. Check Network tab for failed requests

### Test Login Flow
1. Go to login page
2. Enter test credentials
3. Verify you're redirected to dashboard
4. Check if data loads correctly

## 3. Test Database Connection

### From Backend Logs (Render)
1. Go to Render Dashboard
2. Open your web service
3. Click "Logs" tab
4. Look for: "✅ Database connected successfully"

### Test Query
If you have a test endpoint, try:
```bash
curl https://your-backend.onrender.com/api/v1/test/db
```

## 4. Test CORS

### Check Browser Console
If you see errors like:
```
Access to XMLHttpRequest at 'https://backend...' from origin 'https://frontend...' 
has been blocked by CORS policy
```

**Fix**: Update `FRONTEND_URL` in Render environment variables to match your Vercel URL exactly.

## 5. Common Issues & Solutions

### Backend Returns 500 Error
- Check Render logs for detailed error
- Verify database credentials in environment variables
- Ensure TiDB cluster is active

### Frontend Shows "Network Error"
- Verify `VITE_API_URL` in Vercel environment variables
- Check if backend URL is correct and accessible
- Look for CORS errors in browser console

### "Cannot connect to database"
- Verify TiDB cluster is running (not paused)
- Check `DB_HOST`, `DB_USER`, `DB_PASSWORD` in Render
- Ensure `DB_SSL=true` is set

### Render Service Slow to Respond
- Free tier services sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Subsequent requests are fast

## 6. Monitoring

### Render Dashboard
- View real-time logs
- Check service status
- Monitor resource usage

### Vercel Dashboard
- View deployment logs
- Check build status
- Monitor function invocations

### TiDB Cloud Dashboard
- Monitor database connections
- Check query performance
- View storage usage

## 7. Test Checklist

- [ ] Backend root URL responds
- [ ] Login endpoint works
- [ ] Frontend loads without errors
- [ ] Can login successfully
- [ ] Dashboard displays data
- [ ] Can create/edit/delete records
- [ ] All user roles work correctly
- [ ] No CORS errors in console
- [ ] No 500 errors in backend logs
- [ ] Database queries execute successfully

---

## Emergency Rollback

If something goes wrong:

### Render
1. Go to "Events" tab
2. Click "Rollback" on previous successful deployment

### Vercel
1. Go to "Deployments" tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### Database
- TiDB has automatic backups
- Contact support for restore if needed

---

## Performance Tips

1. **Warm up backend**: Set up a cron job to ping your backend every 10 minutes
2. **Monitor errors**: Set up error tracking (Sentry, LogRocket)
3. **Cache static assets**: Vercel does this automatically
4. **Optimize images**: Use WebP format and lazy loading
5. **Database indexes**: Ensure proper indexes on frequently queried columns

---

Good luck! 🎉
