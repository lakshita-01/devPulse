# 🚀 Quick Deployment Checklist

## ✅ Repository Setup
- [x] Git repository initialized
- [x] Pushed to: https://github.com/lakshita-01/devPulse.git
- [x] Deployment configs created

---

## 📦 Next Steps

### 1. Deploy Backend to Render (5 minutes)

1. Go to **[render.com](https://render.com)** → Sign up/Login
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub: `lakshita-01/devPulse`
4. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   ```
   MONGO_URL=mongodb+srv://devpulse:devpulse123@devpulse.vwygoeu.mongodb.net/
   DB_NAME=devpulse
   SECRET_KEY=your-random-secret-key-here
   DEBUG=False
   ```
6. Click **"Create Web Service"**
7. **Copy your backend URL** (e.g., `https://devpulse-backend.onrender.com`)

---

### 2. Deploy Frontend to Vercel (3 minutes)

1. Go to **[vercel.com](https://vercel.com)** → Sign up/Login
2. Click **"Add New"** → **"Project"**
3. Import: `lakshita-01/devPulse`
4. Settings:
   - **Framework**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Environment Variables:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   REACT_APP_WS_URL=wss://your-backend-url.onrender.com
   ```
6. Click **"Deploy"**
7. **Copy your frontend URL** (e.g., `https://devpulse.vercel.app`)

---

### 3. Update Backend CORS (2 minutes)

After getting your Vercel URL, update `backend/server.py` line 23:

```python
allow_origins=["https://devpulse.vercel.app", "http://localhost:3000"]
```

Then push changes:
```bash
git add backend/server.py
git commit -m "Update CORS with Vercel URL"
git push
```

Render will auto-redeploy!

---

### 4. MongoDB Atlas Setup

Ensure MongoDB Atlas Network Access allows all IPs:
1. Go to MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (Allow from anywhere)
3. Save

---

## 🎉 Your Live URLs

After deployment:
- **Frontend**: `https://devpulse.vercel.app`
- **Backend**: `https://devpulse-backend.onrender.com`
- **API Docs**: `https://devpulse-backend.onrender.com/docs`

---

## 📝 Important Notes

- **First load**: Backend may take 30s to wake up (free tier)
- **Auto-deploy**: Push to GitHub → Auto-deploys to both platforms
- **Logs**: Check Render/Vercel dashboards for errors
- **Custom domain**: Add in Vercel/Render settings

---

## 🔧 Troubleshooting

**Backend not starting?**
- Check Render logs
- Verify MongoDB connection string
- Ensure all environment variables are set

**Frontend can't connect?**
- Verify `REACT_APP_API_URL` in Vercel
- Check CORS settings in backend
- Wait for backend to wake up (30s)

**MongoDB connection failed?**
- Whitelist 0.0.0.0/0 in Network Access
- Verify connection string format
- Check username/password

---

## 📚 Full Documentation

See **DEPLOYMENT.md** for detailed instructions and troubleshooting.

---

## ⚡ Quick Commands

**Update and redeploy:**
```bash
git add .
git commit -m "Your changes"
git push
```

Both platforms will auto-deploy!
