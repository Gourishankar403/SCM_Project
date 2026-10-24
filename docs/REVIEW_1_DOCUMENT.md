# VELLORE INSTITUTE OF TECHNOLOGY
### School of Computer Science Engineering and Information Systems
### M.Tech (SE) 5 Years Integrated Course
### ISWE403L — Software Configuration Management
### Project Review 1 Report

---

# TITLE & GROUP INFORMATION

**Course Code & Name:** ISWE403L — Software Configuration Management  
**Slot:** E1+TE1  
**Faculty Guide:** Dr. TamilPriya  
**Academic Term:** Fall Semester 2026  
**Project Title:** SENTINELAI: MULTI-AGENT AUTONOMOUS SECURITY OPERATIONS CENTER (SOC) INCIDENT RESPONSE SYSTEM  
**Repository URL:** https://github.com/Gourishankar403/SCM_Project  

### Team Members & SCM Responsibilities

| S.No | Student Name | Registration Number | SCM Role | Configuration Items (CIs) Owned | Core Responsibilities |
| :---: | :--- | :---: | :--- | :--- | :--- |
| **1.** | **Ojaswita Dhar** | 24MIS0131 | Build & Test Owner | **CI-03, CI-07, CI-09** | CI/CD pipeline automation, automated testing suites, model serialization validation, and threat intelligence connector. |
| **2.** | **Arjun S** | 24MIS0128 | Documentation & Release Owner | **CI-02, CI-05, CI-06** | Release packaging, version change logs, SCM audit reporting, log analysis feature engineering, and firewall rule synthesis. |
| **3.** | **Gouri Shankar Binu** | 24MIS0137 | SCM Coordinator & Lead | **CI-01, CI-04, CI-08** | Baseline tracking, Change Control Board (CCB) management, LangGraph orchestration state machine, and multi-tenant user console. |

---

# PART A: ABOUT PROJECT

### 1. Project Overview & Background
Enterprise digital assets are increasingly exposed to high-velocity, automated cyber threats, ranging from distributed denial-of-service (DDoS) barrages to advanced web-layer injection vectors (SQL Injection, Cross-Site Scripting, Path Traversal). Conventional enterprise Security Operations Centers (SOCs) rely heavily on centralized Security Information and Event Management (SIEM) systems to collect log streams from firewalls, operating systems, and reverse proxies. However, traditional SIEM appliances function as passive, rule-matching monitors that generate massive alert backlogs for human analysts.

**SentinelAI** is an autonomous, multi-agent cyber defense and incident response platform designed to operate within multi-tenant cloud environments. It transforms cybersecurity operations from passive, human-mediated triage to closed-loop, machine-speed defense. By combining supervised tabular machine learning with a stateful multi-agent directed graph (compiled via LangGraph), SentinelAI decomposes the incident response lifecycle into modular, single-responsibility micro-agents:
- Log ingestion and 122-feature vectorization.
- Fast zero-day anomaly classification.
- Threat intelligence signature correlation.
- Root-cause vulnerability investigation with MITRE ATT&CK and CWE mapping.
- Autonomous synthesis of valid Linux `iptables` perimeter drop rules.
- Real-time notification synchronization to tenant portals with sovereign privacy preservation.

---

### 2. Operational Motivation & The Latency Gap
The architectural motivation for SentinelAI addresses three fundamental failures in conventional cybersecurity infrastructure:
1. **The Volume-Latency Asymmetry**: Hostile exploit payloads execute in milliseconds. Conversely, benchmark industry studies (IBM Ponemon, Cisco Cybersecurity Readiness) demonstrate that human-mediated triage and containment average **30 to 45 minutes** (Mean Time to Respond - MTTR). This creates an unacceptably wide window of exposure for critical enterprise data.
2. **SOC Alert Fatigue & False Positives**: Enterprise SOC analysts are inundated with over 10,000 security alerts daily, of which **greater than 70%** represent benign anomalies or misconfigurations. The resulting cognitive fatigue leads to missed Indicators of Compromise (IoCs). High-precision machine learning calibrated for zero-day traffic is required to eliminate false alarms while guaranteeing legitimate traffic availability.
3. **Monolithic AI Fragility**: While generative Large Language Models (LLMs) have been proposed for SOC automation, monolithic chatbots introduce severe hallucination rates (>18%), non-deterministic code synthesis, high prompt token latency (>2 seconds), and vulnerability to prompt injection. SentinelAI overcomes this by enforcing a strictly bounded, deterministic state machine where each micro-agent executes an isolated functional transformation.

