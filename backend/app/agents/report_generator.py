import datetime

def generate_report(state: dict) -> dict:
    """
    Report Generation Service: Compiles investigation findings into incident reports.
    """
    if not state.get("is_attack"):
        state["incident_report"] = "Traffic cleared. No incident report generated."
        return state
        
    timestamp = datetime.datetime.utcnow().isoformat()
    company = state.get("company_domain", "Unknown")
    intel = state.get("threat_intel_summary", "Unknown threat.")
    severity = state.get("severity", "Medium")
    
    report = f"""
    [INCIDENT REPORT]
    Time: {timestamp}
    Target: {company}
    Severity: {severity}
    Details: {intel}
    Action Recommended: Block IP and update WAF rules.
    """
    
    state["incident_report"] = report.strip()
    return state
