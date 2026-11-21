"""mtunzchill account and cloud state API. No admin endpoints, no public database access."""
from __future__ import annotations
import hashlib
import json
import os
import re
import secrets
import uuid
from contextlib import contextmanager
from pathlib import Path

import psycopg
from psycopg.rows import dict_row
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

DB_URL = os.environ.get("DATABASE_URL", "")
WEB_ROOT=Path(__file__).resolve().parent.parent
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "https://mtunzchill-api.onrender.com").rstrip("/")
EXTRA_ORIGINS = [x.strip().rstrip("/") for x in os.environ.get("EXTRA_ORIGINS", "").split(",") if x.strip()]
ALLOWED_ORIGINS = [FRONTEND_ORIGIN, *EXTRA_ORIGINS]
TOKEN_TTL = 7 * 86400
HASHER = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=2)
USERNAME_RE = re.compile(r"^[a-z][a-z0-9_]{2,23}$")

app = FastAPI(title="mtunzchill account API", version="1.0", docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(CORSMiddleware, allow_origins=ALLOWED_ORIGINS, allow_credentials=False,
                   allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"], allow_headers=["Authorization", "Content-Type"], max_age=3600)

@app.middleware("http")
async def headers(request: Request, call_next):
    if request.method in ("POST", "PUT", "PATCH", "DELETE") and request.headers.get("origin") and request.headers["origin"] not in ALLOWED_ORIGINS:
        return JSONResponse({"detail": "Nguồn yêu cầu không hợp lệ."}, status_code=403)
    response = await call_next(request)
    response.headers["Cache-Control"] = "public,max-age=3600" if request.url.path.startswith(("/assets/","/src/")) else "no-store"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["X-Frame-Options"] = "DENY"
    return response

@contextmanager
def db():
    if not DB_URL:
        raise HTTPException(503, "Hệ thống tài khoản đang bảo trì.")
    try:
        with psycopg.connect(DB_URL, connect_timeout=12, row_factory=dict_row) as conn:
            yield conn
    except psycopg.OperationalError:
        raise HTTPException(503, "Không thể kết nối kho dữ liệu. Vui lòng thử lại sau.") from None


def sha(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def normalize_user(value: str) -> str:
    user = value.strip().lower()
    if not USERNAME_RE.fullmatch(user):
        raise HTTPException(422, "Tên đăng nhập phải có 3–24 ký tự: chữ thường, số hoặc dấu gạch dưới; bắt đầu bằng chữ.")
    return user


def normalize_display(value: str) -> str:
    name = " ".join(value.split())
    if not 2 <= len(name) <= 40 or not any(c.isalpha() for c in name) or any(ord(c) < 32 for c in name):
        raise HTTPException(422, "Tên hiển thị cần 2–40 ký tự hợp lệ.")
    return name


def validate_password(password: str):
    if not 12 <= len(password) <= 128 or len(password.encode("utf-8")) > 256:
        raise HTTPException(422, "Mật khẩu cần 12–128 ký tự, tối đa 256 byte.")
    if password.isspace() or password.strip() != password:
        raise HTTPException(422, "Không dùng khoảng trắng đầu hoặc cuối mật khẩu.")


def ip_bucket(request: Request, scope: str, username: str = "") -> str:
    peer = request.client.host if request.client else "unknown"
    # Never store a raw IP in the database.
    return sha(scope + "|" + peer + "|" + username)[:48]


def rate_limit(request: Request, scope: str, username: str, limit: int, seconds: int):
    bucket = ip_bucket(request, scope, username)
    with db() as conn:
        row = conn.execute("""
      INSERT INTO mtc_auth_limits(bucket,hits,starts_at) VALUES(%s,1,now())
      ON CONFLICT(bucket) DO UPDATE SET
      hits=CASE WHEN mtc_auth_limits.starts_at < now() - make_interval(secs => %s) THEN 1 ELSE mtc_auth_limits.hits+1 END,
      starts_at=CASE WHEN mtc_auth_limits.starts_at < now() - make_interval(secs => %s) THEN now() ELSE mtc_auth_limits.starts_at END
      RETURNING hits
    """, (bucket, seconds, seconds)).fetchone()
    if row["hits"] > limit:
        raise HTTPException(429, "Thử quá nhiều lần. Vui lòng quay lại sau ít phút.", headers={"Retry-After": str(seconds)})


def public_user(u):
    return {"id": str(u["id"]), "username": u["username"], "display_name": u["display_name"]}


def issue_session(conn, user_id):
    token = secrets.token_urlsafe(40)
    conn.execute("INSERT INTO mtc_sessions(token_hash,user_id,expires_at) VALUES(%s,%s,now()+interval '7 days')", (sha(token), user_id))
    return token


def require_auth(request: Request):
    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer ") or len(header) > 220:
        raise HTTPException(401, "Vui lòng đăng nhập.")
    token = header[7:]
    if not (30 <= len(token) <= 100):
        raise HTTPException(401, "Phiên đăng nhập không hợp lệ.")
    with db() as conn:
        row = conn.execute("""SELECT u.id,u.username,u.display_name,s.token_hash
           FROM mtc_sessions s JOIN mtc_users u ON u.id=s.user_id
           WHERE s.token_hash=%s AND s.expires_at>now()""", (sha(token),)).fetchone()
    if not row:
        raise HTTPException(401, "Phiên đã hết hạn. Vui lòng đăng nhập lại.")
    return row


class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    display_name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=12, max_length=128)
    accepted_terms: bool

class LoginIn(BaseModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=1, max_length=128)

class DisplayIn(BaseModel):
    display_name: str = Field(min_length=2, max_length=100)

class PasswordIn(BaseModel):
    old_password: str
    new_password: str

class DeleteIn(BaseModel):
    password: str

class StateIn(BaseModel):
    revision: int = Field(ge=0)
    data: dict


def verify(stored: str, password: str) -> bool:
    try:
        return HASHER.verify(stored, password)
    except (VerifyMismatchError, VerificationError, ValueError):
        return False

# Constant-time cost for unknown usernames; don't expose account existence through login errors.
DUMMY_HASH = HASHER.hash("a-nonexistent-password-placeholder")

@app.get("/healthz")
def healthz():
    with db() as conn:
        conn.execute("SELECT 1").fetchone()
    return {"ok": True}

@app.post("/api/auth/register", status_code=201)
def register(data: RegisterIn, request: Request):
    if not data.accepted_terms:
        raise HTTPException(422, "Bạn cần đồng ý với điều khoản và quyền riêng tư.")
    username = normalize_user(data.username)
    display = normalize_display(data.display_name)
    validate_password(data.password)
    if username in ("admin", "support", "moderator", "system", "mtunzchill"):
        raise HTTPException(422, "Vui lòng chọn tên đăng nhập khác.")
    # Reject common obvious passwords.
    if data.password.lower() in ("password1234", "123456789012", "qwerty123456", "mtunzchill123"):
        raise HTTPException(422, "Mật khẩu quá dễ đoán.")
    rate_limit(request, "signup", "", 8, 3600)
    with db() as conn:
        if conn.execute("SELECT 1 FROM mtc_users WHERE username=%s", (username,)).fetchone():
            raise HTTPException(409, "Tên đăng nhập này đã được sử dụng.")
        user_id = uuid.uuid4()
        try:
            conn.execute("INSERT INTO mtc_users(id,username,display_name,password_hash) VALUES(%s,%s,%s,%s)",
                         (user_id,username,display,HASHER.hash(data.password)))
        except psycopg.errors.UniqueViolation:
            raise HTTPException(409, "Tên đăng nhập này đã được sử dụng.") from None
        token=issue_session(conn,user_id)
    return {"token":token, "user":{"id":str(user_id),"username":username,"display_name":display}, "expires_in": TOKEN_TTL}

@app.post("/api/auth/login")
def login(data: LoginIn, request: Request):
    username = data.username.strip().lower()
    if len(username)>32 or not USERNAME_RE.fullmatch(username):
        raise HTTPException(401, "Tên đăng nhập hoặc mật khẩu không đúng.")
    rate_limit(request,"login",username,12,900)
    with db() as conn:
        user=conn.execute("SELECT id,username,display_name,password_hash FROM mtc_users WHERE username=%s",(username,)).fetchone()
        valid = verify(user["password_hash"] if user else DUMMY_HASH, data.password)
        if not user or not valid:
            raise HTTPException(401, "Tên đăng nhập hoặc mật khẩu không đúng.")
        token=issue_session(conn,user["id"])
    return {"token":token,"user":public_user(user),"expires_in":TOKEN_TTL}

@app.get("/api/auth/me")
def me(user=Depends(require_auth)):
    return {"user":public_user(user)}

@app.post("/api/auth/logout")
def logout(user=Depends(require_auth)):
    with db() as conn:
        conn.execute("DELETE FROM mtc_sessions WHERE token_hash=%s", (user["token_hash"],))
    return {"ok": True}

@app.patch("/api/auth/profile")
def rename(data: DisplayIn, user=Depends(require_auth)):
    display=normalize_display(data.display_name)
    with db() as conn:
        conn.execute("UPDATE mtc_users SET display_name=%s,updated_at=now() WHERE id=%s", (display,user["id"]))
    return {"user":{"id":str(user["id"]),"username":user["username"],"display_name":display}}

@app.post("/api/auth/change-password")
def change_password(data: PasswordIn, user=Depends(require_auth)):
    validate_password(data.new_password)
    if data.old_password == data.new_password:
        raise HTTPException(422,"Mật khẩu mới phải khác mật khẩu cũ.")
    with db() as conn:
        stored=conn.execute("SELECT password_hash FROM mtc_users WHERE id=%s FOR UPDATE",(user["id"],)).fetchone()
        if not stored or not verify(stored["password_hash"],data.old_password):
            raise HTTPException(401,"Mật khẩu hiện tại không chính xác.")
        conn.execute("UPDATE mtc_users SET password_hash=%s,updated_at=now() WHERE id=%s",(HASHER.hash(data.new_password),user["id"]))
        conn.execute("DELETE FROM mtc_sessions WHERE user_id=%s AND token_hash<>%s",(user["id"],user["token_hash"]))
    return {"ok":True}

@app.delete("/api/auth/account")
def delete_account(data: DeleteIn, user=Depends(require_auth)):
    with db() as conn:
        stored=conn.execute("SELECT password_hash FROM mtc_users WHERE id=%s FOR UPDATE",(user["id"],)).fetchone()
        if not stored or not verify(stored["password_hash"],data.password):
            raise HTTPException(401,"Mật khẩu không chính xác.")
        conn.execute("DELETE FROM mtc_users WHERE id=%s",(user["id"],))
    return {"ok":True}

@app.get("/api/state")
def get_state(user=Depends(require_auth)):
    with db() as conn:
        row=conn.execute("SELECT revision,data,updated_at FROM mtc_state WHERE user_id=%s",(user["id"],)).fetchone()
    return {"revision":row["revision"] if row else 0,"data":row["data"] if row else None,
            "updated_at":row["updated_at"].isoformat() if row else None}

@app.put("/api/state")
def save_state(payload: StateIn, user=Depends(require_auth)):
    data=payload.data
    raw=json.dumps(data,ensure_ascii=False,separators=(",",":"))
    if len(raw.encode("utf-8"))>200_000:
        raise HTTPException(413,"Dữ liệu vượt giới hạn 200 KB.")
    if data.get("format")!="mtunzchill-local" or data.get("version")!=1 or not isinstance(data.get("journal"),list):
        raise HTTPException(422,"Định dạng dữ liệu không hợp lệ.")
    if len(data["journal"])>100 or any(not isinstance(n,dict) or not isinstance(n.get("text"),str) or not 1<=len(n["text"])<=900 for n in data["journal"]):
        raise HTTPException(422,"Nhật ký không hợp lệ.")
    with db() as conn:
        # Row-level revision guard prevents silent overwrites from multiple devices.
        row=conn.execute("SELECT revision FROM mtc_state WHERE user_id=%s FOR UPDATE",(user["id"],)).fetchone()
        current=row["revision"] if row else 0
        if current != payload.revision:
            raise HTTPException(409,"Dữ liệu đã thay đổi ở thiết bị khác. Hãy đồng bộ lại trước khi tiếp tục.")
        if row:
            conn.execute("UPDATE mtc_state SET data=%s::jsonb,revision=revision+1,updated_at=now() WHERE user_id=%s",(raw,user["id"]))
        else:
            conn.execute("INSERT INTO mtc_state(user_id,revision,data) VALUES(%s,1,%s::jsonb)",(user["id"],raw))
    return {"revision":current+1,"ok":True}


# Same-origin web UI: this is a complete Web Service, not a separate Static Site.
# File mounts are deliberately restricted to the public assets and client modules.
app.mount("/assets", StaticFiles(directory=str(WEB_ROOT / "assets")), name="assets")
app.mount("/src", StaticFiles(directory=str(WEB_ROOT / "src")), name="src")

@app.get("/", include_in_schema=False)
def web_home():
    return FileResponse(WEB_ROOT / "index.html",media_type="text/html",headers={"Cache-Control":"no-store"})

@app.get("/manifest.webmanifest",include_in_schema=False)
def web_manifest():
    return FileResponse(WEB_ROOT / "manifest.webmanifest",media_type="application/manifest+json")

@app.get("/sw.js",include_in_schema=False)
def web_service_worker():
    return FileResponse(WEB_ROOT / "sw.js",media_type="text/javascript",headers={"Cache-Control":"no-store","Service-Worker-Allowed":"/"})

@app.get("/robots.txt",include_in_schema=False)
def web_robots():
    return FileResponse(WEB_ROOT / "robots.txt",media_type="text/plain")
