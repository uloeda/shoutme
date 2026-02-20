# Deployment Guide for ShoutMe

This guide walks you through deploying ShoutMe to production using **Vercel** (frontend) and **Railway** (backend).

## Prerequisites

- GitHub account (to push code)
- A credit/debit card for Railway (free tier available: $5/month credit)

## Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit: ShoutMe app"
git remote add origin https://github.com/YOUR_USERNAME/shoutme.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend to Railway

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub
- Authorize the app

### 2. Create New Project
- Click "New Project" → "Deploy from GitHub repo"
- Select your `shoutme` repository
- Railway will auto-detect it's a Python/Django app

### 3. Configure Environment Variables
In Railway dashboard, go to your project → Variables. Add:

```
SECRET_KEY=<generate-a-secure-key>
DEBUG=False
FRONTEND_URL=https://<your-vercel-domain>.vercel.app
```

**Generate a secure SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### 4. Configure Root Directory
- In Railway: Settings → Root Directory → Set to `code/backend`

### 5. Database Setup
- Railway automatically provides PostgreSQL
- The `DATABASE_URL` is auto-set as an environment variable
- Your Procfile handles migrations automatically

### 6. Deploy
- Click "Deploy" and wait (2-3 minutes)
- Your backend URL will be: `https://your-app-name.up.railway.app`
- Test: `https://your-app-name.up.railway.app/api/auth/login/` (should work)

---

## Step 3: Deploy Frontend to Vercel

### 1. Create Vercel Account
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub
- Authorize the app

### 2. Import Project
- Click "Import Project"
- Select your GitHub repository
- **Framework Preset:** React (Vite)
- **Root Directory:** `code/frontend`

### 3. Environment Variables
Add in Vercel project settings:

```
VITE_API_URL=https://your-backend.up.railway.app
```

### 4. Deploy
- Click "Deploy"
- Wait for build to complete (~1-2 minutes)
- Your frontend URL: `https://your-app.vercel.app`

---

## Step 4: Verify Deployment

1. **Test Backend:**
   - Visit `https://your-backend.up.railway.app/api/auth/login/`
   - Should return errors (expected - no request body)

2. **Test Frontend:**
   - Visit `https://your-app.vercel.app`
   - Should load the app

3. **Test API Connection:**
   - Try registering/logging in
   - Should work and store data in production database

---

## Step 5: Set Up Production Database (PostgreSQL)

Railway provides PostgreSQL automatically, but to connect locally for testing:

```bash
# In code/backend/.env, add:
DATABASE_URL=postgresql://user:password@host/dbname

# Then run migrations:
python manage.py migrate
```

---

## Common Issues

### CORS Errors
- Make sure `FRONTEND_URL` environment variable is set in Railway
- Check `CORS_ALLOWED_ORIGINS` in `settings.py`

### Database Errors
- Railway needs `psycopg2` (already in `requirements.txt`)
- Ensure migrations run: check Railway logs

### Static Files Not Loading
- Run: `python manage.py collectstatic --noinput`
- Railway handles this via Procfile

### "Bad Request" on Login
- Check if frontend API URL is correct
- Verify backend environment variables

---

## Continuous Deployment

- **Railway:** Auto-deploys when you `git push` to main
- **Vercel:** Auto-deploys when you `git push` to main

To update either app:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

---

## Local Development

Use `.env` file (copy from `.env.example`):

**Backend:**
```bash
cd code/backend
cp .env.example .env
# Edit .env with local settings (DEBUG=True, local DB, etc.)
python manage.py runserver
```

**Frontend:**
```bash
cd code/frontend
cp .env.example .env
# Edit VITE_API_URL to http://localhost:8000
npm install
npm run dev
```

---

## Environment Variables Summary

| Variable | Backend | Frontend | Value |
|----------|---------|----------|-------|
| `SECRET_KEY` | ✓ | | Auto-generated Django key |
| `DEBUG` | ✓ | | `True` (dev), `False` (prod) |
| `DATABASE_URL` | ✓ | | PostgreSQL connection string (Railway provides) |
| `FRONTEND_URL` | ✓ | | `https://your-app.vercel.app` |
| `VITE_API_URL` | | ✓ | `https://your-backend.up.railway.app` |

---

## Support

- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- Django deployment: https://docs.djangoproject.com/en/5.2/howto/deployment/
