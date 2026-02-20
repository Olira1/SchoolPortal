# School Portal - Grade Management System

A comprehensive grade management system for Ethiopian secondary schools (Grades 9-12) with 7 user roles.

## Project Structure

```
SchoolPortal/
  ├── API CONTRACT/     # Complete API documentation
  ├── Design/           # UI/UX mockups
  ├── Plan/             # Project plan and roadmap
  ├── backend/          # Node.js + Express API
  └── frontend/         # React.js frontend
```

## Tech Stack

**Backend:**
- Node.js + Express
- MySQL
- JWT Authentication

**Frontend:**
- React.js + Vite
- Tailwind CSS
- React Router
- Axios + TanStack Query

## Getting Started

### Backend Setup

```bash
cd backend
npm install
# Create .env file (see backend/README.md)
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
# Create .env file (see frontend/README.md)
npm run dev
```

## User Roles

1. **Admin** - Platform-level management
2. **School Head** - School-level administration
3. **Teacher** - Grade entry and submission
4. **Class Head** - Class management and compilation
5. **Student** - View own reports
6. **Parent** - View child reports
7. **Store House** - Long-term records and transcripts

## Documentation

- [API Contract](API%20CONTRACT/apicontract.md)
- [Project Plan](Plan/plan.md)

## Development Status

- ✅ Phase 1: Project Setup (Complete)
- ✅ Phase 2: Database Design (Complete)
- ✅ Phase 3: Backend Development (Complete)
- ✅ Phase 4: Frontend Development (Complete)
- ✅ Phase 5: Integration & Testing (Complete)
- ⬜ Phase 6: Deployment

## Deployment

Ready to deploy? Start here:

1. **[START_HERE.md](START_HERE.md)** - Quick deployment checklist (35 min)
2. **[DEPLOYMENT_INDEX.md](DEPLOYMENT_INDEX.md)** - Complete documentation index

### Deployment Documentation
- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Detailed step-by-step instructions
- [Deployment Summary](DEPLOYMENT_SUMMARY.md) - Quick overview
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Track your progress
- [Environment Variables](ENV_VARIABLES_REFERENCE.md) - All env vars you need
- [Architecture](ARCHITECTURE.md) - System design and data flow
- [Testing](TEST_DEPLOYMENT.md) - Verify your deployment
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
- [Post-Deployment](POST_DEPLOYMENT.md) - What to do after deployment

### Deployment Stack
- **Database**: TiDB Cloud (Free Serverless)
- **Backend**: Render (Free Tier)
- **Frontend**: Vercel (Free Tier)
- **Total Cost**: $0/month




