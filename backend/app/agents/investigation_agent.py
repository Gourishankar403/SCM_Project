def investigate_incident(state: dict) -> dict:
    """
    Investigation Agent: Performs automated root-cause analysis and blast radius evaluation.
    """
    if not state.get("is_attack"):
        state["investigation_findings"] = "No anomaly detected during investigation."
        state["blast_radius"] = "None"
        return state

    url = state.get("url", "")
    payload = state.get("payload", "")
    method = state.get("method", "")
    intel = state.get("threat_intel_summary", "")

    findings = []
    blast_radius = "Low"

    if "SQL" in intel:
        findings.append("Root Cause: Unsanitized database input parameter in HTTP request.")
        findings.append("Vulnerability: CWE-89 Improper Neutralization of Special Elements used in an SQL Command.")
        blast_radius = "High (Potential unauthorized data exfiltration or table tampering)"
    elif "XSS" in intel:
        findings.append("Root Cause: Reflected or stored script payload in user-supplied parameters.")
        findings.append("Vulnerability: CWE-79 Improper Neutralization of Input During Web Page Generation.")
        blast_radius = "Medium (Client-side session hijacking or credential theft)"
    elif "Directory Traversal" in intel:
        findings.append("Root Cause: Path manipulation sequence detected in URL.")
        findings.append("Vulnerability: CWE-22 Improper Limitation of a Pathname to a Restricted Directory.")
        blast_radius = "High (Potential arbitrary file disclosure)"
    else:
        findings.append(f"Root Cause: Anomalous network packet pattern detected via {method} on {url}.")
        findings.append("Vulnerability: CWE-20 Improper Input Validation.")
        blast_radius = "Medium (Targeted endpoint probing)"

    state["investigation_findings"] = " | ".join(findings)
    state["blast_radius"] = blast_radius
    return state
