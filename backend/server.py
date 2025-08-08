import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# IMPORTANT:
# - Bind handled by supervisor to 0.0.0.0:8001
# - MongoDB URL must come from env var MONGO_URL (never hardcode)
# - All routes MUST be prefixed with '/api'

MONGO_URL = os.environ.get("MONGO_URL")

app = FastAPI(title="CryptoBoost Backend", openapi_url="/api/openapi.json", docs_url="/api/docs")

# CORS: allow frontend origin via env if provided, fallback to permissive for dev
frontend_origin = os.environ.get("FRONTEND_ORIGIN")
allow_origins = [frontend_origin] if frontend_origin else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mongo setup (lazy connect): use Motor for async
mongo_client = None
roles_collection = None
users_collection = None

if MONGO_URL:
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        mongo_client = AsyncIOMotorClient(MONGO_URL)
        db_name = os.environ.get("MONGO_DB", "cryptoboost")
        db = mongo_client[db_name]
        roles_collection = db["roles"]
        users_collection = db["users"]
    except Exception as e:
        # Leave collections as None; health endpoint will reflect error
        roles_collection = None
        users_collection = None


def uuid4_str() -> str:
    return str(uuid.uuid4())


class Role(BaseModel):
    id: str = Field(default_factory=uuid4_str)
    name: str


class ActionRequest(BaseModel):
    action: str
    payload: Optional[Dict[str, Any]] = None


@app.on_event("startup")
async def ensure_seed_data():
    # Seed default roles and admin user if Mongo is available
    if roles_collection is None or users_collection is None:
        return
    try:
        # roles
        existing_roles = await roles_collection.count_documents({})
        if existing_roles == 0:
            await roles_collection.insert_many([
                {"id": uuid4_str(), "name": "client"},
                {"id": uuid4_str(), "name": "admin"},
            ])
        # admin user (dummy, no auth implemented here)
        admin_exists = await users_collection.count_documents({"role": "admin"})
        if admin_exists == 0:
            await users_collection.insert_one({
                "id": uuid4_str(),
                "email": "admin@cryptoboost.local",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
    except Exception:
        # Non-blocking
        pass


@app.get("/api/health")
async def health():
    mongo_status = False
    mongo_error: Optional[str] = None
    if MONGO_URL and roles_collection is not None:
        try:
            # ping command
            await roles_collection.database.command("ping")
            mongo_status = True
        except Exception as e:
            mongo_error = str(e)
    else:
        mongo_error = "MONGO_URL not configured or client not initialized"

    return {
        "status": "ok",
        "backend_time": datetime.now(timezone.utc).isoformat(),
        "mongo": {"connected": mongo_status, "error": mongo_error},
    }


@app.get("/api/roles", response_model=List[Role])
async def get_roles():
    # If DB unavailable, return default set
    if roles_collection is None:
        return [Role(name="client"), Role(name="admin")]

    cursor = roles_collection.find({}, {"_id": 0})
    roles: List[Role] = []
    async for doc in cursor:
        # Ensure id & name present and id is string
        rid = doc.get("id") or uuid4_str()
        name = doc.get("name", "client")
        roles.append(Role(id=str(rid), name=name))
    if not roles:
        # fallback in case collection is empty
        roles = [Role(name="client"), Role(name="admin")]
    return roles


@app.post("/api/actions/echo")
async def echo_action(req: ActionRequest):
    # simple action echo with server timestamp and action id
    return {
        "action_id": uuid4_str(),
        "received": req.model_dump(),
        "server_time": datetime.now(timezone.utc).isoformat(),
        "status": "processed",
    }


@app.get("/api/sync/time")
async def sync_time():
    return {
        "server_time": datetime.now(timezone.utc).isoformat(),
        "message": "sync ok",
    }