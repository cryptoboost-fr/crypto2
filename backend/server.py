import os
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple

from fastapi import FastAPI, HTTPException, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from dotenv import load_dotenv

# IMPORTANT:
# - Bind handled by supervisor to 0.0.0.0:8001
# - All routes MUST be prefixed with '/api'

# Load env
load_dotenv()

MONGO_URL = os.environ.get("MONGO_URL")
SUPABASE_URL = os.environ.get("SUPABASE_URL")  # e.g., https://xxxxx.supabase.co
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")

REST_BASE = f"{SUPABASE_URL}/rest/v1" if SUPABASE_URL else None
AUTH_BASE = f"{SUPABASE_URL}/auth/v1" if SUPABASE_URL else None

app = FastAPI(title="CryptoBoost Backend", openapi_url="/api/openapi.json", docs_url="/api/docs")

# CORS
frontend_origin = os.environ.get("FRONTEND_ORIGIN")
allow_origins = [frontend_origin] if frontend_origin else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Optional Mongo (kept for platform contract, not used in Supabase flow)
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


# -------- Supabase helpers --------
import httpx

_role_cache: Dict[str, str] = {}  # name->id
_role_rev_cache: Dict[str, str] = {}  # id->name


def sb_headers(bearer: Optional[str] = None, json: bool = True) -> Dict[str, str]:
    h = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    }
    if json:
        h["Content-Type"] = "application/json"
    if bearer:
        h["Authorization"] = f"Bearer {bearer}"
    return h


async def load_roles_cache() -> None:
    global _role_cache, _role_rev_cache
    if not (REST_BASE and SUPABASE_ANON_KEY):
        return
    if _role_cache and _role_rev_cache:
        return
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(f"{REST_BASE}/roles?select=*", headers=sb_headers())
        r.raise_for_status()
        for row in r.json():
            _role_cache[row["name"]] = row["id"]
            _role_rev_cache[row["id"]] = row["name"]


async def get_auth_user(access_token: str) -> Dict[str, Any]:
    if not (AUTH_BASE and SUPABASE_ANON_KEY):
        raise HTTPException(status_code=500, detail="Supabase not configured")
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(f"{AUTH_BASE}/user", headers=sb_headers(bearer=access_token, json=False))
        if r.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        r.raise_for_status()
        return r.json()


async def get_user_profile_with_role(access_token: str) -> Tuple[Dict[str, Any], str]:
    await load_roles_cache()
    auth_user = await get_auth_user(access_token)
    user_id = auth_user.get("id") or auth_user.get("user", {}).get("id")
    email = auth_user.get("email") or auth_user.get("user", {}).get("email")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            f"{REST_BASE}/users?select=id,email,role_id&id=eq.{user_id}",
            headers=sb_headers(),
        )
        r.raise_for_status()
        rows = r.json()
        if not rows:
            # auto-upsert as client if missing
            client_role = _role_cache.get("client")
            ins = await client.post(
                f"{REST_BASE}/users",
                headers=sb_headers(),
                json=[{"id": user_id, "email": email, "role_id": client_role}],
            )
            ins.raise_for_status()
            role_name = "client"
            profile = {"id": user_id, "email": email, "role_id": client_role}
        else:
            profile = rows[0]
            role_name = _role_rev_cache.get(profile["role_id"], "client")
    return profile, role_name


def require_bearer(token: Optional[str]) -> str:
    if not token:
        raise HTTPException(status_code=401, detail="Missing Authorization token")
    return token


