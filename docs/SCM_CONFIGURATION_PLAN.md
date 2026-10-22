# SentinelAI - Software Configuration Management (SCM) Specification

## 1. Project Overview
SentinelAI is a multi-agent autonomous SOC incident response system built for multi-tenant cyber defense operations. This repository is managed under formal Software Configuration Management principles covering identification, change control, status accounting, and verification.

---

## 2. Configuration Items (CIs)
The following assets are designated as managed Configuration Items under formal version control:

| CI ID | Configuration Item | Location | Primary Owner |
| :--- | :--- | :--- | :--- |
| **CI-01** | Agent Orchestration Layer | `backend/app/agents/orchestrator.py` | Gouri Shankar Binu |
| **CI-02** | Log Analysis Module | `backend/app/agents/log_analyzer.py` | Arjun S |
| **CI-03** | Threat Intelligence Connector | `backend/app/agents/threat_intel.py` | Ojaswita Dhar |
| **CI-04** | Incident Investigation Agent | `backend/app/agents/investigation_agent.py` | Gouri Shankar Binu |
| **CI-05** | Mitigation Recommendation Agent | `backend/app/agents/mitigation_agent.py` | Arjun S |
| **CI-06** | Report Generation Service | `backend/app/agents/report_generator.py` | Arjun S |
| **CI-07** | ML Threat Models & Datasets | `backend/models/`, `csic_database.csv`, NSL-KDD | Ojaswita Dhar |
| **CI-08** | Multi-Tenant SOC Frontend UI | `frontend/src/` | Gouri Shankar Binu |
| **CI-09** | CI/CD & Automated Verification | `.github/workflows/ci.yml`, `backend/tests/` | Ojaswita Dhar |

---

## 3. Baseline Management
SentinelAI progresses through three formal configuration baselines across the project lifecycle:

### Baseline I: Functional Baseline (`v0.1.0`)
- Requirements specification, architecture breakdown, and initial CI identification.
- Repository initialization with initial branching policy.

### Baseline II: Design Baseline (`v0.2.0`)
- Integration of LangGraph multi-agent orchestration.
- Implementation of Log Analysis, Threat Intelligence Connector, and Report Generator.
- Multi-tenant authentication and dashboard visualization.

### Baseline III: Product Baseline (`v1.0.0`)
- Completion of full 6-stage autonomous SOC pipeline (adding Investigation and Mitigation agents).
- Model training on the updated NSL-KDD benchmark dataset.
- Automated GitHub Actions CI pipeline executing regression test suites and frontend build checks.

---

## 4. Branching and Release Strategy
- **`main`**: Protected branch storing production-ready baselines. Merges strictly via verified Pull Requests.
- **`develop`**: Integration branch containing current working iterations.
- **`feature/<ci-name>`**: Short-lived feature branches created per configuration item change request.

---

## 5. Automated Verification & Continuous Integration
Continuous Integration is enforced via GitHub Actions on every push and pull request:
1. Automated setup of Python 3.11 environment.
2. Installation of dependencies from locked requirements.
3. Execution of pytest multi-agent test suite (`backend/tests/test_agents.py`).
4. Automated verification of Node.js frontend production build (`npm run build`).
