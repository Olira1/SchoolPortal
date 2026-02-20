# Environment Variables Reference

Copy-paste these into your deployment platforms.

---

## Render (Backend) Environment Variables

Add these in: Render Dashboard → Your Service → Environment

```
NODE_ENV=production
```

```
PORT=5000
```

```
JWT_SECRET=your-super-secret-jwt-key-change-this-to-something-random-and-long
```

```
JWT_EXPIRES_IN=24h
```

```
DB_HOST=gateway01.xxx.prod.aws.tidbcloud.com
```
(Replace with your actual TiDB host)

```
DB_PORT=4000
```

```
DB_USER=xxxxxx.root
```
(Replace with your actual TiDB user)

```
DB_PASSWORD=your-tidb-password
```
(Replace with your actual TiDB password)

```
DB_NAME=school_portal
```

```
DB_SSL=true
```

```
FRONTEND_URL=https://your-app.vercel.app
```
(Update this AFTER deploying frontend to Vercel)

---

## Vercel (Frontend) Environment Variables

Add these in: Vercel Dashboard → Your Project → Settings → Environment Variables

```
VITE_API_URL=https://your-backend.onrender.com/api/v1
```
(Replace with your actual Render backend URL)

---

## How to Generate a Strong JWT_SECRET

### Option 1: Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Option 2: Using OpenSSL
```bash
openssl rand -hex 32
```

### Option 3: Online Generator
Visit: https://generate-secret.vercel.app/32

Copy the generated string and use it as your `JWT_SECRET`.

---

## Important Notes

1. **Never commit these values to Git!**
2. **JWT_SECRET must be the same** across all backend instances
3. **FRONTEND_URL must match exactly** (no trailing slash)
4. **VITE_API_URL must include** `/api/v1` at the end
5. **DB_SSL must be** `true` for TiDB Cloud

---

## Verification Checklist

After adding environment variables:

### Render
- [ ] All 11 variables are added
- [ ] No typos in variable names
- [ ] Values don't have extra spaces
- [ ] `FRONTEND_URL` matches Vercel URL exactly

### Vercel
- [ ] `VITE_API_URL` is added
- [ ] URL includes `/api/v1` at the end
- [ ] URL matches Render backend URL

---

## Update Process

### When Backend URL Changes
1. Update `VITE_API_URL` in Vercel
2. Redeploy frontend (automatic on save)

### When Frontend URL Changes
1. Update `FRONTEND_URL` in Render
2. Backend will auto-redeploy

### When Database Credentials Change
1. Update `DB_HOST`, `DB_USER`, `DB_PASSWORD` in Render
2. Backend will auto-redeploy
3. Test connection in logs

---

## Troubleshooting

### "Environment variable not found"
- Check spelling of variable names (case-sensitive)
- Ensure no extra spaces before/after values
- Redeploy after adding variables

### "CORS error"
- Verify `FRONTEND_URL` in Render matches Vercel URL exactly
- Check for trailing slashes (should not have one)
- Wait for backend to redeploy after changing

### "Database connection failed"
- Verify all DB_* variables are correct
- Check TiDB cluster is active
- Ensure `DB_SSL=true` (not "true" in quotes)

---

Save this file for future reference!
