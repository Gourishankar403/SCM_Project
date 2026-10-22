def recommend_mitigation(state: dict) -> dict:
    """
    Mitigation Recommendation Agent: Generates automated defensive counter-measures and firewall rules.
    """
    if not state.get("is_attack"):
        state["mitigation_action"] = "No mitigation required."
        state["firewall_rule"] = "N/A"
        return state

    intel = state.get("threat_intel_summary", "")
    url = state.get("url", "")
    severity = state.get("severity", "Medium")

    actions = []
    firewall_rule = ""

    if "SQL" in intel:
        actions.append("1. Immediate: Enforce parameterized query validation at the application gateway.")
        actions.append("2. Network: Block source IP address on perimeter WAF for 24 hours.")
        actions.append("3. Database: Temporarily place affected database table in read-only audit mode.")
        firewall_rule = "iptables -A INPUT -p tcp --dport 80,443 -m string --string \"' OR '1'='1\" --algo bm -j DROP"
    elif "XSS" in intel:
        actions.append("1. Immediate: Strip HTML tags and enable strict Content-Security-Policy (CSP) headers.")
        actions.append("2. Network: Invalidate active session tokens associated with originating IP.")
        firewall_rule = "iptables -A INPUT -p tcp --dport 80,443 -m string --string \"<script>\" --algo bm -j DROP"
    elif "Directory Traversal" in intel:
        actions.append("1. Immediate: Reject URIs containing dot-dot-slash patterns.")
        actions.append("2. System: Audit file system permissions on web server document roots.")
        firewall_rule = "iptables -A INPUT -p tcp --dport 80,443 -m string --string \"../\" --algo bm -j DROP"
    else:
        actions.append("1. Immediate: Apply temporary rate-limiting of 10 requests/minute on source.")
        actions.append("2. Network: Log full packet payload for forensic investigation.")
        firewall_rule = f"iptables -A INPUT -p tcp --dport 80,443 -m limit --limit 10/min -j ACCEPT"

    state["mitigation_action"] = " \n".join(actions)
    state["firewall_rule"] = firewall_rule
    return state
