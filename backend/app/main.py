from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models.db_models import User, Company
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

@app.on_event("startup")
def seed_db():
    # Seed data if empty
    db = SessionLocal()
    if not db.query(Company).first():
        print("Seeding initial data...")
        c1 = Company(name="TechCorp Client A", domain="techcorp.com")
        c2 = Company(name="FinServe Client B", domain="finserve.com")
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
    db.close()

@app.get("/")
def read_root():
    return {"message": "SentinelAI Active"}
