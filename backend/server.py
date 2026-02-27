# Import your other dependencies here...
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, WebSocket, WebSocketDisconnect, BackgroundTasks
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId
import json
import secrets
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

allow_origins=[
    "https://dev-pulse-orcin.vercel.app",
    "https://dev-pulse.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000"
]

# MongoDB connection with fallback
try:
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'devpulse')
    
    if "mongodb+srv" in mongo_url or "mongodb.net" in mongo_url:
        try:
            import certifi
            
            client = AsyncIOMotorClient(
                mongo_url,
                serverSelectionTimeoutMS=30000,
                connectTimeoutMS=30000,
                socketTimeoutMS=30000,
                tls=True,
                tlsAllowInvalidCertificates=True,
                retryWrites=True,
                w='majority'
            )
        except ImportError:
            client = AsyncIOMotorClient(
                mongo_url,
                serverSelectionTimeoutMS=30000,
                connectTimeoutMS=30000,
                socketTimeoutMS=30000,
                tls=True,
                tlsAllowInvalidCertificates=True,
                retryWrites=True
            )
    else:
        # Local MongoDB
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=5000)
    
    db = client[db_name]
    print(f"[INFO] Connecting to MongoDB database: {db_name}")
    
    # Verify connection on startup
    async def verify_conn():
        try:
            await client.admin.command('ping')
            print("[INFO] MongoDB connection verified")
        except Exception as e:
            print(f"[ERROR] MongoDB ping failed: {e}")
            print("[INFO] Continuing anyway - connection will retry automatically")
            
except Exception as e:
    print(f"[ERROR] MongoDB connection failed: {e}")
    print("[INFO] Please install MongoDB or use MongoDB Atlas")
    print("[INFO] See MONGODB_SETUP.md for instructions")
    raise

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('JWT_SECRET', 'dev-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, workspace_id: str):
        await websocket.accept()
        if workspace_id not in self.active_connections:
            self.active_connections[workspace_id] = []
        self.active_connections[workspace_id].append(websocket)

    def disconnect(self, websocket: WebSocket, workspace_id: str):
        if workspace_id in self.active_connections:
            self.active_connections[workspace_id].remove(websocket)

    async def broadcast_to_workspace(self, workspace_id: str, message: dict):
        if workspace_id in self.active_connections:
            for connection in self.active_connections[workspace_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()



# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await verify_conn()
    yield
    # Shutdown
    client.close()

# Enums
class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class Role(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"

# Pydantic Models
class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class MemberCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    workspace_id: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar: Optional[str] = None
    workspaces: List[str] = []
    must_change_password: bool = False

class WorkspaceMember(BaseModel):
    user_id: str
    role: Role = Role.MEMBER

class WorkspaceCreate(BaseModel):
    name: str

class WorkspaceResponse(BaseModel):
    id: str
    name: str
    owner_id: str
    members: List[Dict[str, Any]] = []
    created_at: datetime

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    workspace_id: str

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    workspace_id: str
    created_at: datetime

class SubTask(BaseModel):
    title: str
    completed: bool = False

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    project_id: str
    workspace_id: str
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    subtasks: List[SubTask] = []
    generate_ai: bool = False

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    subtasks: Optional[List[SubTask]] = None

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: TaskPriority
    project_id: str
    workspace_id: str
    assignee_id: Optional[str] = None
    assignee: Optional[Dict[str, Any]] = None
    due_date: Optional[datetime] = None
    subtasks: List[SubTask] = []
    ai_generated: bool = False
    created_at: datetime
    updated_at: datetime

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    workspace_id: Optional[str] = None

class WebhookEvent(BaseModel):
    event: str
    data: Dict[str, Any]
    secret: Optional[str] = None

class InviteCreate(BaseModel):
    workspace_id: str
    email: Optional[EmailStr] = None

class InviteResponse(BaseModel):
    id: str
    workspace_id: str
    token: str
    email: Optional[str] = None
    created_at: datetime
    expires_at: datetime

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = authorization.replace("Bearer ", "")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

async def verify_workspace_access(user: dict, workspace_id: str, required_role: Optional[Role] = None):
    workspace = await db.workspaces.find_one({"id": workspace_id}, {"_id": 0})
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    # Check if user is member
    member = next((m for m in workspace.get("members", []) if m["user_id"] == user["id"]), None)
    if not member:
        raise HTTPException(status_code=403, detail="Access denied")
    
    if required_role == Role.ADMIN and member["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    return workspace

def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == "_id":
                continue
            if isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, (list, dict)):
                result[key] = serialize_doc(value)
            else:
                result[key] = value
        return result
    return doc

# Create the main app
app = FastAPI(title="DevPulse SaaS API", lifespan=lifespan)
api_router = APIRouter(prefix="/api")

# Root endpoint
@app.get("/")
async def root():
    return {"message": "DevPulse API is running", "status": "ok"}

# Auth routes
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(ObjectId())
    user_doc = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email,
        "password": get_password_hash(user_data.password),
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.name}",
        "workspaces": [],
        "must_change_password": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    
    # Create default workspace
    workspace_id = str(ObjectId())
    workspace_doc = {
        "id": workspace_id,
        "name": f"{user_data.name}'s Workspace",
        "owner_id": user_id,
        "members": [{"user_id": user_id, "role": "admin"}],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.workspaces.insert_one(workspace_doc)
    
    # Update user workspaces
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"workspaces": [workspace_id]}}
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id})
    
    user_response = UserResponse(
        id=user_id,
        name=user_data.name,
        email=user_data.email,
        avatar=user_doc["avatar"],
        workspaces=[workspace_id]
    )
    
    return TokenResponse(
        access_token=access_token,
        user=user_response,
        workspace_id=workspace_id
    )

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["id"]})
    
    user_response = UserResponse(
        id=user["id"],
        name=user["name"],
        email=user["email"],
        avatar=user.get("avatar"),
        workspaces=user.get("workspaces", []),
        must_change_password=user.get("must_change_password", False)
    )
    
    workspaces = user.get("workspaces", [])
    workspace_id = workspaces[0] if workspaces else None
    
    return TokenResponse(
        access_token=access_token,
        user=user_response,
        workspace_id=workspace_id
    )

