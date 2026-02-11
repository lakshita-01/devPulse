# Authentication Fix Guide

## Issue
Authentication failing on both sign up and sign in.

## Root Causes Fixed
1. ✅ CORS middleware moved before router inclusion
2. ✅ Explicit localhost origins added
3. ✅ Requirements.txt cleaned (removed emergentintegrations)

## Testing Authentication

### 1. Start Backend
```bash
cd backend
python server.py
```

Backend should start on: `http://localhost:8000`

### 2. Test Backend API
```bash
cd backend
python test_auth.py
```

This will test:
- Server connection
- User registration
- User login
- Authenticated requests

### 3. Start Frontend
```bash
cd frontend
npm start
```

Frontend should start on: `http://localhost:3000`

### 4. Test in Browser
1. Go to `http://localhost:3000`
2. Click "Try it Now" or "Sign In"
3. Try registering a new account:
   - Name: Test User
   - Email: test@example.com
   - Password: testpass123
4. Should redirect to dashboard

## Common Issues

### Issue: "Network Error" or "Failed to fetch"
**Solution**: Ensure backend is running on port 8000
```bash
cd backend
python server.py
```

### Issue: "CORS Error"
**Solution**: Already fixed in latest code. Pull latest changes:
```bash
git pull
```

### Issue: "Invalid credentials"
**Solution**: 
- For login: Make sure you registered first
- For register: Try a different email if user exists

### Issue: MongoDB connection error
**Solution**: Check your `.env` file has correct MongoDB URL:
```
MONGO_URL=mongodb+srv://devpulse:devpulse123@devpulse.vwygoeu.mongodb.net/
DB_NAME=devpulse
```

## Verify MongoDB Connection

```bash
cd backend
python test_mongo.py
```

## Check Backend Logs

When you start the backend, you should see:
```
[INFO] Connecting to MongoDB: mongodb+srv://...
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Check Frontend Console

Open browser DevTools (F12) → Console tab
- Should NOT see CORS errors
- Should see successful API calls

## API Endpoints

Test manually with curl:

### Register
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"testpass123"}'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'
```

## Still Having Issues?

1. Clear browser cache and localStorage
2. Restart both backend and frontend
3. Check MongoDB Atlas is accessible (whitelist 0.0.0.0/0)
4. Verify .env files are correct
5. Check no other service is using port 8000 or 3000

## Success Indicators

✅ Backend starts without errors
✅ Frontend connects to backend
✅ Registration creates user and workspace
✅ Login returns token
✅ Dashboard loads after authentication
