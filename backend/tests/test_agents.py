import pytest
from app.agents.orchestrator import orchestrator_app
from app.agents.investigation_agent import investigate_incident
from app.agents.mitigation_agent import recommend_mitigation

def test_log_analyzer_normal():
    state = {
        "method": "GET",
        "url": "http://localhost:8080/tienda1/index.jsp",
        "payload": "",
        "user_agent": "Mozilla/5.0",
        "company_domain": "testcorp.com"
    }
    result = orchestrator_app.invoke(state)
    assert result["is_attack"] is False
    assert result.get("threat_intel_summary") is None or result.get("threat_intel_summary") == "No threats detected."

def test_log_analyzer_sqli_attack():
    state = {
        "method": "POST",
        "url": "http://localhost:8080/tienda1/publico/autenticar.jsp",
        "payload": "admin' OR '1'='1",
        "user_agent": "sqlmap/1.0",
        "company_domain": "testcorp.com"
    }
    result = orchestrator_app.invoke(state)
    assert result["is_attack"] is True
    assert "SQL" in result["threat_intel_summary"]
    assert "investigation_findings" in result
    assert "mitigation_action" in result
    assert "firewall_rule" in result
    assert "DROP" in result["firewall_rule"]
    assert "incident_report" in result

def test_investigation_agent_direct():
    state = {
        "is_attack": True,
        "url": "/login",
        "payload": "<script>alert(1)</script>",
        "method": "POST",
        "threat_intel_summary": "Cross-Site Scripting (XSS)"
    }
    updated = investigate_incident(state)
    assert "CWE-79" in updated["investigation_findings"]
    assert "Medium" in updated["blast_radius"]

def test_mitigation_agent_direct():
    state = {
        "is_attack": True,
        "url": "/etc/passwd",
        "severity": "High",
        "threat_intel_summary": "Directory Traversal"
    }
    updated = recommend_mitigation(state)
    assert "dot-dot-slash" in updated["mitigation_action"]
    assert "iptables" in updated["firewall_rule"]