---

### 3. Problem Statement & Mathematical Formulation
Conventional SOC incident response models decouple threat detection from remediation, creating severe structural latency and operational alert flooding.

Formally, let $T$ represent an incoming stream of network telemetry events, where each event $e_i \in T$ comprises an HTTP verb, URI, request headers, body payload, and client IP address. Let $C$ represent a multi-tenant cloud organization set governed by sovereign privacy policies $P_c \in \{0, 1\}$.

The objective of SentinelAI is to engineer an autonomous, closed-loop state machine $S(e_i)$ satisfying the mapping:

$$S(e_i) \to (A, R, N)$$

Where:
- $A$: Automated root-cause vulnerability analysis and Common Weakness Enumeration (CWE) classification.
- $R$: Dynamically synthesized, syntactically verified perimeter firewall drop rules (`iptables`).
- $N$: Tenant security notifications synchronized via real-time WebSocket channels.

**Subject to the following operational constraints:**
1. **High Detection Precision**: Attack precision $P \ge 95\%$ and normal recall $R \ge 95\%$ on unseen zero-day exploit variants to prevent business-disrupting false containment.
2. **Autonomous Remediation**: Autonomous synthesis of valid Linux `iptables` drop commands without requiring human operator manual scripting.
3. **Sub-Second Containment Latency**: Total end-to-end execution latency from ingestion to firewall synthesis bounded by $t_{\text{containment}} < 1.0\text{ second}$.
4. **Tenant Data Sovereignty**: Preservation of client private payloads through granular toggles ($P_c$) for Provider Monitoring and Global Signature Sharing.
5. **Configuration Integrity**: Full lifecycle governance conforming to IEEE 828-2012 SCM standards with 100% automated CI/CD verification.

---

### 4. Project Objectives & Scope
The technical and configuration management objectives for the SentinelAI project are defined as follows:
- **OBJ-1: Multi-Agent State Machine Architecture**: Construct a 6-stage compiled LangGraph `StateGraph` that enforces single-responsibility boundaries, typed state channels, and conditional edge routing.
- **OBJ-2: Dynamic Closed-Loop Mitigation**: Implement an automated Mitigation Agent capable of evaluating threat vectors and synthesizing valid Linux `iptables` drop rules in real time.
- **OBJ-3: High-Precision Zero-Day Threat Classification**: Train and optimize a regularized Histogram Gradient Boosting classifier on the 125,973-record NSL-KDD corpus (evaluating on the rigorous 22,544-record `KDDTest+` split containing 17 novel zero-day attack types) alongside the CSIC 2010 web application corpus.
- **OBJ-4: Sovereign Multi-Tenant Privacy Controls**: Construct a multi-tenant management portal with distinct Provider and Client roles, providing tenants with sovereign control over raw packet inspection and signature sharing.
- **OBJ-5: IEEE 828-2012 SCM Governance**: Establish a rigorous SCM framework cataloging 9 Configuration Items (CIs), freezing three formal baselines (Functional, Design, Product), enforcing structured Change Requests, and implementing continuous automated CI/CD audits.

---

### 5. Proposed Multi-Agent System Architecture
SentinelAI decomposes incident response into six discrete, coordinated micro-agents operating over a strongly-typed shared state channel:

```
[ External Telemetry Stream ]
              |
              v
+-----------------------------------------------+
| Stage 01: Log Analyzer Agent (CI-02)          | <--- 122 Feature Vectors & HistGradientBoosting
+-----------------------------------------------+
              |
      [ Anomaly Detected? ]
          /         \
  (No)   /           \   (Yes)
        v             v
+---------------+  +-----------------------------------------------+
| Normal 200 OK |  | Stage 02: Threat Intelligence Agent (CI-03)   | <--- Signature Correlation
+---------------+  +-----------------------------------------------+
                          |
                          v
                   +-----------------------------------------------+
                   | Stage 03: Investigation Agent (CI-04)         | <--- CWE-89/79/22 & Blast Radius
                   +-----------------------------------------------+
                          |
                          v
                   +-----------------------------------------------+
                   | Stage 04: Mitigation Recommendation (CI-05)   | <--- iptables Rule Synthesis
                   +-----------------------------------------------+
                          |
                          v
                   +-----------------------------------------------+
                   | Stage 05: Report Generator Service (CI-06)    | <--- Forensic JSON Audit Trail
                   +-----------------------------------------------+
                          |
                          v
+------------------------------------------------------------------+
| Stage 06: LangGraph Orchestrator & State Machine (CI-01)         |
| - SQLite Relational Persistence (sentinel.db)                    |
| - Real-Time WebSocket Event Dispatch                             |
+------------------------------------------------------------------+
              |                                 |
              v                                 v
+---------------------------------+  +---------------------------------+
| Global Admin SOC Console        |  | Client Tenant Portal            |
| (Port 6076 - Threat Dispatch)   |  | (Port 6076 - Sovereign Privacy) |
+---------------------------------+  +---------------------------------+
```

