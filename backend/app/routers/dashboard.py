from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Optional
import random
import datetime
from ..database import get_db
from ..models.db_models import User, Company, RequestLog, IncidentAlert
from ..auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

class PermissionToggle(BaseModel):
    allow_provider: bool
    share_signatures: bool
    auto_mitigation: bool

class TriggerIncidentPayload(BaseModel):
    company_id: Optional[int] = None
    threat_type: Optional[str] = "SQL Injection (SQLi)"

class AcknowledgePayload(BaseModel):
    incident_id: int

@router.post("/permissions")
def toggle_permissions(payload: PermissionToggle, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "CLIENT":
        raise HTTPException(status_code=403, detail="Only clients can toggle permissions")
    
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    company.provider_access_granted = payload.allow_provider
    company.share_signatures = payload.share_signatures
    company.auto_mitigation = payload.auto_mitigation
    db.commit()
    return {
        "status": "success", 
        "provider_access_granted": company.provider_access_granted,
        "share_signatures": company.share_signatures,
        "auto_mitigation": company.auto_mitigation
    }

@router.post("/trigger-incident")
def trigger_incident(payload: TriggerIncidentPayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Default to first company (techcorp) if not provided
    target_company_id = payload.company_id or 1
    company = db.query(Company).filter(Company.id == target_company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")

    incident_num = random.randint(1000, 9999)
    incident_code = f"INC-{incident_num}"
    ip_last = random.randint(10, 250)
    attacking_ip = f"198.51.100.{ip_last}"

    new_incident = IncidentAlert(
        incident_code=incident_code,
        company_id=company.id,
        threat_type=payload.threat_type or "SQL Injection (SQLi)",
        status="AUTOMATIC_INCIDENT_RESPONSE_SENT",
        details=f"Critical threat detected by SentinelAI Threat Engine on {company.domain}/api/v1/auth/login. Unsanitized parameter injection intercepted.",
        mitigation=f"Automated Mitigation Agent activated. Host {attacking_ip} quarantined. WAF filter and perimeter drop rule deployed.",
        firewall_rule=f"iptables -A INPUT -s {attacking_ip} -p tcp --dport 80,443 -j DROP",
        timestamp=datetime.datetime.utcnow(),
        acknowledged=False
    )
    db.add(new_incident)

    # Also log a corresponding threat in RequestLog so dashboard stats and recent events reflect it
    new_log = RequestLog(
        company_id=company.id,
        method="POST",
        url="/api/v1/auth/login",
        user_agent="sqlmap/1.7.2#stable",
        payload="admin' OR '1'='1",
        is_attack=True,
        confidence=0.99,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_incident)

    return {
        "status": "dispatched",
        "incident_code": new_incident.incident_code,
        "target_company": company.name,
        "target_domain": company.domain,
        "threat_type": new_incident.threat_type,
        "firewall_rule": new_incident.firewall_rule,
        "response_status": new_incident.status,
        "timestamp": new_incident.timestamp.isoformat()
    }

@router.post("/acknowledge-incident")
def acknowledge_incident(payload: AcknowledgePayload, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    incident = db.query(IncidentAlert).filter(IncidentAlert.id == payload.incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    incident.acknowledged = True
    db.commit()
    return {"status": "acknowledged", "incident_id": incident.id}

@router.get("/stats")
def get_dashboard_stats(client_id: Optional[int] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    
    # If Provider is drilling down into a specific client
    if current_user.role == "PROVIDER" and client_id is not None:
        target_company = db.query(Company).filter(Company.id == client_id).first()
        if not target_company or not target_company.provider_access_granted:
            raise HTTPException(status_code=403, detail="Access denied by client")
        target_company_id = client_id
    elif current_user.role == "CLIENT":
        target_company_id = current_user.company_id
        if not target_company_id:
            raise HTTPException(status_code=400, detail="User not associated with any company")
    else:
        target_company_id = None

    if target_company_id:
        company = db.query(Company).filter(Company.id == target_company_id).first()
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
            
        total_requests = db.query(RequestLog).filter(RequestLog.company_id == target_company_id).count()
        total_attacks = db.query(RequestLog).filter(RequestLog.company_id == target_company_id, RequestLog.is_attack == True).count()
        
        recent_logs = db.query(RequestLog).filter(RequestLog.company_id == target_company_id).order_by(RequestLog.timestamp.desc()).limit(20).all()

        # Check for unacknowledged active incident alert
        latest_incident = db.query(IncidentAlert).filter(
            IncidentAlert.company_id == target_company_id,
            IncidentAlert.acknowledged == False
        ).order_by(IncidentAlert.timestamp.desc()).first()

        # If none exists yet, seed an initial demo incident alert so TechCorp immediately shows it
        if not latest_incident:
            latest_incident = IncidentAlert(
                incident_code="INC-8942",
                company_id=target_company_id,
                threat_type="SQL Injection Exploit (CWE-89)",
                status="AUTOMATIC_INCIDENT_RESPONSE_SENT",
                details=f"SentinelAI SOC detected unauthorized injection payload against {company.domain}/api/v1/auth/login.",
                mitigation="Autonomous Mitigation Agent deployed: Attacking IP 198.51.100.42 dropped. Session revoked and perimeter WAF rules updated.",
                firewall_rule="iptables -A INPUT -s 198.51.100.42 -p tcp --dport 80,443 -j DROP",
                timestamp=datetime.datetime.utcnow(),
                acknowledged=False
            )
            db.add(latest_incident)
            db.commit()
            db.refresh(latest_incident)
        
        return {
            "role": "CLIENT_VIEW", 
            "company_name": company.name,
            "company_domain": company.domain,
            "provider_access_granted": company.provider_access_granted,
            "share_signatures": company.share_signatures,
            "auto_mitigation": company.auto_mitigation,
            "stats": {
                "total_requests": total_requests,
                "total_attacks": total_attacks,
                "healthy_requests": total_requests - total_attacks
            },
            "active_alert": {
                "id": latest_incident.id,
                "incident_code": latest_incident.incident_code,
                "threat_type": latest_incident.threat_type,
                "status": latest_incident.status,
                "details": latest_incident.details,
                "mitigation": latest_incident.mitigation,
                "firewall_rule": latest_incident.firewall_rule,
                "timestamp": latest_incident.timestamp.isoformat()
            } if latest_incident else None,
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
        # Only include companies that have granted access
        accessible_companies = db.query(Company.id).filter(Company.provider_access_granted == True).subquery()

        total_requests = db.query(RequestLog).filter(RequestLog.company_id.in_(accessible_companies)).count()
        total_attacks = db.query(RequestLog).filter(RequestLog.company_id.in_(accessible_companies), RequestLog.is_attack == True).count()
        
        # Group by company
        company_stats = db.query(
            Company.id,
            Company.name,
            Company.domain,
            func.count(RequestLog.id).label('total'),
            func.sum(RequestLog.is_attack).label('attacks')
        ).outerjoin(RequestLog, Company.id == RequestLog.company_id)\
         .filter(Company.provider_access_granted == True)\
         .group_by(Company.id).all()
        
        recent_logs = db.query(RequestLog, Company.name).join(Company).filter(Company.provider_access_granted == True).order_by(RequestLog.timestamp.desc()).limit(20).all()

        # Fetch latest dispatched incident for admin display
        latest_dispatched = db.query(IncidentAlert).order_by(IncidentAlert.timestamp.desc()).first()
        
        return {
            "role": "PROVIDER",
            "global_stats": {
                "total_requests": total_requests,
                "total_attacks": total_attacks,
                "healthy_requests": total_requests - total_attacks
            },
            "latest_incident": {
                "id": latest_dispatched.id,
                "incident_code": latest_dispatched.incident_code,
                "threat_type": latest_dispatched.threat_type,
                "status": latest_dispatched.status,
                "details": latest_dispatched.details,
                "mitigation": latest_dispatched.mitigation,
                "firewall_rule": latest_dispatched.firewall_rule,
                "timestamp": latest_dispatched.timestamp.isoformat()
            } if latest_dispatched else {
                "incident_code": "INC-8942",
                "threat_type": "SQL Injection (SQLi)",
                "status": "AUTOMATIC_INCIDENT_RESPONSE_SENT",
                "details": "Threat detected on techcorp.com. Mitigation agent dispatched.",
                "firewall_rule": "iptables -A INPUT -s 198.51.100.42 -p tcp --dport 80,443 -j DROP",
                "timestamp": datetime.datetime.utcnow().isoformat()
            },
            "company_breakdown": [{
                "id": c[0], 
                "company": c[1], 
                "domain": c[2],
                "total": c[3], 
                "attacks": c[4] or 0,
                "status": "Active"
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
