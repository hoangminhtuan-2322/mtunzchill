"""mtunzchill secure account API — separate from the mtunz application."""
import hashlib, json, os, re, secrets, uuid
from contextlib import contextmanager
import psycopg
from psycopg.rows import dict_row
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

DATABASE_URL=os.environ.get("DATABASE_URL","")
ORIGINS=[os.environ.get("FRONTEND_ORIGIN","https://mtunzchill.onrender.com")]
HASHER=PasswordHasher(time_cost=3,memory_cost=65536,parallelism=2)
USER_RE=re.compile(r"^[a-z][a-z0-9_]{2,23}$")
DUMMY=HASHER.hash("nonexistent-password-to-equalize-work")
app=FastAPI(title="mtunzchill API",docs_url=None,redoc_url=None,openapi_url=None)
app.add_middleware(CORSMiddleware,allow_origins=ORIGINS,allow_credentials=False,allow_methods=["GET","POST","PUT","PATCH","DELETE"],allow_headers=["Authorization","Content-Type"])

@app.middleware("http")
async def secure_headers(request,call_next):
    if request.method in ("POST","PUT","PATCH","DELETE") and request.headers.get("origin") not in (None,*ORIGINS):
        return JSONResponse({"detail":"Nguồn yêu cầu không hợp lệ."},status_code=403)
    response=await call_next(request)
    response.headers["Cache-Control"]="no-store"
    response.headers["X-Content-Type-Options"]="nosniff"
    response.headers["Referrer-Policy"]="no-referrer"
    response.headers["X-Frame-Options"]="DENY"
    return response

@contextmanager
def db():
    if not DATABASE_URL: raise HTTPException(503,"Hệ thống tài khoản chưa sẵn sàng.")
    try:
        with psycopg.connect(DATABASE_URL,connect_timeout=12,row_factory=dict_row) as conn: yield conn
    except psycopg.OperationalError: raise HTTPException(503,"Kho dữ liệu chưa sẵn sàng. Hãy thử lại sau.") from None

def digest(text): return hashlib.sha256(text.encode("utf-8")).hexdigest()
def normalized(value):
    v=value.strip().lower()
    if not USER_RE.fullmatch(v): raise HTTPException(422,"Tên đăng nhập cần 3–24 ký tự: chữ, số, _, bắt đầu bằng chữ.")
    return v
def display(value):
    v=" ".join(value.split())
    if not 2<=len(v)<=40 or not any(x.isalpha() for x in v) or any(ord(x)<32 for x in v):
        raise HTTPException(422,"Tên hiển thị cần 2–40 ký tự hợp lệ.")
    return v
def password_rule(value):
    if not 12<=len(value)<=128 or len(value.encode("utf-8"))>256 or value.strip()!=value:
        raise HTTPException(422,"Mật khẩu cần 12–128 ký tự (không có khoảng trắng đầu/cuối).")

def limit(request,kind,name="",maximum=12,seconds=900):
    host=request.client.host if request.client else "unknown"
    key=digest(kind+"|"+host+"|"+name)[:48]
    # Use an independent committed transaction so rejected passwords still count.
    with db() as conn:
        row=conn.execute("""INSERT INTO mtc_auth_limits(bucket,hits,starts_at) VALUES(%s,1,now())
          ON CONFLICT(bucket) DO UPDATE SET
            hits=CASE WHEN mtc_auth_limits.starts_at < now()-make_interval(secs => %s) THEN 1 ELSE mtc_auth_limits.hits+1 END,
            starts_at=CASE WHEN mtc_auth_limits.starts_at < now()-make_interval(secs => %s) THEN now() ELSE mtc_auth_limits.starts_at END
          RETURNING hits""",(key,seconds,seconds)).fetchone()
    if row["hits"]>maximum: raise HTTPException(429,"Thử quá nhiều lần. Hãy quay lại sau.",headers={"Retry-After":str(seconds)})