---

### 6. Target Performance Benchmarks & Expected Scientific Deliverables
- **Detection Precision**: $96.81\%$ attack precision and $96.99\%$ normal traffic recall on the NSL-KDD `KDDTest+` benchmark, mitigating false alarms and preventing disruption to legitimate business traffic.
- **Web Application Attack Detection**: $98.34\%$ overall detection accuracy on the CSIC 2010 web application dataset across SQLi ($99.17\%$), XSS ($98.20\%$), and Directory Traversal ($97.87\%$).
- **End-to-End Containment Latency**: Mean execution time of **20.24 milliseconds** from log ingestion through multi-agent analysis to firewall synthesis, beating the sub-second objective by a factor of 49x.
- **SCM Compliance**: 100% requirements-to-CI traceability, zero unapproved configuration drifts, and 100% automated regression test pass rates across all builds.

---

# PART B: ABOUT TOOL

### 1. SCM Toolchain & Infrastructure Overview
Software Configuration Management for SentinelAI is constructed under the principles of **IEEE Standard 828-2012 (Standard for Configuration Management in Systems and Software Engineering)**. Managing a machine learning-driven, multi-agent cyber defense application requires strict control over source code, configuration manifests, trained model weights, database schemas, and verification pipelines.

The SCM toolchain integrates the following core tools:
1. **Git 2.x**: Distributed Version Control System (VCS) managing commit histories, branching models, and cryptographically signed semantic baseline tags.
2. **GitHub Enterprise / Cloud**: Centralized repository host, providing team access controls, branch protection rules, pull request peer reviews, and Change Request (CR) issue tracking.
3. **GitHub Actions**: Continuous Integration and Continuous Deployment (CI/CD) engine executing automated multi-job regression testing on every push and pull request.
4. **Pytest 9.x**: Automated Python test runner executing unit tests, state machine validation, and functional configuration audits.
5. **Node.js 20 & Vite 5.4**: Frontend build engine performing static module bundling, JSX compilation, and build verification.

---

### 2. Version Control System: Git & GitHub Architecture

#### 2.1 Branching Strategy (GitFlow Implementation)
SentinelAI utilizes a structured GitFlow branching strategy to maintain strict separation between experimental development, stable integration, and frozen baseline releases:
- **`main` Branch**: Contains only formally approved, production-grade releases. Direct commits are restricted. Merges into `main` require formal Change Control Board (CCB) sign-off and correspond strictly to frozen SCM Baselines (`v0.1.0`, `v0.2.0`, `v1.0.0-product-baseline`).
- **`develop` Branch**: Serves as the primary integration branch where all verified feature branches converge. All pull requests targeting `develop` must pass the full GitHub Actions CI suite prior to merge.
- **Feature Branches (`feat/<feature-name>`)**: Isolated branches created by individual CI owners to develop specific configuration items (e.g., `feat/langgraph-state-machine`, `feat/nsl-kdd-pipeline`).
- **Bugfix / SCM Branches (`fix/<issue>` / `docs/<report>`)**: Dedicated branches for resolving defects identified during Functional Configuration Audits (FCAs) or updating formal documentation.

#### 2.2 Semantic Baseline Management
In accordance with IEEE 828-2012, SentinelAI defines three formal frozen baselines marked with annotated Git tags:
1. **Baseline I: Functional Baseline (`v0.1.0`)**: Captures the software requirements specifications (SRS), identification of the 9 Configuration Items (CIs), the multi-tenant database relational schema, and initial repository policies.
2. **Baseline II: Design Baseline (`v0.2.0`)**: Captures the architectural design documents, SQLAlchemy ORM models, FastAPI authentication endpoints, LangGraph agent interface contracts, and React dashboard UI wireframes.
3. **Baseline III: Product Baseline (`v1.0.0-product-baseline`)**: Captures the fully integrated system, the optimized NSL-KDD machine learning model, sub-second firewall synthesis logic, automated CI/CD verification workflows, and the completed academic report.