# -------- Routes --------
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
    if REST_BASE and SUPABASE_ANON_KEY:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(f"{REST_BASE}/roles?select=*", headers=sb_headers())
            r.raise_for_status()
            items = r.json()
            return [Role(id=str(x["id"]), name=x["name"]) for x in items] or [Role(name="client"), Role(name="admin")]

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

    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(
            f"{AUTH_BASE}/signup",
            headers=sb_headers(),
            json={
                "email": payload.email,
                "password": payload.password,
                "data": {"full_name": payload.full_name or payload.email.split("@")[0]},
            },
        )
        if r.status_code >= 300:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        data = r.json()
        user = (data or {}).get("user") or data
        user_id = user.get("id") if user else None
        if not user_id:
            raise HTTPException(status_code=500, detail="Signup did not return user id")

        await load_roles_cache()
        client_role = _role_cache.get("client")
        ins = await client.post(
            f"{REST_BASE}/users",
            headers=sb_headers(),
            json=[{"id": user_id, "email": payload.email, "role_id": client_role}],
        )
        if ins.status_code >= 300:
            raise HTTPException(status_code=ins.status_code, detail=ins.text)

        return {"user_id": user_id, "email": payload.email, "status": "registered"}


@app.post("/api/auth/login")
async def supabase_login(payload: LoginRequest):
    if not (AUTH_BASE and SUPABASE_ANON_KEY):
        raise HTTPException(status_code=500, detail="Supabase not configured on backend")

    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(
            f"{AUTH_BASE}/token?grant_type=password",
            headers=sb_headers(),
            json={"email": payload.email, "password": payload.password},
        )
        if r.status_code >= 300:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        return r.json()


@app.get("/api/me")
async def me(authorization: Optional[str] = Header(None)):
    token = require_bearer(authorization.replace("Bearer ", "") if authorization else None)
    profile, role_name = await get_user_profile_with_role(token)
    return {"id": profile["id"], "email": profile["email"], "role": role_name}


# ============ Supabase domain endpoints ============
@app.get("/api/plans")
async def list_plans():
    if not (REST_BASE and SUPABASE_ANON_KEY):
        return []
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(f"{REST_BASE}/investment_plans?select=*", headers=sb_headers())
        r.raise_for_status()
        return r.json()


@app.post("/api/admin/plans")
async def create_plan(plan: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    token = require_bearer(authorization.replace("Bearer ", "") if authorization else None)
    _, role_name = await get_user_profile_with_role(token)
    if role_name != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            f"{REST_BASE}/investment_plans",
            headers=sb_headers(json=True),
            json=[plan],
        )
        if r.status_code >= 300:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        return r.json()


@app.post("/api/user/investments")
async def create_investment(data: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    token = require_bearer(authorization.replace("Bearer ", "") if authorization else None)
    profile, _ = await get_user_profile_with_role(token)
    data = dict(data)
    data["user_id"] = profile["id"]  # ensure ownership

    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            f"{REST_BASE}/user_investments",
            headers=sb_headers(json=True),
            json=[data],
        )
        if r.status_code >= 300:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        return r.json()


@app.get("/api/user/my-investments")
async def my_investments(authorization: Optional[str] = Header(None)):
    token = require_bearer(authorization.replace("Bearer ", "") if authorization else None)
    profile, _ = await get_user_profile_with_role(token)
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            f"{REST_BASE}/user_investments?select=*,plan:investment_plans(name)&user_id=eq.{profile['id']}",
            headers=sb_headers(),
        )
        r.raise_for_status()
        return r.json()


@app.post("/api/user/transactions")
async def create_transaction(data: Dict[str, Any] = Body(...), authorization: Optional[str] = Header(None)):
    token = require_bearer(authorization.replace("Bearer ", "") if authorization else None)
    profile, _ = await get_user_profile_with_role(token)
    data = dict(data)
    data["user_id"] = profile["id"]

    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            f"{REST_BASE}/transactions",
            headers=sb_headers(json=True),
            json=[data],
        )
        if r.status_code >= 300:
            raise HTTPException(status_code=r.status_code, detail=r.text)
        return r.json()


@app.get("/api/user/my-transactions")
async def my_transactions(authorization: Optional[str] = Header(None)):
    token = require_bearer(authorization.replace("Bearer ", "") if authorization else None)
    profile, _ = await get_user_profile_with_role(token)
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            f"{REST_BASE}/transactions?select=id,type,amount,status,created_at&user_id=eq.{profile['id']}",
            headers=sb_headers(),
        )
        r.raise_for_status()
        return r.json()