def public(user): return {"id":str(user["id"]),"username":user["username"],"display_name":user["display_name"]}
def verify(stored,plain):
    try: return HASHER.verify(stored,plain)
    except (VerifyMismatchError,VerificationError,ValueError): return False
def issue(conn,user_id):
    token=secrets.token_urlsafe(40)
    conn.execute("INSERT INTO mtc_sessions(token_hash,user_id,expires_at) VALUES(%s,%s,now()+interval '7 days')",(digest(token),user_id))
    return token
def current(request:Request):
    auth=request.headers.get("authorization","")
    if not auth.startswith("Bearer ") or len(auth)>220: raise HTTPException(401,"Vui lòng đăng nhập.")
    token=auth[7:]
    if not 30<=len(token)<=100: raise HTTPException(401,"Phiên đăng nhập không hợp lệ.")
    with db() as conn:
        u=conn.execute("""SELECT u.id,u.username,u.display_name,s.token_hash
            FROM mtc_sessions s JOIN mtc_users u ON u.id=s.user_id
            WHERE s.token_hash=%s AND s.expires_at>now()""",(digest(token),)).fetchone()
    if not u: raise HTTPException(401,"Phiên đã hết hạn. Đăng nhập lại nhé.")
    return u

class Register(BaseModel):
    username:str=Field(min_length=3,max_length=80)
    display_name:str=Field(min_length=2,max_length=100)
    password:str=Field(min_length=12,max_length=128)
    accepted_terms:bool
class Login(BaseModel):
    username:str
    password:str
class ChangeName(BaseModel):
    display_name:str
class ChangePassword(BaseModel):
    old_password:str
    new_password:str
class ConfirmDelete(BaseModel):
    password:str
class CloudData(BaseModel):
    revision:int=Field(ge=0)
    data:dict

@app.get("/healthz")
def health():
    with db() as conn: conn.execute("SELECT 1")
    return {"ok":True}
@app.post("/api/auth/register",status_code=201)
def register(body:Register,request:Request):
    if not body.accepted_terms: raise HTTPException(422,"Vui lòng đồng ý với điều khoản.")
    username=normalized(body.username)
    label=display(body.display_name)
    password_rule(body.password)
    if username in ("admin","moderator","support","mtunzchill","system"): raise HTTPException(422,"Tên đăng nhập không khả dụng.")
    if body.password.lower() in ("password1234","123456789012","qwerty123456"): raise HTTPException(422,"Hãy chọn mật khẩu khó đoán hơn.")
    limit(request,"signup",maximum=8,seconds=3600)
    with db() as conn:
        if conn.execute("SELECT 1 FROM mtc_users WHERE username=%s",(username,)).fetchone():
            raise HTTPException(409,"Tên đăng nhập đã được sử dụng.")
        user_id=uuid.uuid4()
        try:
            conn.execute("INSERT INTO mtc_users(id,username,display_name,password_hash) VALUES(%s,%s,%s,%s)",(user_id,username,label,HASHER.hash(body.password)))
        except psycopg.errors.UniqueViolation:
            raise HTTPException(409,"Tên đăng nhập đã được sử dụng.") from None
        token=issue(conn,user_id)
    return {"user":{"id":str(user_id),"username":username,"display_name":label},"token":token,"expires_in":604800}
@app.post("/api/auth/login")
def login(body:Login,request:Request):
    name=body.username.strip().lower()
    if not USER_RE.fullmatch(name): raise HTTPException(401,"Tên đăng nhập hoặc mật khẩu không đúng.")
    limit(request,"login",name,maximum=12,seconds=900)
    with db() as conn:
        u=conn.execute("SELECT * FROM mtc_users WHERE username=%s",(name,)).fetchone()
        ok=verify(u["password_hash"] if u else DUMMY,body.password)
        if not u or not ok: raise HTTPException(401,"Tên đăng nhập hoặc mật khẩu không đúng.")
        token=issue(conn,u["id"])
    return {"user":public(u),"token":token,"expires_in":604800}
