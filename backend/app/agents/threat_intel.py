import random

def check_threat_intel(state: dict) -> dict:
    """
    Threat Intelligence Connector: Queries external threat-intel feeds/databases.
    """
    if not state.get("is_attack"):
        state["threat_intel_summary"] = "No threats detected."
        return state
        
    # Simulate an external threat intelligence lookup
    url = state.get("url", "")
    payload = state.get("payload", "")
    
    threat_types = []
    if "script" in url.lower() or "script" in payload.lower():
        threat_types.append("Cross-Site Scripting (XSS)")
    if "select" in payload.lower() or "or '1'='1" in payload.lower():
        threat_types.append("SQL Injection (SQLi)")
    if "../" in url:
        threat_types.append("Directory Traversal")
        
    if not threat_types:
        threat_types.append("Generic Suspicious Payload")
        
    state["threat_intel_summary"] = f"Identified signatures matching: {', '.join(threat_types)}."
    state["severity"] = random.choice(["High", "Critical"])
    return state