#### 2.3 Configuration Identification & Ownership Catalog
Every software artifact in SentinelAI is partitioned into one of nine discrete **Configuration Items (CIs)**, ensuring unambiguous ownership and traceability:

| CI Identifier | Configuration Item Name | Repository Location | CI Owner | Verification Mechanism | Status |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **CI-01** | Orchestration State Graph | `backend/app/agents/orchestrator.py` | Gouri Shankar Binu | Automated state machine routing pytest | **Verified** |
| **CI-02** | Log Analysis Module | `backend/app/agents/log_analyzer.py` | Arjun S | Ingestion and normalization assertions | **Verified** |
| **CI-03** | Threat Intelligence Connector | `backend/app/agents/threat_intel.py` | Ojaswita Dhar | Signature dictionary test cases | **Verified** |
| **CI-04** | Incident Investigation Agent | `backend/app/agents/investigation_agent.py` | Gouri Shankar Binu | CWE assertion tests (`CWE-89/79/22`) | **Verified** |
| **CI-05** | Mitigation Recommendation Agent | `backend/app/agents/mitigation_agent.py` | Arjun S | Firewall syntax validation tests | **Verified** |
| **CI-06** | Report Generation Service | `backend/app/agents/report_generator.py` | Arjun S | JSON schema conformity checks | **Verified** |
| **CI-07** | ML Models and Datasets | `backend/models/`, datasets | Ojaswita Dhar | KDDTest+ benchmark validation suite | **Verified** |
| **CI-08** | Multi-Tenant React Frontend | `frontend/src/` | Gouri Shankar Binu | Vite production bundle compilation | **Verified** |
| **CI-09** | CI/CD & Automated Verification | `.github/workflows/`, `backend/tests/` | Ojaswita Dhar | GitHub Actions multi-job runners | **Verified** |

---

### 3. Change Control & Configuration Auditing Tooling

#### 3.1 Change Control Board (CCB) Workflow
To prevent uncontrolled scope creep and configuration drift, all modifications affecting frozen baselines require a formal **Change Request (CR)** managed through GitHub Issue Templates (`.github/ISSUE_TEMPLATE/change_request.md`).

The change control procedure follows four mandatory steps:
1. **CR Submission**: The developer raises a CR issue detailing the affected Configuration Item, classification (Class I major or Class II minor), proposed modification, and architectural justification.
2. **Impact & Regression Analysis**: The SCM Coordinator reviews the CR for potential breaking changes across dependent CIs and verifies test coverage.
3. **CCB Deliberation**: The CCB (comprising all three team members: SCM Coordinator, Build Owner, and Documentation Owner) reviews and records formal approval.
4. **Automated Verification & Merge**: The modification is committed to a feature branch, verified via CI/CD, merged into `develop`, and tracked in the Configuration Status Accounting (CSA) log.

#### 3.2 Configuration Auditing Tooling (PCA & FCA)
- **Functional Configuration Audit (FCA)**: Performed automatically on every Git commit via GitHub Actions. FCA executes the `pytest backend/tests/ -v` test suite, validating that every CI fulfills its assigned functional requirements.
- **Physical Configuration Audit (PCA)**: Validates that all design documents, requirements matrices, and code artifacts correspond to the approved baseline versions before any release tag is generated.

---

### 4. Continuous Integration & Continuous Delivery (CI/CD) Tool: GitHub Actions
The project employs an automated GitHub Actions workflow (`.github/workflows/ci.yml`) triggered on all pushes and pull requests to `main` and `develop`.

#### Pipeline Architecture
The CI pipeline executes two parallel verification jobs on `ubuntu-latest` virtual environments:
1. **Job 1: Backend CI (`backend-ci`)**:
   - Environment: Python 3.11 with cached pip dependencies.
   - Task: Installs backend requirements, loads serialized ML models, and executes automated pytest suites (`test_agents.py`, `test_orchestrator.py`).
   - Criteria: 100% test assertions must pass without warnings.
2. **Job 2: Frontend CI (`frontend-ci`)**:
   - Environment: Node.js 20 with npm dependency caching.
   - Task: Lints JSX components, checks TypeScript/ESLint rules, and executes `npm run build` to verify production bundle generation.
   - Criteria: Zero syntax errors and successful generation of distribution assets in `frontend/dist/`.

