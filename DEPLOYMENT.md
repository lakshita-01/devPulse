# DevPulse Deployment Guide

## 🚀 Deploy Backend to Render

### Step 1: Prepare Backend
1. Ensure `backend/requirements.txt` includes `uvicorn`:
   ```
   uvicorn
   ```

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `devpulse-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   - `MONGO_URL`: Your MongoDB Atlas connection string
   - `DB_NAME`: `devpulse`
   - `SECRET_KEY`: Generate a random secret key
   - `DEBUG`: `False`
6. Click **"Create Web Service"**
7. Wait for deployment (5-10 minutes)
8. Copy your backend URL: `https://devpulse-backend.onrender.com`

---

## 🌐 Deploy Frontend to Vercel

### Step 1: Update Frontend Environment
1. Create `frontend/.env.production`:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_WS_URL=wss://your-backend-url.onrender.com
   ```

### Step 2: Deploy to Vercel
1. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

2. **Option A: Deploy via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com) and sign up/login
   - Click **"Add New"** → **"Project"**
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Create React App
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
   - Add Environment Variables:
     - `REACT_APP_API_URL`: `https://your-backend-url.onrender.com`
     - `REACT_APP_WS_URL`: `wss://your-backend-url.onrender.com`
   - Click **"Deploy"**

3. **Option B: Deploy via CLI**
   ```bash
   cd frontend
   vercel
   ```
   - Follow prompts
   - Add environment variables when asked

### Step 3: Update Backend CORS
After deployment, update `backend/server.py` CORS origins:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-frontend-url.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend is running on Render
- [ ] Frontend is deployed on Vercel
- [ ] MongoDB Atlas is accessible (whitelist 0.0.0.0/0 in Network Access)
- [ ] Environment variables are set correctly
- [ ] CORS is configured with Vercel URL
- [ ] Test authentication flow
- [ ] Test WebSocket connections
- [ ] Test all features (Dashboard, Projects, Analytics, Team)

---

## 🔧 Troubleshooting

### Backend Issues
- **502 Bad Gateway**: Check Render logs, ensure MongoDB connection string is correct
- **CORS errors**: Add Vercel URL to CORS origins
- **Port issues**: Render automatically sets PORT environment variable

### Frontend Issues
- **API connection failed**: Verify REACT_APP_API_URL in Vercel environment variables
- **Build failed**: Check Node.js version (use 18.x)
- **Routing issues**: Ensure vercel.json rewrites are configured

### MongoDB Issues
- **Connection timeout**: Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas Network Access
- **Authentication failed**: Verify username/password in connection string

---

## 📝 Quick Commands

### Redeploy Backend (Render)
- Push to GitHub → Auto-deploys
- Or use Render dashboard: **"Manual Deploy"** → **"Deploy latest commit"**

### Redeploy Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

Or push to GitHub → Auto-deploys

---

## 🌍 Your Live URLs

After deployment:
- **Frontend**: `https://devpulse.vercel.app`
- **Backend**: `https://devpulse-backend.onrender.com`
- **API Docs**: `https://devpulse-backend.onrender.com/docs`

---

## 💡 Tips

1. **Free Tier Limitations**:
   - Render: Backend sleeps after 15 min inactivity (cold start ~30s)
   - Vercel: 100GB bandwidth/month
   - MongoDB Atlas: 512MB storage

2. **Custom Domain**:
   - Vercel: Add custom domain in project settings
   - Render: Add custom domain in service settings

3. **Environment Variables**:
   - Never commit `.env` files
   - Use platform-specific environment variable settings
   - Update variables → Redeploy

4. **Monitoring**:
   - Render: Built-in logs and metrics
   - Vercel: Analytics and logs in dashboard
   - MongoDB Atlas: Performance monitoring

---

## 🚨 Important Notes

- **MongoDB Atlas**: Ensure IP whitelist includes `0.0.0.0/0` for Render
- **WebSockets**: Render supports WebSockets on all plans
- **HTTPS**: Both Render and Vercel provide free SSL certificates
- **Cold Starts**: Free tier backends sleep after inactivity

---

## 📞 Support

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com