# Workspace routes
@api_router.get("/workspaces", response_model=List[WorkspaceResponse])
async def get_workspaces(user: dict = Depends(get_current_user)):
    workspaces = await db.workspaces.find(
        {"members.user_id": user["id"]},
        {"_id": 0}
    ).to_list(100)
    
    result = []
    for ws in workspaces:
        # Fetch member details
        members = []
        for member in ws.get("members", []):
            member_user = await db.users.find_one({"id": member["user_id"]}, {"_id": 0, "password": 0})
            if member_user:
                members.append({
                    "user_id": member["user_id"],
                    "name": member_user.get("name"),
                    "email": member_user.get("email"),
                    "avatar": member_user.get("avatar"),
                    "role": member["role"]
                })
        
        result.append(WorkspaceResponse(
            id=ws["id"],
            name=ws["name"],
            owner_id=ws["owner_id"],
            members=members,
            created_at=datetime.fromisoformat(ws["created_at"])
        ))
    
    return result

@api_router.post("/workspaces", response_model=WorkspaceResponse)
async def create_workspace(workspace_data: WorkspaceCreate, user: dict = Depends(get_current_user)):
    workspace_id = str(ObjectId())
    workspace_doc = {
        "id": workspace_id,
        "name": workspace_data.name,
        "owner_id": user["id"],
        "members": [{"user_id": user["id"], "role": "admin"}],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.workspaces.insert_one(workspace_doc)
    
    # Update user workspaces
    await db.users.update_one(
        {"id": user["id"]},
        {"$push": {"workspaces": workspace_id}}
    )
    
    return WorkspaceResponse(
        id=workspace_id,
        name=workspace_data.name,
        owner_id=user["id"],
        members=[{"user_id": user["id"], "role": "admin"}],
        created_at=datetime.now(timezone.utc)
    )

# Get workspace members (for admin)
@api_router.get("/workspaces/{workspace_id}/members")
async def get_workspace_members(workspace_id: str, user: dict = Depends(get_current_user)):
    workspace = await verify_workspace_access(user, workspace_id)
    
    members = []
    for member in workspace.get("members", []):
        member_user = await db.users.find_one({"id": member["user_id"]}, {"_id": 0, "password": 0})
        if member_user:
            members.append({
                "user_id": member["user_id"],
                "name": member_user.get("name"),
                "email": member_user.get("email"),
                "avatar": member_user.get("avatar"),
                "role": member["role"]
            })
    
    return {"members": members}

# Invite member to workspace (admin only)
@api_router.post("/workspaces/{workspace_id}/invite")
async def invite_member(workspace_id: str, email: str, user: dict = Depends(get_current_user)):
    # Verify user is admin
    workspace = await verify_workspace_access(user, workspace_id, required_role=Role.ADMIN)
    
    # Check if user exists
    invited_user = await db.users.find_one({"email": email}, {"_id": 0})
    if not invited_user:
        raise HTTPException(status_code=404, detail="User not found. They need to register first.")
    
    # Check if already a member
    if any(m["user_id"] == invited_user["id"] for m in workspace.get("members", [])):
        raise HTTPException(status_code=400, detail="User is already a member")
    
    # Add member to workspace
    await db.workspaces.update_one(
        {"id": workspace_id},
        {"$push": {"members": {"user_id": invited_user["id"], "role": "member"}}}
    )
    
    # Add workspace to user
    await db.users.update_one(
        {"id": invited_user["id"]},
        {"$push": {"workspaces": workspace_id}}
    )
    
    return {"message": "Member invited successfully", "user": {
        "id": invited_user["id"],
        "name": invited_user["name"],
        "email": invited_user["email"]
    }}

# Create member account (admin only)
@api_router.post("/workspaces/{workspace_id}/members")
async def create_member(workspace_id: str, member_data: MemberCreate, user: dict = Depends(get_current_user)):
    await verify_workspace_access(user, workspace_id, required_role=Role.ADMIN)
    
    # Check if user exists
    existing = await db.users.find_one({"email": member_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create member account
    member_id = str(ObjectId())
    member_doc = {
        "id": member_id,
        "name": member_data.name,
        "email": member_data.email,
        "password": get_password_hash(member_data.password),
        "avatar": f"https://api.dicebear.com/7.x/avataaars/svg?seed={member_data.name}",
        "workspaces": [workspace_id],
        "must_change_password": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(member_doc)
    
    # Add member to workspace
    await db.workspaces.update_one(
        {"id": workspace_id},
        {"$push": {"members": {"user_id": member_id, "role": "member"}}}
    )
    
    return {"message": "Member created successfully", "user": {
        "id": member_id,
        "name": member_data.name,
        "email": member_data.email
    }}

# Change password
@api_router.post("/auth/change-password")
async def change_password(password_data: PasswordChange, user: dict = Depends(get_current_user)):
    # Verify old password
    if not verify_password(password_data.old_password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    # Update password
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "password": get_password_hash(password_data.new_password),
            "must_change_password": False
        }}
    )
    
    return {"message": "Password changed successfully"}

# Create workspace invite (admin only)
@api_router.post("/workspaces/{workspace_id}/invites", response_model=InviteResponse)
async def create_workspace_invite(workspace_id: str, invite_data: InviteCreate, user: dict = Depends(get_current_user)):
    await verify_workspace_access(user, workspace_id, required_role=Role.ADMIN)
    
    token = secrets.token_urlsafe(32)
    invite_id = str(ObjectId())
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=7)
    
    invite_doc = {
        "id": invite_id,
        "workspace_id": workspace_id,
        "token": token,
        "email": invite_data.email,
        "created_at": now.isoformat(),
        "expires_at": expires_at.isoformat(),
        "created_by": user["id"]
    }
    
    await db.invites.insert_one(invite_doc)
    
    return InviteResponse(
        id=invite_id,
        workspace_id=workspace_id,
        token=token,
        email=invite_data.email,
        created_at=now,
        expires_at=expires_at
    )

# Get invite details
@api_router.get("/invites/{token}")
async def get_invite_details(token: str):
    invite = await db.invites.find_one({"token": token}, {"_id": 0})
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    
    expires_at = datetime.fromisoformat(invite["expires_at"])
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invite expired")
    
    workspace = await db.workspaces.find_one({"id": invite["workspace_id"]}, {"_id": 0})
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    
    return {
        "workspace_name": workspace["name"],
        "email": invite.get("email"),
        "expires_at": invite["expires_at"]
    }

# Accept invite
@api_router.post("/invites/{token}/accept")
async def accept_invite(token: str, user: dict = Depends(get_current_user)):
    invite = await db.invites.find_one({"token": token}, {"_id": 0})
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    
    expires_at = datetime.fromisoformat(invite["expires_at"])
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invite expired")
    
    workspace_id = invite["workspace_id"]
    
    # Check if already a member
    workspace = await db.workspaces.find_one({"id": workspace_id})
    if any(m["user_id"] == user["id"] for m in workspace.get("members", []) if m["user_id"] == user["id"]):
        return {"message": "You are already a member of this workspace"}
    
    # Add member to workspace
    await db.workspaces.update_one(
        {"id": workspace_id},
        {"$push": {"members": {"user_id": user["id"], "role": "member"}}}
    )
    
    # Add workspace to user
    await db.users.update_one(
        {"id": user["id"]},
        {"$push": {"workspaces": workspace_id}}
    )
    
    return {"message": "Successfully joined workspace", "workspace_id": workspace_id}

# Project routes
@api_router.get("/projects/{workspace_id}", response_model=List[ProjectResponse])
async def get_projects(workspace_id: str, user: dict = Depends(get_current_user)):
    await verify_workspace_access(user, workspace_id)
    
    projects = await db.projects.find(
        {"workspace_id": workspace_id},
        {"_id": 0}
    ).to_list(100)
    
    return [ProjectResponse(**serialize_doc(p)) for p in projects]

@api_router.post("/projects", response_model=ProjectResponse)
async def create_project(project_data: ProjectCreate, user: dict = Depends(get_current_user)):
    await verify_workspace_access(user, project_data.workspace_id)
    
    project_id = str(ObjectId())
    project_doc = {
        "id": project_id,
        "name": project_data.name,
        "description": project_data.description,
        "workspace_id": project_data.workspace_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.projects.insert_one(project_doc)
    
    return ProjectResponse(**serialize_doc(project_doc))

# Task routes
@api_router.get("/tasks/{workspace_id}")
async def get_tasks(workspace_id: str, project_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    await verify_workspace_access(user, workspace_id)
    
    query = {"workspace_id": workspace_id}
    if project_id:
        query["project_id"] = project_id
    
    tasks = await db.tasks.find(query, {"_id": 0}).to_list(1000)
    
    # Populate assignee details
    for task in tasks:
        if task.get("assignee_id"):
            assignee = await db.users.find_one(
                {"id": task["assignee_id"]},
                {"_id": 0, "password": 0, "workspaces": 0}
            )
            if assignee:
                task["assignee"] = serialize_doc(assignee)
    
    return {"tasks": serialize_doc(tasks)}

@api_router.post("/tasks")
async def create_task(task_data: TaskCreate, background_tasks: BackgroundTasks, user: dict = Depends(get_current_user)):
    await verify_workspace_access(user, task_data.workspace_id)
    
    task_id = str(ObjectId())
    task_doc = {
        "id": task_id,
        "title": task_data.title,
        "description": task_data.description,
        "status": task_data.status.value,
        "priority": task_data.priority.value,
        "project_id": task_data.project_id,
        "workspace_id": task_data.workspace_id,
        "assignee_id": task_data.assignee_id,
        "due_date": task_data.due_date.isoformat() if task_data.due_date else None,
        "subtasks": [s.dict() for s in task_data.subtasks],
        "ai_generated": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tasks.insert_one(task_doc)
    
    # Populate assignee
    if task_doc.get("assignee_id"):
        assignee = await db.users.find_one(
            {"id": task_doc["assignee_id"]},
            {"_id": 0, "password": 0}
        )
        if assignee:
            task_doc["assignee"] = serialize_doc(assignee)
    
    # Broadcast to workspace
    await manager.broadcast_to_workspace(task_data.workspace_id, {
        "type": "task_created",
        "task": serialize_doc(task_doc)
    })
    
    return {"task": serialize_doc(task_doc)}

@api_router.patch("/tasks/{task_id}")
async def update_task(task_id: str, task_update: TaskUpdate, user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await verify_workspace_access(user, task["workspace_id"])
    
    update_data = {k: v for k, v in task_update.dict(exclude_unset=True).items() if v is not None}
    
    # Convert enums to strings
    if "status" in update_data:
        update_data["status"] = update_data["status"].value
    if "priority" in update_data:
        update_data["priority"] = update_data["priority"].value
    if "due_date" in update_data and update_data["due_date"]:
        update_data["due_date"] = update_data["due_date"].isoformat()
    if "subtasks" in update_data:
        update_data["subtasks"] = [s.dict() for s in update_data["subtasks"]]
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.tasks.update_one(
        {"id": task_id},
        {"$set": update_data}
    )
    
    updated_task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    
    # Populate assignee
    if updated_task.get("assignee_id"):
        assignee = await db.users.find_one(
            {"id": updated_task["assignee_id"]},
            {"_id": 0, "password": 0}
        )
        if assignee:
            updated_task["assignee"] = serialize_doc(assignee)
    
    # Broadcast to workspace
    await manager.broadcast_to_workspace(task["workspace_id"], {
        "type": "task_updated",
        "task": serialize_doc(updated_task)
    })
    
    return {"task": serialize_doc(updated_task)}

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str, user: dict = Depends(get_current_user)):
    task = await db.tasks.find_one({"id": task_id}, {"_id": 0})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await verify_workspace_access(user, task["workspace_id"])
    
    await db.tasks.delete_one({"id": task_id})
    
    # Broadcast to workspace
    await manager.broadcast_to_workspace(task["workspace_id"], {
        "type": "task_deleted",
        "task_id": task_id
    })
    
    return {"message": "Task deleted"}

# Analytics routes
@api_router.get("/analytics/{workspace_id}")
async def get_analytics(workspace_id: str, user: dict = Depends(get_current_user)):
    await verify_workspace_access(user, workspace_id)
    
    tasks = await db.tasks.find({"workspace_id": workspace_id}, {"_id": 0}).to_list(1000)
    
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t["status"] == "done"])
    
    # Tasks by status
    tasks_by_status = {}
    for task in tasks:
        status = task["status"]
        tasks_by_status[status] = tasks_by_status.get(status, 0) + 1
    
    # Tasks by priority
    tasks_by_priority = {}
    for task in tasks:
        priority = task["priority"]
        tasks_by_priority[priority] = tasks_by_priority.get(priority, 0) + 1
    
    # Weekly data (last 7 days)
    weekly_data = []
    for i in range(6, -1, -1):
        date = datetime.now(timezone.utc) - timedelta(days=i)
        date_str = date.date().isoformat()
        
        completed_on_date = 0
        for task in tasks:
            if task["status"] == "done" and task.get("updated_at"):
                try:
                    updated_date = datetime.fromisoformat(task["updated_at"]).date()
                    if updated_date == date.date():
                        completed_on_date += 1
                except:
                    pass
        
        weekly_data.append({
            "date": date_str,
            "completed": completed_on_date
        })
    
    # Workload by assignee
    workload = {}
    for task in tasks:
        if task.get("assignee_id") and task["status"] != "done":
            assignee_id = task["assignee_id"]
            if assignee_id not in workload:
                assignee = await db.users.find_one({"id": assignee_id}, {"_id": 0, "password": 0})
                if assignee:
                    workload[assignee_id] = {
                        "name": assignee.get("name"),
                        "avatar": assignee.get("avatar"),
                        "tasks": 0
                    }
            if assignee_id in workload:
                workload[assignee_id]["tasks"] += 1
    
    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "tasks_by_status": tasks_by_status,
        "tasks_by_priority": tasks_by_priority,
        "weekly_data": weekly_data,
        "workload": list(workload.values())
    }

# Webhook endpoint
@api_router.post("/webhooks")
async def handle_webhook(webhook: WebhookEvent):
    WEBHOOK_SECRET = os.environ.get('WEBHOOK_SECRET', 'dev-webhook-secret')
    
    if webhook.secret != WEBHOOK_SECRET:
        logging.warning("Invalid webhook secret")
        # Allow in dev mode
        if os.environ.get('ENV') == 'production':
            raise HTTPException(status_code=401, detail="Invalid secret")
    
    logging.info(f"Webhook received: {webhook.event}")
    
    if webhook.event == "ai.task_complete":
        task_id = webhook.data.get("task_id")
        subtasks = webhook.data.get("subtasks", [])
        workspace_id = webhook.data.get("workspace_id")
        
        if task_id:
            await db.tasks.update_one(
                {"id": task_id},
                {"$set": {
                    "subtasks": subtasks,
                    "ai_generated": True,
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Broadcast update
            if workspace_id:
                await manager.broadcast_to_workspace(workspace_id, {
                    "type": "task_ai_complete",
                    "task_id": task_id
                })
    
    return {"received": True}

# AI subtask generation endpoint
@api_router.post("/ai/generate-subtasks")
async def generate_subtasks(data: dict, user: dict = Depends(get_current_user)):
    prompt = data.get("prompt", "")
    
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    try:
        # Use a simple LLM-style generation (mock for now, replace with actual LLM)
        import re
        
        # Extract task title
        task_match = re.search(r'Task: (.+?)(?:\n|$)', prompt)
        task_title = task_match.group(1) if task_match else "task"
        
        # Generate subtasks based on common patterns
        subtasks = [
            {"title": f"Research and plan {task_title}", "completed": False},
            {"title": f"Implement core functionality", "completed": False},
            {"title": f"Test and validate results", "completed": False},
            {"title": f"Document and review", "completed": False}
        ]
        
        return {"subtasks": subtasks}
    except Exception as e:
        logging.error(f"AI generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate subtasks")

# WebSocket endpoint
@app.websocket("/ws/{workspace_id}")
async def websocket_endpoint(websocket: WebSocket, workspace_id: str):
    await manager.connect(websocket, workspace_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or process messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket, workspace_id)

# Add CORS middleware BEFORE including router
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(api_router)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