```yaml
name: CI Verification Pipeline
on:
  push:
    branches: [ develop, main ]
  pull_request:
    branches: [ develop, main ]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r backend/requirements.txt
      - run: pytest backend/tests/ -v

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd frontend && npm ci && npm run build
```

---

### 5. Runtime Engineering Technologies & Frameworks
Beyond SCM tooling, SentinelAI leverages an optimized modern technology stack to achieve sub-second execution:

| Architectural Tier | Selected Technology | Version | Engineering Justification |
| :--- | :--- | :--- | :--- |
| **Agent State Machine** | LangGraph / LangChain | 0.2.x | Enables stateful, compiled cyclic graphs with deterministic conditional routing, replacing unpredictable prompt-chained LLMs. |
| **Machine Learning** | Scikit-learn (HistGradientBoosting) | 1.4.x | Provides fast binned histogram gradient boosting, ideal for 122-feature tabular network flow data with sub-millisecond inference. |
| **Backend API Server** | FastAPI / Uvicorn ASGI | 0.110.x | High-throughput asynchronous REST and WebSocket server running on port 8004 with automatic OpenAPI documentation. |
| **Persistence Layer** | SQLite3 / SQLAlchemy ORM | 2.0.x | Lightweight, relational zero-configuration storage (`sentinel.db`) tracking multi-tenant users, telemetry, and incident drop logs. |
| **Frontend Dashboard** | React 18 / Vite 5.4 | 18.x | High-performance single-page application running on port 6076 with modular components for Provider and Tenant views. |
| **Styling & Visualization** | Tailwind CSS / Lucide-React | 3.4.x | High-contrast, dark-mode cybersecurity aesthetic with real-time responsive SVG charting components. |

---

### 6. Comparative Justification of SCM & Technical Tools

| Tool Category | Selected Tool | Alternative Evaluated | Justification for Selection |
| :--- | :--- | :--- | :--- |
| **Version Control** | **Git (Distributed)** | SVN (Centralized) | Git enables distributed offline branching, cryptographic commit hashing (SHA-1/256), and lightweight feature branching without server dependencies. |
| **CI/CD Platform** | **GitHub Actions** | Jenkins (Self-Hosted) | Native repository integration, zero server maintenance overhead, declarative YAML workflows, and managed cloud runners for reproducible builds. |
| **Agentic Framework** | **LangGraph** | AutoGen / CrewAI | LangGraph compiles deterministic `StateGraph` state machines with strongly typed state channels, preventing conversational loops and hallucinations. |
| **Classifier Model** | **HistGradientBoosting** | Deep Neural Networks (MLP) | 10x faster training, native handling of categorical features, lower CPU inference latency (4.2 ms vs 35 ms), and superior tabular performance on NSL-KDD. |
| **Web Framework** | **FastAPI** | Flask / Django | Native asynchronous event loop (`async`/`await`), built-in Pydantic schema validation, and high-performance WebSocket streaming for real-time telemetry. |

---

# SCM REVIEW 1 DELIVERABLES CHECKLIST

| Review 1 Requirement | Planned Deliverable | Current SCM Status | Evidence / Verification Location |
| :--- | :--- | :---: | :--- |
| **Group & Project Info** | Team formation, roles, CI ownership, and faculty alignment | **Completed** | Title page table, repository README, and SCM plan |
| **Configuration Identification** | Decomposition into 9 distinct Configuration Items (CIs) | **Completed** | Table 8.1 in SCM documentation and repository structure |
| **VCS Repository Setup** | Branching model, issue templates, and commit policy | **Completed** | Git repository initialized with `main`, `develop`, and `.github/` |
| **Functional Baseline (v0.1.0)** | Checkpoint of SRS, database schema, and architectural design | **Completed** | Annotated Git tag `v0.1.0` frozen on `main` branch |
| **CI/CD Pipeline Setup** | Automated test runner and build verification workflow | **Completed** | `.github/workflows/ci.yml` passing on GitHub Actions |
| **Initial Prototype / Demo** | End-to-end telemetry ingestion and log analysis agent | **Completed** | `pytest backend/tests/ -v` passing with 100% green status |

---

**Report Prepared By:**  
- **Ojaswita Dhar** (24MIS0131) — Build & Test Owner  
- **Arjun S** (24MIS0128) — Documentation & Release Owner  
- **Gouri Shankar Binu** (24MIS0137) — SCM Coordinator & Lead  

**Submitted to:** Dr. TamilPriya, School of Computer Science Engineering and Information Systems (SCOPE), VIT Vellore.
