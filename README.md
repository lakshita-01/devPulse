# DevPulse 🚀

DevPulse is a **full‑stack developer productivity & analytics platform** designed to help teams and individual developers track projects, manage tasks, collaborate in real time, and visualize development activity.

The project follows a **modern full‑stack architecture**:

* **Frontend**: React + Tailwind CSS
* **Backend**: Python (FastAPI‑style server)
* **Real‑time features**: WebSockets
* **Modular & scalable structure** suitable for startups and production use

---

## 📌 Key Features

* 🔐 Authentication & Authorization
* 📊 Developer & Project Analytics Dashboard
* 🧩 Kanban Board for task management
* 👥 Team & Project Management
* ⚡ Real‑time updates using WebSockets
* 🎨 Modern UI using Tailwind + reusable component system
* 🧪 Test & report structure ready for CI

---

## 🏗️ Project Structure

```
devPulse-main/
│
├── backend/                  # Backend (Python)
│   ├── .env                  # Environment variables
│   ├── requirements.txt      # Python dependencies
│   └── server.py             # Backend entry point
│
├── frontend/                 # Frontend (React)
│   ├── .env                  # Frontend environment variables
│   ├── package.json          # JS dependencies & scripts
│   ├── craco.config.js       # CRA configuration overrides
│   ├── tailwind.config.js    # Tailwind CSS config
│   ├── postcss.config.js     # PostCSS config
│   ├── public/               # Static assets
│   │   └── index.html
│   └── src/
│       ├── index.js          # React entry point
│       ├── App.js            # Root component
│       ├── components/       # Reusable UI components
│       ├── pages/            # App pages (Dashboard, Analytics, etc.)
│       ├── contexts/         # Global state (Auth, Socket)
│       ├── hooks/            # Custom React hooks
│       └── lib/              # Utility functions
│
├── tests/                    # Test scaffolding
├── test_reports/             # Pytest reports
├── memory/                   # App memory / cache placeholder
├── test_result.md            # Test output summary
└── README.md                 # Project documentation
```

---

## ⚙️ Tech Stack

### Frontend

* **React (CRA + CRACO)**
* **Tailwind CSS**
* **ShadCN‑style UI components**
* **WebSockets (real‑time updates)**

### Backend

* **Python 3.9+**
* **FastAPI / Async server pattern**
* **WebSocket support**
* **MongoDB** (Database)

---

## 🚀 Quick Start

### Prerequisites

* Node.js **v18+**
* Python **3.9+**
* **MongoDB** (Choose one):
  - MongoDB Atlas (Cloud - FREE, Recommended) ⭐
  - MongoDB Community Edition (Local)
  - Docker

### Step 1: Setup MongoDB

**EASIEST: Run the setup wizard**
```bash
setup-wizard.bat
```

Or manually setup MongoDB Atlas:
1. Sign up: https://www.mongodb.com/cloud/atlas/register
2. Create FREE M0 cluster
3. Get connection string
4. Update `backend/.env` with your MONGO_URL

See `QUICKSTART.md` for detailed instructions.

### Step 2: Install Dependencies

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 3: Run the Application

**Option A: Use start script (Recommended)**
```bash
start-all.bat
```

**Option B: Manual start**

Terminal 1 - Backend:
```bash
cd backend
python server.py
```

Terminal 2 - Frontend:
```bash
cd frontend
npm start
```

### Step 4: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

---

## 📦 Required Dependencies

### System Requirements

* Node.js **v18+**
* Python **3.9+**
* npm or yarn

---

### Backend Dependencies

Located in:

```
backend/requirements.txt
```

Install using:

```bash
pip install -r requirements.txt
```

---

### Frontend Dependencies

Located in:

```
frontend/package.json
```

Install using:

```bash
npm install
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

Example:

```
PORT=8000
DEBUG=True
SECRET_KEY=your_secret_key
```

### Frontend (`frontend/.env`)

Example:

```
REACT_APP_API_URL=http://localhost:8000
```

---

## ▶️ How to Run the Project

### 1️⃣ Start Backend Server

```bash
cd backend
python server.py
```

Backend runs at:

```
http://localhost:8000
```

---

### 2️⃣ Start Frontend

```bash
cd frontend
npm start
```

Frontend runs at:

```
http://localhost:3000
```

---

## 🔄 Running Both Together (Recommended)

Open **two terminals**:

**Terminal 1**

```bash
cd backend
python server.py
```

**Terminal 2**

```bash
cd frontend
npm start
```

---

## 🧪 Testing

### Backend Tests

Test structure is prepared for **pytest**:

```
tests/
```

Run tests:

```bash
pytest
```

Reports are generated inside:

```
test_reports/
```

---

## 🧩 Frontend Pages Overview

| Page            | Description                    |
| --------------- | ------------------------------ |
| Dashboard       | Project overview & activity    |
| Analytics       | Developer productivity metrics |
| Kanban Board    | Task & workflow management     |
| Projects        | Project listing & details      |
| Team Management | Members & roles                |
| Settings        | User & app settings            |

---

## 🔌 Plugins

Located in:

```
frontend/plugins/
```

* **Health Check Plugin** – App health monitoring
* **Visual Edits Plugin** – Dev tooling support

---

## 🚀 Production Build

### Frontend

```bash
npm run build
```

### Backend

Use a production server like:

```bash
gunicorn server:app
```

---

## 📈 Future Enhancements

* OAuth login (Google/GitHub)
* Database integration (PostgreSQL / MongoDB)
* CI/CD pipeline
* Docker support
* AI‑based productivity insights

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Submit a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## ✨ Author

Developed with ❤️ for learning, scaling, and startup‑ready deployment.

