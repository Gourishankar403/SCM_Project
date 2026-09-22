import pytest
from app.agents.orchestrator import orchestrator_app

def test_log_analyzer_normal():
    state = {
        "method": "GET",
        "url": "http://localhost:8080/tienda1/index.jsp",
        "payload": "",
        "user_agent": "Mozilla",
        "company_domain": "test.com"
    }
    result = orchestrator_app.invoke(state)
    assert result["is_attack"] is False
    assert result["threat_intel_summary"] == "No threats detected."

def test_log_analyzer_attack():
    state = {
        "method": "POST",
        "url": "http://localhost:8080/tienda1/publico/autenticar.jsp",
        "payload": "admin' OR '1'='1",
        "user_agent": "curl",
        "company_domain": "test.com"
    }
    result = orchestrator_app.invoke(state)
    assert result["is_attack"] is True
    assert "SQLi" in result["threat_intel_summary"] or "SQL Injection" in result["threat_intel_summary"]
