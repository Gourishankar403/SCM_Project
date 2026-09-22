from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Optional
from ..database import get_db
from ..models.db_models import User, Company, RequestLog
from ..auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(client_id: Optional[int] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    
    # If Provider is drilling down into a specific client
    if current_user.role == "PROVIDER" and client_id is not None:
        target_company_id = client_id
    elif current_user.role == "CLIENT":
        target_company_id = current_user.company_id
        if not target_company_id:
            raise HTTPException(status_code=400, detail="User not associated with any company")
    else:
        target_company_id = None

    if target_company_id:
        # Client Specific View (Used by both Client and drilling-down Admin)
        company = db.query(Company).filter(Company.id == target_company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
            
        total_requests = db.query(RequestLog).filter(RequestLog.company_id == target_company_id).count()
        total_attacks = db.query(RequestLog).filter(RequestLog.company_id == target_company_id, RequestLog.is_attack == True).count()
        
        recent_logs = db.query(RequestLog).filter(RequestLog.company_id == target_company_id).order_by(RequestLog.timestamp.desc()).limit(20).all()
        
        return {
            "role": "CLIENT_VIEW", 
            "company_name": company.name,
            "company_domain": company.domain,
            "stats": {
                "total_requests": total_requests,
                "total_attacks": total_attacks,
                "healthy_requests": total_requests - total_attacks
            },
            "recent_logs": [{
                "id": log.id,
                "timestamp": log.timestamp,
                "method": log.method,
                "url": log.url,
                "is_attack": log.is_attack
            } for log in recent_logs]
        }
    
    # Global Provider View
    if current_user.role == "PROVIDER":
        total_requests = db.query(RequestLog).count()
        total_attacks = db.query(RequestLog).filter(RequestLog.is_attack == True).count()
        
        # Group by company
        company_stats = db.query(
            Company.id,
            Company.name,
            Company.domain,
            func.count(RequestLog.id).label('total'),
            func.sum(RequestLog.is_attack).label('attacks')
        ).outerjoin(RequestLog, Company.id == RequestLog.company_id)\
         .group_by(Company.id).all()
        
        recent_logs = db.query(RequestLog, Company.name).join(Company).order_by(RequestLog.timestamp.desc()).limit(20).all()
        
        return {
            "role": "PROVIDER",
            "global_stats": {
                "total_requests": total_requests,
                "total_attacks": total_attacks,
                "healthy_requests": total_requests - total_attacks
            },
            "company_breakdown": [{
                "id": c[0], 
                "company": c[1], 
                "domain": c[2],
                "total": c[3], 
                "attacks": c[4] or 0,
                "status": "Active" # Hardcoded active for this view
            } for c in company_stats],
            "recent_logs": [{
                "id": log[0].id,
                "company": log[1],
                "timestamp": log[0].timestamp,
                "method": log[0].method,
                "url": log[0].url,
                "is_attack": log[0].is_attack
            } for log in recent_logs]
        }
    
    raise HTTPException(status_code=403, detail="Invalid role")
