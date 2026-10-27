import threading
import time
import random
import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models.db_models import User, Company, RequestLog
from .routers import auth, dashboard, predict
from .auth import get_password_hash

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="SentinelAI Core API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(predict.router)

HEALTHY_ENDPOINTS = [
    ("GET", "/api/v1/users/profile", "Mozilla/5.0"),
    ("GET", "/tienda1/index.jsp", "Mozilla/5.0"),
    ("POST", "/api/v1/auth/refresh", "Chrome/118.0"),
    ("GET", "/dashboard/metrics", "Safari/537.36"),
    ("GET", "/static/css/theme.css", "Firefox/112"),
    ("GET", "/api/v1/health", "InternalK8sMonitor"),
    ("POST", "/api/v1/checkout/cart", "Mozilla/5.0"),
    ("GET", "/tienda1/publico/anadir.jsp", "Mozilla/5.0"),
    ("POST", "/tienda1/publico/anadir.jsp", "Mozilla/5.0"),
]

ATTACK_ENDPOINTS = [
    ("POST", "/api/v1/auth/login", "sqlmap/1.7.2", "admin' OR '1'='1 --"),
    ("GET", "/search?q=<script>alert('xss')</script>", "Firefox/112", "<script>alert('xss')</script>"),
    ("GET", "/../../../../etc/passwd", "python-requests/2.31.0", "../../../../etc/passwd"),
]

def simulate_background_traffic():
    """Continuously generates realistic live telemetry in the background so the live traffic monitor chart is always active."""
    while True:
        try:
            db = SessionLocal()
            companies = db.query(Company).all()
            if companies:
                # 2 to 5 requests per tick
                batch_size = random.randint(2, 5)
                for _ in range(batch_size):
                    company = random.choice(companies)
                    # 98% clean traffic, 2% attacks for realistic SOC telemetry
                    is_attack = random.random() < 0.02
                    now = datetime.datetime.utcnow()
                    if is_attack:
                        method, url, ua, payload = random.choice(ATTACK_ENDPOINTS)
                        log = RequestLog(
                            company_id=company.id,
                            method=method,
                            url=url,
                            user_agent=ua,
                            payload=payload,
                            is_attack=True,
                            confidence=0.98,
                            timestamp=now
                        )
                    else:
                        method, url, ua = random.choice(HEALTHY_ENDPOINTS)
                        log = RequestLog(
                            company_id=company.id,
                            method=method,
                            url=url,
                            user_agent=ua,
                            payload="",
                            is_attack=False,
                            confidence=0.01,
                            timestamp=now
                        )
                    db.add(log)
                db.commit()
            db.close()
        except Exception:
            pass
        time.sleep(random.uniform(1.8, 2.6))

@app.on_event("startup")
def seed_db():
    db = SessionLocal()
    if not db.query(Company).first():
        print("Seeding initial data...")
        c1 = Company(name="TechCorp Client A", domain="techcorp.com", provider_access_granted=True, share_signatures=True)
        c2 = Company(name="FinServe Client B", domain="finserve.com", provider_access_granted=True, share_signatures=True)
        db.add(c1)
        db.add(c2)
        db.commit()
        
        provider = User(username="admin", hashed_password=get_password_hash("admin123"), role="PROVIDER")
        client1 = User(username="techcorp_user", hashed_password=get_password_hash("client123"), role="CLIENT", company_id=c1.id)
        client2 = User(username="finserve_user", hashed_password=get_password_hash("client123"), role="CLIENT", company_id=c2.id)
        
        db.add(provider)
        db.add(client1)
        db.add(client2)
        db.commit()

    # If request logs are empty, seed baseline logs so cards never show 0
    if db.query(RequestLog).count() == 0:
        print("Seeding initial request logs...")
        companies = db.query(Company).all()
        for _ in range(500):
            comp = random.choice(companies)
            is_attack = random.random() < 0.015
            now = datetime.datetime.utcnow() - datetime.timedelta(minutes=random.randint(1, 120))
            if is_attack:
                method, url, ua, payload = random.choice(ATTACK_ENDPOINTS)
                db.add(RequestLog(
                    company_id=comp.id, method=method, url=url, user_agent=ua,
                    payload=payload, is_attack=True, confidence=0.98, timestamp=now
                ))
            else:
                method, url, ua = random.choice(HEALTHY_ENDPOINTS)
                db.add(RequestLog(
                    company_id=comp.id, method=method, url=url, user_agent=ua,
                    payload="", is_attack=False, confidence=0.01, timestamp=now
                ))
        db.commit()

    db.close()

    # Launch daemon background traffic simulator
    traffic_thread = threading.Thread(target=simulate_background_traffic, daemon=True)
    traffic_thread.start()
    print("Background live traffic simulator started successfully.")

@app.get("/")
def read_root():
    return {"message": "SentinelAI Active"}

