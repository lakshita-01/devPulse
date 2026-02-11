# Authentication Troubleshooting Guide

## IMPORTANT: MongoDB Required

DevPulse requires MongoDB to store data. If you see "authentication failed", MongoDB is likely not installed.

### Quick Setup (Choose One):

#### Option 1: MongoDB Atlas (Recommended - FREE & Easy)
1. Run: `setup-mongodb.bat` and choose option 2
2. Or manually:
   - Sign up: https://www.mongodb.com/cloud/atlas/register
   - Create FREE M0 cluster
   - Get connection string
   - Update `backend/.env`:
     ```
     MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/
     ```

#### Option 2: Install MongoDB Locally
1. Download: https://www.mongodb.com/try/download/community
2. Install with "Install as Service" checked
3. MongoDB will start automatically

#### Option 3: Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

## Quick Fix Steps

### 1. Start MongoDB
**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# OR run mongod directly
mongod
```

**Mac:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 2. Verify MongoDB is Running
```bash
cd backend
python test_mongo.py
```
You should see: `[OK] MongoDB is running and accessible`

### 3. Start Backend Server
```bash
cd backend
python server.py
```
Server should start on: `http://localhost:8000`

### 4. Verify Backend is Running
Open browser and go to: `http://localhost:8000`
You should see: `{"message": "DevPulse API is running", "status": "ok"}`

### 5. Start Frontend
```bash
cd frontend
npm start
```
Frontend should start on: `http://localhost:3000`

## Common Issues

### Issue: "Authentication failed" on registration

**Cause 1: Backend not running**
- Solution: Start backend with `python server.py`

**Cause 2: MongoDB not running**
- Solution: Start MongoDB (see step 1 above)

**Cause 3: Wrong API URL**
- Check `frontend/.env` has: `REACT_APP_BACKEND_URL=http://localhost:8000`
- Restart frontend after changing .env

**Cause 4: CORS issues**
- Backend CORS is now set to allow all origins
- Restart backend server

### Issue: "Network Error" or "ERR_CONNECTION_REFUSED"

**Solution:**
1. Make sure backend is running on port 8000
2. Check firewall isn't blocking port 8000
3. Verify `frontend/.env` has correct backend URL

### Debug Mode

Open browser console (F12) when registering to see detailed error logs:
- Registration attempt details
- API response
- Specific error messages

## Test Registration Manually

Run this test script to verify backend works:
```bash
cd backend
python test_api.py
```

This will test:
1. Server is running
2. Registration endpoint works
3. Returns proper response

## Still Having Issues?

1. Check browser console (F12) for errors
2. Check backend terminal for error logs
3. Verify all dependencies are installed:
   ```bash
   cd backend
   pip install -r requirements.txt
   
   cd ../frontend
   npm install
   ```
