from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.db_models import Company, RequestLog
from ..models.schemas import RequestAnalyze, RequestLogResponse
from ..ml_agent import threat_analyzer

router = APIRouter(prefix="/analyze", tags=["analyze"])

@router.post("/", response_model=RequestLogResponse)
def analyze_incoming_request(req: RequestAnalyze, db: Session = Depends(get_db)):
    # 1. Identify Company by domain
    company = db.query(Company).filter(Company.domain == req.company_domain).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company domain not registered in SentinelAI")
        
    # 2. Run LangGraph ML prediction
    initial_state = {
        "method": req.method,
        "url": req.url,
        "user_agent": req.user_agent,
        "payload": req.payload,
        "combined_text": "",
        "is_attack": False,
        "confidence": 0.0
    }
    
    result = threat_analyzer.invoke(initial_state)
    
    is_attack = result.get("is_attack", False)
    confidence = result.get("confidence", 0.0)
    
    # 3. Log to DB
    new_log = RequestLog(
        company_id=company.id,
        method=req.method,
        url=req.url,
        user_agent=req.user_agent,
        payload=req.payload,
        is_attack=is_attack,
        confidence=confidence
    )
    
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    
    return new_log