@app.get("/api/auth/me")
def me(u=Depends(current)): return {"user":public(u)}
@app.post("/api/auth/logout")
def logout(u=Depends(current)):
    with db() as conn: conn.execute("DELETE FROM mtc_sessions WHERE token_hash=%s",(u["token_hash"],))
    return {"ok":True}
@app.patch("/api/auth/profile")
def rename(body:ChangeName,u=Depends(current)):
    label=display(body.display_name)
    with db() as conn: conn.execute("UPDATE mtc_users SET display_name=%s,updated_at=now() WHERE id=%s",(label,u["id"]))
    return {"user":{"id":str(u["id"]),"username":u["username"],"display_name":label}}
@app.post("/api/auth/change-password")
def change_password(body:ChangePassword,u=Depends(current)):
    password_rule(body.new_password)
    if body.old_password==body.new_password: raise HTTPException(422,"Mật khẩu mới phải khác mật khẩu cũ.")
    with db() as conn:
        row=conn.execute("SELECT password_hash FROM mtc_users WHERE id=%s FOR UPDATE",(u["id"],)).fetchone()
        if not row or not verify(row["password_hash"],body.old_password): raise HTTPException(401,"Mật khẩu hiện tại không chính xác.")
        conn.execute("UPDATE mtc_users SET password_hash=%s,updated_at=now() WHERE id=%s",(HASHER.hash(body.new_password),u["id"]))
        conn.execute("DELETE FROM mtc_sessions WHERE user_id=%s AND token_hash<>%s",(u["id"],u["token_hash"]))
    return {"ok":True}
@app.delete("/api/auth/account")
def delete_account(body:ConfirmDelete,u=Depends(current)):
    with db() as conn:
        row=conn.execute("SELECT password_hash FROM mtc_users WHERE id=%s FOR UPDATE",(u["id"],)).fetchone()
        if not row or not verify(row["password_hash"],body.password): raise HTTPException(401,"Mật khẩu không chính xác.")
        conn.execute("DELETE FROM mtc_users WHERE id=%s",(u["id"],))
    return {"ok":True}
@app.get("/api/state")
def state(u=Depends(current)):
    with db() as conn: row=conn.execute("SELECT revision,data,updated_at FROM mtc_state WHERE user_id=%s",(u["id"],)).fetchone()
    return {"revision":row["revision"] if row else 0,"data":row["data"] if row else None,"updated_at":row["updated_at"].isoformat() if row else None}
@app.put("/api/state")
def set_state(body:CloudData,u=Depends(current)):
    data=body.data
    raw=json.dumps(data,ensure_ascii=False,separators=(",",":"))
    if len(raw.encode("utf-8"))>200000: raise HTTPException(413,"Dữ liệu vượt quá giới hạn 200 KB.")
    notes=data.get("journal")
    if data.get("format")!="mtunzchill-local" or data.get("version")!=1 or not isinstance(notes,list):
        raise HTTPException(422,"Dữ liệu không đúng định dạng.")
    if len(notes)>100 or any(not isinstance(n,dict) or not isinstance(n.get("text"),str) or not 1<=len(n["text"])<=900 for n in notes):
        raise HTTPException(422,"Dữ liệu nhật ký không hợp lệ.")
    with db() as conn:
        row=conn.execute("SELECT revision FROM mtc_state WHERE user_id=%s FOR UPDATE",(u["id"],)).fetchone()
        rev=row["revision"] if row else 0
        if rev!=body.revision: raise HTTPException(409,"Dữ liệu trên thiết bị khác đã thay đổi. Hãy sao lưu trước khi đồng bộ lại.")
        if row: conn.execute("UPDATE mtc_state SET data=%s::jsonb,revision=revision+1,updated_at=now() WHERE user_id=%s",(raw,u["id"]))
        else: conn.execute("INSERT INTO mtc_state(user_id,revision,data) VALUES(%s,1,%s::jsonb)",(u["id"],raw))
    return {"ok":True,"revision":rev+1}
