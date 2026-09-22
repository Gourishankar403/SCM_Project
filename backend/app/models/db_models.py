from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from ..database import Base

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    domain = Column(String, unique=True, index=True)
    provider_access_granted = Column(Boolean, default=True)

    users = relationship("User", back_populates="company")
    requests = relationship("RequestLog", back_populates="company")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="CLIENT") # PROVIDER or CLIENT
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=True)

    company = relationship("Company", back_populates="users")

class RequestLog(Base):
    __tablename__ = "request_logs"
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    method = Column(String)
    url = Column(String)
    user_agent = Column(String)
    payload = Column(String)
    is_attack = Column(Boolean)
    confidence = Column(Float, nullable=True)

    company = relationship("Company", back_populates="requests")
