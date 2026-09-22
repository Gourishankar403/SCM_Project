from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional
from .log_analyzer import analyze_log
from .threat_intel import check_threat_intel
from .report_generator import generate_report

class AgentState(TypedDict):
    method: str
    url: str
    payload: str
    user_agent: str
    company_domain: str
    is_attack: Optional[bool]
    log_analysis_complete: bool
    threat_intel_summary: Optional[str]
    severity: Optional[str]
    incident_report: Optional[str]

def route_after_analysis(state: AgentState):
    if state.get("is_attack"):
        return "threat_intel"
    return END

# Build the Graph
workflow = StateGraph(AgentState)

workflow.add_node("log_analysis", analyze_log)
workflow.add_node("threat_intel", check_threat_intel)
workflow.add_node("report_generation", generate_report)

workflow.set_entry_point("log_analysis")
workflow.add_conditional_edges("log_analysis", route_after_analysis)
workflow.add_edge("threat_intel", "report_generation")
workflow.add_edge("report_generation", END)

orchestrator_app = workflow.compile()
