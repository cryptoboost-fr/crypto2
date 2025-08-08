import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from dotenv import load_dotenv

# IMPORTANT:
# - Bind handled by supervisor to 0.0.0.0:8001
# - MongoDB URL must come from env var MONGO_URL (never hardcode)
# - All routes MUST be prefixed with '/api'

MONGO_URL = os.environ.get("MONGO_URL")
SUPABASE_URL = os.environ.get("SUPABASE_URL")  # e.g., https://xxxxx.supabase.co
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")

REST_BASE = f"{SUPABASE_URL}/rest/v1" if SUPABASE_URL else None
AUTH_BASE = f"{SUPABASE_URL}/auth/v1" if SUPABASE_URL else None

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

# Mongo setup (lazy connect) - we keep it to respect platform contract
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
    except Exception:
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


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@app.on_event("startup")
async def ensure_seed_data():
    # Seed default roles and admin user in Mongo (optional; Supabase owns real data)
    if roles_collection is None or users_collection is None:
        return
    try:
        existing_roles = await roles_collection.count_documents({})
        if existing_roles == 0:
            await roles_collection.insert_many([
                {"id": uuid4_str(), "name": "client"},
                {"id": uuid4_str(), "name": "admin"},
            ])
        admin_exists = await users_collection.count_documents({"role": "admin"})
        if admin_exists == 0:
            await users_collection.insert_one({
                "id": uuid4_str(),
                "email": "admin@cryptoboost.local",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })
    except Exception:
        pass


@app.get("/api/health")
async def health():
    mongo_status = False
    mongo_error: Optional[str] = None
    if MONGO_URL and roles_collection is not None:
        try:
            await roles_collection.database.command("ping")
            mongo_status = True
        except Exception as e:
            mongo_error = str(e)
    else:
        mongo_error = "MONGO_URL not configured or client not initialized"

    supabase_ready = bool(SUPABASE_URL and SUPABASE_ANON_KEY)

    return {
        "status": "ok",
        "backend_time": datetime.now(timezone.utc).isoformat(),
        "mongo": {"connected": mongo_status, "error": mongo_error},
        "supabase": {
            "configured": supabase_ready,
            "url_present": bool(SUPABASE_URL),
            "key_present": bool(SUPABASE_ANON_KEY),
        },
    }


@app.get("/api/roles", response_model=List[Role])
async def get_roles():
    # Prefer Supabase if configured
    if REST_BASE and SUPABASE_ANON_KEY:
        import httpx
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                f"{REST_BASE}/roles?select=*",
                headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {SUPABASE_ANON_KEY}"},
            )
            r.raise_for_status()
            items = r.json()
            roles = [Role(id=str(x["id"]), name=x["name"]) for x in items]
            return roles if roles else [Role(name="client"), Role(name="admin")]

    # Fallback Mongo or static
    if roles_collection is None:
        return [Role(name="client"), Role(name="admin")]

    cursor = roles_collection.find({}, {"_id": 0})
    out: List[Role] = []
    async for doc in cursor:
        rid = doc.get("id") or uuid4_str()
        name = doc.get("name", "client")
        out.append(Role(id=str(rid), name=name))
    return out or [Role(name="client"), Role(name="admin")]


@app.post("/api/actions/echo")
async def echo_action(req: ActionRequest):
    return {
        "action_id": uuid4_str(),
        "received": req.model_dump(),
        "server_time": datetime.now(timezone.utc).isoformat(),
        "status": "processed",
    }


@app.get("/api/sync/time")
async def sync_time():
    return {"server_time": datetime.now(timezone.utc).isoformat(), "message": "sync ok"}


# ============ Supabase Auth wrappers ============
@app.post("/api/auth/register")
async def supabase_register(payload: RegisterRequest):
    if not (AUTH_BASE and SUPABASE_ANON_KEY and REST_BASE):
        raise HTTPException(status_code=500, detail="Supabase not configured on backend")

    import httpx
    async with httpx.AsyncClient(timeout=20.0) as client:
        # 1) Sign up
        r = await client.post(
            f"{AUTH_BASE}/signup",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "email": payload.email,
                "password": payload.password,
                "data": {"full_name": payload.full_name or payload.email.split("@")[0]},
            },
        )
        if r.status_code >= 300:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        data = r.json()
        user = (data or {}).get("user") or data  # defensive for shape changes
        user_id = user.get("id") if user else None
        if not user_id:
            raise HTTPException(status_code=500, detail="Signup did not return user id")

        # 2) Insert application user as client
        # Get client role id
        rr = await client.get(
            f"{REST_BASE}/roles?select=id&name=eq.client",
            headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {SUPABASE_ANON_KEY}"},
        )
        rr.raise_for_status()
        rows = rr.json()
        if not rows:
            raise HTTPException(status_code=500, detail="client role missing in roles table")
        role_id = rows[0]["id"]

        ins = await client.post(
            f"{REST_BASE}/users",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            json=[{"id": user_id, "email": payload.email, "role_id": role_id}],
        )
        if ins.status_code >= 300:
            # If conflict on email, try update id/role
            raise HTTPException(status_code=ins.status_code, detail=ins.text)

        return {"user_id": user_id, "email": payload.email, "status": "registered"}


@app.post("/api/auth/login")
async def supabase_login(payload: LoginRequest):
    if not (AUTH_BASE and SUPABASE_ANON_KEY):
        raise HTTPException(status_code=500, detail="Supabase not configured on backend")

    import httpx
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(
            f"{AUTH_BASE}/token?grant_type=password",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json",
            },
            json={"email": payload.email, "password": payload.password},
        )
        if r.status_code >= 300:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        return r.json()


# ============ Supabase domain endpoints (simple) ============
@app.get("/api/plans")
async def list_plans():
    if not (REST_BASE and SUPABASE_ANON_KEY):
        return []
    import httpx
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            f"{REST_BASE}/investment_plans?select=*",
            headers={"apikey": SUPABASE_ANON_KEY, "Authorization": f"Bearer {SUPABASE_ANON_KEY}"},
        )
        r.raise_for_status()
        return r.json()


@app.post("/api/admin/plans")
async def create_plan(plan: Dict[str, Any] = Body(...)):
    # NOTE: No auth enforcement here; for demo purposes only.
    if not (REST_BASE and SUPABASE_ANON_KEY):
        raise HTTPException(status_code=500, detail="Supabase not configured on backend")
    import httpx
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            f"{REST_BASE}/investment_plans",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            json=[plan],
        )
        if r.status_code >= 300:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        return r.json()


@app.post("/api/user/investments")
async def create_investment(data: Dict[str, Any] = Body(...)):
    if not (REST_BASE and SUPABASE_ANON_KEY):
        raise HTTPException(status_code=500, detail="Supabase not configured on backend")
    import httpx
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            f"{REST_BASE}/user_investments",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            json=[data],
        )
        if r.status_code >= 300:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        return r.json()


@app.post("/api/user/transactions")
async def create_transaction(data: Dict[str, Any] = Body(...)):
    if not (REST_BASE and SUPABASE_ANON_KEY):
        raise HTTPException(status_code=500, detail="Supabase not configured on backend")
    import httpx
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            f"{REST_BASE}/transactions",
            headers={
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=representation",
            },
            json=[data],
        )
        if r.status_code >= 300:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        return r.json()