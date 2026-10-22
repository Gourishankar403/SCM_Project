from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.schemas import RequestPayload
from ..models.db_models import RequestLog, Company
from ..agents.orchestrator import orchestrator_app

router = APIRouter(prefix="/analyze", tags=["analyze"])

@router.post("/")
def analyze_request(payload: RequestPayload, db: Session = Depends(get_db)):
    # Find company by domain
    company = db.query(Company).filter(Company.domain == payload.company_domain).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company domain not registered")

    # Run through the SentinelAI Orchestrator Pipeline
    state = {
        "method": payload.method,
        "url": payload.url,
        "payload": payload.payload,
        "user_agent": payload.user_agent,
        "company_domain": payload.company_domain,
    }
    
    final_state = orchestrator_app.invoke(state)
    is_attack = final_state.get("is_attack", False)
    
    # Log it
    log_entry = RequestLog(
        company_id=company.id,
        method=payload.method,
        url=payload.url,
        user_agent=payload.user_agent,
        payload=payload.payload,
        is_attack=is_attack,
        confidence=0.99
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)

    return {
        "status": "analyzed", 
        "is_attack": is_attack,
        "severity": final_state.get("severity"),
        "threat_intel": final_state.get("threat_intel_summary"),
        "investigation": final_state.get("investigation_findings"),
        "mitigation": final_state.get("mitigation_action"),
        "firewall_rule": final_state.get("firewall_rule"),
        "incident_report": final_state.get("incident_report")
    }
