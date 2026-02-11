# MongoDB Installation Guide

## Option 1: Install MongoDB Community Edition (Recommended)

### Windows
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer (.msi file)
3. Choose "Complete" installation
4. Check "Install MongoDB as a Service"
5. After installation, MongoDB will start automatically

### Verify Installation
```bash
mongod --version
```

## Option 2: Use MongoDB Atlas (Cloud - Free)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a free cluster (M0)
4. Get your connection string
5. Update `backend/.env`:
   ```
   MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/"
   ```

## Option 3: Use Docker

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Quick Fix: Use MongoDB Atlas (Easiest)

Since MongoDB is not installed locally, the fastest solution is to use MongoDB Atlas (free cloud database):

1. **Sign up**: https://www.mongodb.com/cloud/atlas/register
2. **Create Cluster**: Click "Build a Database" → Choose FREE (M0) tier
3. **Create User**: Set username and password
4. **Get Connection String**: 
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password

5. **Update backend/.env**:
   ```
   MONGO_URL="mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"
   DB_NAME="devpulse"
   ```

6. **Restart backend server**

This takes 5 minutes and requires no local installation!
