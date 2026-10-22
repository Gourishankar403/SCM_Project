import datetime

def generate_report(state: dict) -> dict:
    """
    Report Generation Service: Compiles investigation findings and mitigations into incident reports.
    """
    if not state.get("is_attack"):
        state["incident_report"] = "Traffic cleared. No incident report generated."
        return state
        
    timestamp = datetime.datetime.utcnow().isoformat()
    company = state.get("company_domain", "Unknown")
    intel = state.get("threat_intel_summary", "Unknown threat.")
    severity = state.get("severity", "Medium")
    investigation = state.get("investigation_findings", "Pending root cause analysis.")
    mitigation = state.get("mitigation_action", "Block source IP.")
    firewall = state.get("firewall_rule", "N/A")
    
    report = f"""
    [INCIDENT REPORT]
    Time: {timestamp}
    Target: {company}
    Severity: {severity}
    Threat Summary: {intel}
    Investigation: {investigation}
    Recommended Mitigation: {mitigation}
    Generated Firewall Rule: {firewall}
    """
    
    state["incident_report"] = report.strip()
    return state
