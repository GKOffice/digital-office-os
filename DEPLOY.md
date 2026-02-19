# 🚀 Deploy Digital Office OS

## Quick Deploy (5 minutes)

### Step 1: Database (Neon - Free)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create new project: "digital-office"
3. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)

### Step 2: Backend (Render - Free)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/GKOffice/digital-office-os)

Or manually:
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect GitHub → Select `GKOffice/digital-office-os`
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm run db:migrate && npm run db:seed && npm start`
6. Add Environment Variables:
   - `DATABASE_URL` = your Neon connection string
   - `JWT_SECRET` = (click "Generate" or use: `openssl rand -base64 32`)
   - `ADMIN_PASSWORD` = `staging123` (or your choice)
   - `FRONTEND_URL` = (add after frontend deploy)
   - `NODE_ENV` = `production`

### Step 3: Frontend (Vercel - Free)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GKOffice/digital-office-os&root-directory=frontend&env=NEXT_PUBLIC_API_URL&envDescription=Backend%20API%20URL&envLink=https://github.com/GKOffice/digital-office-os%23step-2-backend-render---free)

Or manually:
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import `GKOffice/digital-office-os`
3. **Root Directory**: `frontend`
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = your Render backend URL (e.g., `https://digital-office-api.onrender.com`)

### Step 4: Update CORS

1. Go back to Render dashboard
2. Add/update: `FRONTEND_URL` = your Vercel URL (e.g., `https://digital-office-os.vercel.app`)

---

## Login Credentials

- **Email**: `admin@empire.io`
- **Password**: Whatever you set as `ADMIN_PASSWORD` (default: `staging123`)

---

## Verify Deployment

### Health Check
```bash
curl https://your-backend.onrender.com/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

### Test Login
```bash
curl -X POST https://your-backend.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@empire.io","password":"staging123"}'
```

---

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Vercel        │ ──── │   Render        │ ──── │   Neon          │
│   (Frontend)    │      │   (Backend)     │      │   (PostgreSQL)  │
│   Next.js 14    │      │   Express.js    │      │   Free Tier     │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## Troubleshooting

### "CORS Error"
- Check `FRONTEND_URL` is set correctly in Render
- Make sure it matches your Vercel URL exactly (no trailing slash)

### "Database connection failed"
- Verify `DATABASE_URL` includes `?sslmode=require` for Neon
- Check Neon dashboard → Connection string

### "Login failed"
- Run seed again: In Render dashboard → Shell → `npm run db:seed`
- Verify `ADMIN_PASSWORD` matches what you're entering

### Backend is slow/sleeping
- Free tier services sleep after inactivity
- First request takes ~30s to wake up
- Upgrade to paid tier for always-on
