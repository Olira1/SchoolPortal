# Deployment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / BROWSERS                        │
│                    (Students, Teachers, Admin)                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend Hosting)                    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  React.js Application (Vite Build)                        │  │
│  │  - Login Page                                             │  │
│  │  - Dashboards (Admin, Teacher, Student, etc.)            │  │
│  │  - Grade Management UI                                    │  │
│  │  - Reports & Analytics                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Environment Variables:                                         │
│  - VITE_API_URL = https://backend.onrender.com/api/v1         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ REST API Calls
                             │ (axios)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER (Backend Hosting)                     │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Node.js + Express API Server                             │  │
│  │  - Authentication (JWT)                                   │  │
│  │  - Authorization Middleware                               │  │
│  │  - REST API Endpoints                                     │  │
│  │  - Business Logic                                         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Environment Variables:                                         │
│  - NODE_ENV = production                                        │
│  - JWT_SECRET = [secret key]                                   │
│  - DB_HOST, DB_USER, DB_PASSWORD                               │
│  - FRONTEND_URL = https://app.vercel.app                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ MySQL Protocol
                             │ (mysql2 driver)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   TIDB CLOUD (Database)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  MySQL-Compatible Database                                │  │
│  │  - school_portal database                                 │  │
│  │  - Tables: users, schools, students, grades, etc.         │  │
│  │  - Indexes for performance                                │  │
│  │  - Automatic backups                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Configuration:                                                 │
│  - Serverless Tier (Free)                                      │
│  - SSL/TLS Enabled                                             │
│  - Auto-scaling                                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example: User Login

```
1. User enters credentials
   ↓
2. Frontend (Vercel)
   - Validates input
   - Sends POST to /api/v1/auth/login
   ↓
3. Backend (Render)
   - Receives request
   - Validates credentials
   - Queries database
   ↓
4. Database (TiDB)
   - Looks up user
   - Returns user data
   ↓
5. Backend (Render)
   - Generates JWT token
   - Returns token + user info
   ↓
6. Frontend (Vercel)
   - Stores token in localStorage
   - Redirects to dashboard
   - Uses token for subsequent requests
```

---

## Security Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Login (email/password)
       ▼
┌─────────────┐
│   Backend   │ 2. Verify credentials
└──────┬──────┘    Hash password with bcrypt
       │           Compare with DB
       ▼
┌─────────────┐
│  Database   │ 3. Return user data
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Backend   │ 4. Generate JWT token
└──────┬──────┘    Sign with JWT_SECRET
       │
       ▼
┌─────────────┐
│   Browser   │ 5. Store token
└──────┬──────┘    Save in localStorage
       │
       │ 6. Subsequent requests
       │    Include token in headers
       ▼
┌─────────────┐
│   Backend   │ 7. Verify token
└──────┬──────┘    Check signature
       │           Check expiration
       │           Extract user info
       ▼
    Allow/Deny
```

---

## Environment Variables Flow

### Development (Local)
```
Frontend (.env.local)
  VITE_API_URL = http://localhost:5000/api/v1
  ↓
Backend (.env)
  DB_HOST = localhost
  DB_USER = school_portal
  FRONTEND_URL = http://localhost:5173
```

### Production (Deployed)
```
Frontend (Vercel Environment)
  VITE_API_URL = https://backend.onrender.com/api/v1
  ↓
Backend (Render Environment)
  DB_HOST = gateway01.xxx.tidbcloud.com
  DB_USER = xxx.root
  FRONTEND_URL = https://app.vercel.app
```

---

## CORS Configuration

```
Browser (https://app.vercel.app)
  │
  │ Request to: https://backend.onrender.com/api/v1/...
  │
  ▼
Backend checks CORS
  │
  ├─ Origin matches FRONTEND_URL? ✅
  │  └─ Allow request
  │
  └─ Origin doesn't match? ❌
     └─ Block request (CORS error)
```

This is why `FRONTEND_URL` must match your Vercel URL exactly!

---

## Deployment Pipeline

```
Local Development
  │
  │ git add .
  │ git commit -m "..."
  │ git push origin main
  ▼
GitHub Repository
  │
  ├─────────────────┬─────────────────┐
  │                 │                 │
  ▼                 ▼                 ▼
Render            Vercel          (Manual)
  │                 │                 │
  │ Auto-deploy     │ Auto-deploy     │ Run SQL
  │ backend/        │ frontend/       │ in TiDB
  ▼                 ▼                 ▼
Backend Live    Frontend Live    Database Updated
```

---

## Free Tier Limitations

### Vercel
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ 100GB bandwidth/month
- ⚠️ No limitations for personal projects

### Render
- ✅ 750 hours/month (enough for 1 service)
- ✅ Automatic HTTPS
- ⚠️ Sleeps after 15 min inactivity
- ⚠️ First request after sleep: 30-60 seconds
- ⚠️ 512MB RAM, 0.1 CPU

### TiDB Cloud
- ✅ 5GB storage
- ✅ 50M Request Units/month
- ✅ Automatic backups
- ⚠️ May throttle if limits exceeded
- ⚠️ Cluster may pause if inactive

---

## Scaling Considerations

### When to Upgrade

**Render ($7/month):**
- Backend is too slow
- Need always-on service
- Need more RAM/CPU

**TiDB Cloud ($0.02/RU):**
- Exceeding 5GB storage
- Need more request units
- Need better performance

**Vercel (Free is usually enough):**
- Only upgrade if you need:
  - Team collaboration
  - Advanced analytics
  - More bandwidth

---

## Monitoring Points

```
┌─────────────┐
│   Vercel    │ → Check: Build logs, Function logs
└─────────────┘    Deployment status

┌─────────────┐
│   Render    │ → Check: Service logs, CPU/Memory
└─────────────┘    Response times, Errors

┌─────────────┐
│   TiDB      │ → Check: Connection count, Query time
└─────────────┘    Storage usage, Request units
```

---

## Backup Strategy

### Code
- ✅ Stored in GitHub
- ✅ Version controlled
- ✅ Can rollback anytime

### Database
- ✅ TiDB automatic backups
- ⚠️ Manual exports recommended
- 💡 Export SQL weekly:
  ```sql
  mysqldump -h [host] -u [user] -p school_portal > backup.sql
  ```

### Environment Variables
- ⚠️ Not backed up automatically
- 💡 Keep copy in password manager
- 💡 Document in `.env.production.template`

---

This architecture provides a solid foundation for your School Portal deployment!
