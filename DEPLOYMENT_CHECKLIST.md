# Deployment Checklist

Track your deployment progress here!

## ☐ STEP 1: TiDB Cloud Database Setup

- [ ] Sign up for TiDB Cloud account
- [ ] Create new Serverless cluster
- [ ] Save database credentials:
  - Host: `_______________________________`
  - Port: `4000`
  - User: `_______________________________`
  - Password: `_______________________________`
- [ ] Create `school_portal` database
- [ ] Test connection

## ☐ STEP 2: Render Backend Deployment

- [ ] Sign up for Render account (use GitHub)
- [ ] Push code to GitHub repository
- [ ] Create new Web Service on Render
- [ ] Configure service settings:
  - Root Directory: `backend`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] Add environment variables (11 variables)
- [ ] Deploy and wait for completion
- [ ] Save backend URL: `_______________________________`
- [ ] Run database schema/seed scripts
- [ ] Test backend API endpoint

## ☐ STEP 3: Vercel Frontend Deployment

- [ ] Sign up for Vercel account (use GitHub)
- [ ] Import GitHub repository
- [ ] Configure project:
  - Root Directory: `frontend`
  - Framework: Vite
- [ ] Add environment variable: `VITE_API_URL`
- [ ] Deploy and wait for completion
- [ ] Save frontend URL: `_______________________________`

## ☐ STEP 4: Connect Frontend & Backend

- [ ] Update Render backend `FRONTEND_URL` with Vercel URL
- [ ] Wait for backend to redeploy
- [ ] Test CORS is working

## ☐ STEP 5: Final Testing

- [ ] Open frontend URL in browser
- [ ] Test login functionality
- [ ] Test as Admin user
- [ ] Test as School Head user
- [ ] Test as Teacher user
- [ ] Test as Student user
- [ ] Test as Parent user
- [ ] Verify all CRUD operations work
- [ ] Check browser console for errors
- [ ] Check Render logs for backend errors

## ☐ STEP 6: Documentation

- [ ] Save all credentials securely (password manager)
- [ ] Create local `.env.production` files (for reference only)
- [ ] Document any custom configurations
- [ ] Share URLs with team/stakeholders

---

## Quick Reference

### My Deployment URLs
```
TiDB Host: _______________________________
Backend API: _______________________________
Frontend App: _______________________________
```

### Test Credentials
(Add your test user credentials here for quick access)

```
Admin:
- Email: _______________________________
- Password: _______________________________

School Head:
- Email: _______________________________
- Password: _______________________________
```

---

## Notes & Issues

(Track any issues or important notes during deployment)

- 
- 
- 

---

**Started**: ___/___/______
**Completed**: ___/___/______
