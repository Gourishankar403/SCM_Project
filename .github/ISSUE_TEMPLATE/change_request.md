---
name: SCM Change Request
about: Submit a formal Change Request (CR) for SentinelAI Configuration Items
title: "[CR]: "
labels: change-request
assignees: ''

---

## 1. Change Request Information
- **Title of Change**:
- **Requester / Owner**: (e.g., Gouri Shankar Binu / Arjun S / Ojaswita Dhar)
- **Target Baseline**: [ ] Functional Baseline (v0.1.0) | [ ] Design Baseline (v0.2.0) | [ ] Product Baseline (v1.0.0)

## 2. Affected Configuration Items (CIs)
Select all Configuration Items impacted:
- [ ] CI-01: Agent Orchestration Layer (`backend/app/agents/orchestrator.py`)
- [ ] CI-02: Log Analysis Module (`backend/app/agents/log_analyzer.py`)
- [ ] CI-03: Threat Intelligence Connector (`backend/app/agents/threat_intel.py`)
- [ ] CI-04: Investigation & Mitigation Agents (`backend/app/agents/investigation_agent.py`, `mitigation_agent.py`)
- [ ] CI-05: Report Generation Service (`backend/app/agents/report_generator.py`)
- [ ] CI-06: ML Models & Pipeline (`backend/models/`, `csic_database.csv`, `NSL-KDD`)
- [ ] CI-07: Frontend React UI (`frontend/src/`)
- [ ] CI-08: CI/CD & Test Automation (`.github/workflows/`, `backend/tests/`)

## 3. Motivation & Rationale
Briefly explain the rationale behind this change request:

## 4. Impact Analysis
- What components or dependencies might be affected?
- Does this break backward compatibility with the current baseline?

## 5. Verification & Testing Plan
- [ ] Unit tests written and verified locally
- [ ] GitHub Actions CI pipeline passes
- [ ] Peer review conducted prior to merge
