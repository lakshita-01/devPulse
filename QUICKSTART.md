# QUICK START - MongoDB Atlas Setup

## You Need MongoDB to Run DevPulse

MongoDB is NOT installed on your computer. The EASIEST solution is MongoDB Atlas (cloud, free, no installation).

## 5-Minute Setup:

### 1. Create FREE MongoDB Atlas Account
🔗 https://www.mongodb.com/cloud/atlas/register

### 2. Create FREE Database
- Click "Build a Database"
- Choose **FREE** (M0 Sandbox)
- Click "Create"

### 3. Create User
- Username: `devpulse`
- Password: `devpulse123`
- Click "Create User"

### 4. Allow Network Access
- Click "Add My Current IP Address"
- Click "Finish and Close"

### 5. Get Connection String
- Click "Connect"
- Choose "Connect your application"
- Copy the string (looks like):
  ```
  mongodb+srv://devpulse:<password>@cluster0.xxxxx.mongodb.net/
  ```

### 6. Update backend/.env
Open `backend/.env` and replace the MONGO_URL line:

```
MONGO_URL=mongodb+srv://devpulse:devpulse123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**IMPORTANT:** Replace:
- `devpulse123` with your actual password
- `cluster0.xxxxx` with your actual cluster address

### 7. Start Backend
```bash
cd backend
python server.py
```

You should see:
```
[INFO] Connecting to MongoDB: mongodb+srv://...
INFO: Uvicorn running on http://0.0.0.0:8000
```

### 8. Start Frontend
```bash
cd frontend
npm start
```

### 9. Create Account
- Go to http://localhost:3000
- Click "Sign up"
- Create your account
- ✅ Should work now!

---

## Alternative: Install MongoDB Locally

If you prefer local installation:

1. Download: https://www.mongodb.com/try/download/community
2. Run installer
3. Check "Install MongoDB as a Service"
4. Keep `backend/.env` as:
   ```
   MONGO_URL=mongodb://localhost:27017
   ```

---

## Need Help?

Run this to test MongoDB connection:
```bash
cd backend
python test_mongo.py
```

Should see: `[OK] MongoDB is running and accessible`
