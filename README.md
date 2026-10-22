# SentinelAI: Multi-Agent Autonomous SOC Incident Response System

**Software Configuration Management (SCM) Project**  
**Vellore Institute of Technology (VIT)**

---

## Team Details

| Name | Registration Number | SCM Role & CI Ownership |
| :--- | :--- | :--- |
| **Gouri Shankar Binu** | 24MIS0137 | SCM Coordinator, Orchestration Layer, Baseline Management |
| **Arjun S** | 24MIS0128 | Documentation & Release Owner, Log Analyzer, Report Generation |
| **Ojaswita Dhar** | 24MIS0131 | Build & Test Owner, Threat Intel Connector, CI/CD Pipeline |

---

## 1. Project Overview

Modern Security Operations Centers (SOCs) face severe operational bottlenecks due to alert fatigue, manual log triaging, and delayed incident mitigation. SentinelAI solves this problem by deploying a team of specialized, autonomous AI agents coordinated through a LangGraph state graph.

Rather than operating as a monolithic chatbot, each agent handles an isolated phase of the SOC lifecycle:
1. Parsing incoming network requests.
2. Detecting anomalous or malicious traffic.
3. Querying threat intelligence signatures.
4. Investigating root causes and blast radiuses.
5. Formulating defensive mitigation counter-measures.
6. Generating auditable incident reports and updating security dashboards in real time.

The system is designed with a **Multi-Tenant Architecture**:
- **Provider View (Admin)**: Monitors aggregated threat telemetry across all onboarded client domains.
- **Client View (Tenant)**: Restricts visibility strictly to tenant-specific telemetry and allows configuring defensive toggles (e.g., auto-mitigation, signature sharing).

---

## 2. Multi-Agent SOC Architecture

The core pipeline is implemented with a strict modular structure (**one agent per file**) located in `backend/app/agents/`:

```
               [ Incoming HTTP / Network Request ]
                                |
                                v
                   +------------------------+
                   |  1. Log Analyzer Agent | (CI-02)
                   +------------------------+
                                |
                                v
               [ Anomaly Detected by ML Model? ]
                        /               \
                 (Yes) /                 \ (No)
                      v                   v
        +--------------------------+    [ Traffic Cleared: Return OK ]
        | 2. Threat Intel Agent    | (CI-03)
        +--------------------------+
                      |
                      v
        +--------------------------+
        | 3. Investigation Agent   | (CI-04)
        +--------------------------+
                      |
                      v
        +--------------------------+
        | 4. Mitigation Agent      | (CI-05)
        +--------------------------+
                      |
                      v
        +--------------------------+
        | 5. Report Generator      | (CI-06)
        +--------------------------+
                      |
                      v
        [ Database Logged & Frontend Dashboard Updated ]
```

### Agent Breakdown

* **Agent Orchestrator (`orchestrator.py`) [CI-01]**:
  Constructs a compiled `StateGraph` using LangGraph to manage state handoffs, routing logic, and sequential node transitions.
* **Log Analyzer Module (`log_analyzer.py`) [CI-02]**:
  Normalizes raw HTTP method, URI, headers, and payload data. Passes vectorized inputs to the threat detection classifier.
* **Threat Intelligence Connector (`threat_intel.py`) [CI-03]**:
  Correlates identified anomalies with threat signatures (SQL Injection, Cross-Site Scripting, Directory Traversal, Command Injection).
* **Incident Investigation Agent (`investigation_agent.py`) [CI-04]**:
  Conducts automated root-cause analysis, maps vulnerabilities to standard MITRE/CWE categories (e.g., CWE-89, CWE-79, CWE-22), and determines the incident blast radius.
* **Mitigation Recommendation Agent (`mitigation_agent.py`) [CI-05]**:
  Generates immediate actionable responses, including tenant rate limiting, session revocation, and dynamic perimeter firewall filtering rules (`iptables` DROP commands).
* **Report Generation Service (`report_generator.py`) [CI-06]**:
  Synthesizes the complete findings into structured, time-stamped incident audit summaries for SOC operators.

---

## 3. Software Configuration Management (SCM) Implementation

This project is governed under formal Software Configuration Management principles across four pillars:

### Pillar 1: Configuration Identification (CI Identification)

All codebase artifacts are cataloged as formal Configuration Items:

| CI Identifier | Configuration Item Name | Repository Location | CI Owner |
| :--- | :--- | :--- | :--- |
| **CI-01** | Orchestration State Graph | `backend/app/agents/orchestrator.py` | Gouri Shankar Binu |
| **CI-02** | Log Analysis Module | `backend/app/agents/log_analyzer.py` | Arjun S |
| **CI-03** | Threat Intelligence Connector | `backend/app/agents/threat_intel.py` | Ojaswita Dhar |
| **CI-04** | Incident Investigation Agent | `backend/app/agents/investigation_agent.py` | Gouri Shankar Binu |
| **CI-05** | Mitigation Recommendation Agent | `backend/app/agents/mitigation_agent.py` | Arjun S |
| **CI-06** | Report Generation Service | `backend/app/agents/report_generator.py` | Arjun S |
| **CI-07** | ML Models and Datasets | `backend/models/`, datasets | Ojaswita Dhar |
| **CI-08** | Multi-Tenant React Frontend | `frontend/src/` | Gouri Shankar Binu |
| **CI-09** | CI/CD and Test Automation | `.github/workflows/`, `backend/tests/` | Ojaswita Dhar |

### Pillar 2: Baseline Management

Project progression is formally checkpointed into three version-tagged baselines:

* **Baseline I: Functional Baseline (`v0.1.0` / `v0.1`)**:
  Established at Review 1. Freezes project requirements, configuration item catalog, roles and responsibilities, and repository branching policies.
* **Baseline II: Design Baseline (`v0.2.0` / `v0.2`)**:
  Established at Review 2. Freezes orchestration architecture, database schemas, JWT multi-tenant authentication, and preliminary agent interfaces.
* **Baseline III: Product Baseline (`v1.0.0-product-baseline`)**:
  Established at Review 3. Freezes the fully integrated 6-agent autonomous pipeline, NSL-KDD benchmark model, automated CI/CD pipeline, and complete test suites.

### Pillar 3: Change Control Management

* **Change Request Templates**: Configured in `.github/ISSUE_TEMPLATE/change_request.md` for structured evaluation before modifying any baseline.
* **Defect Tracking**: Configured in `.github/ISSUE_TEMPLATE/bug_report.md` for tracking and resolving regressions.
* **Pull Request Guidelines**: Configured in `.github/pull_request_template.md` requiring unit test passes and peer code reviews before merging into `develop` or `main`.
* **Branching Strategy**:
  - `main`: Protected production branch holding official baseline releases.
  - `develop`: Integration branch where tested feature branches converge.
  - `feature/<agent-name>`: Short-lived branches dedicated to individual configuration items.

### Pillar 4: Configuration Auditing & Verification (Automated CI/CD)

The GitHub Actions pipeline (`.github/workflows/ci.yml`) automatically executes on every `push` and `pull_request`:
* **Backend Verification Job**: Spins up Python 3.11, installs dependencies, and runs the automated agent test suite (`pytest backend/tests/ -v`).
* **Frontend Verification Job**: Spins up Node.js 20, installs dependencies, and validates production compilation (`npm run build`).

---

## 4. Machine Learning Threat Detection & Performance Analysis

SentinelAI evaluates incoming traffic using trained supervised learning pipelines. The project incorporates two benchmark security datasets:

### 1. CSIC 2010 HTTP Dataset
* **Domain**: Web Application Attacks (SQL Injection, Buffer Overflows, Cross-Site Scripting).
* **Architecture**: Term Frequency-Inverse Document Frequency (TF-IDF) feature extraction with a 50-tree Random Forest Classifier.
* **Data Leakage Safeguard**: Strict stratified split prior to vectorizer vocabulary fitting.

### 2. NSL-KDD Benchmark Dataset
* **Domain**: Network Intrusion Detection (Flow attributes across DoS, Probe, R2L, and U2R attacks).
* **Dataset Splits**:
  - Training Set: `KDDTrain+_20Percent.txt` (25,192 records)
  - Test Set: `KDDTest+.txt` (22,544 records)
* **Feature Processing**:
  - Categorical variables (`protocol_type`, `service`, `flag`) encoded via `OneHotEncoder(handle_unknown='ignore')`.
  - Numerical flow variables passed through `ColumnTransformer`.
  - Classifier: `RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)`.

### Quantitative Performance Metrics (NSL-KDD Test Set)

| Class | Precision | Recall | F1-Score | Support |
| :--- | :--- | :--- | :--- | :--- |
| **Normal Traffic (Class 0)** | 0.67 | 0.97 | 0.79 | 9,711 |
| **Attack Traffic (Class 1)** | **0.97** | 0.64 | 0.77 | 12,833 |
| **Accuracy** | — | — | **0.78 (78.07%)** | 22,544 |
| **Macro Average** | 0.82 | 0.80 | 0.78 | 22,544 |
| **Weighted Average** | 0.84 | 0.78 | 0.78 | 22,544 |

### In-Depth Interpretation of Model Performance

1. **High Attack Precision (97%)**:
   When the model flags an event as an attack, it is correct 97% of the time. This is critical for SOC operations because it practically eliminates false alerts, ensuring analysts and mitigation agents are not reacting to benign operations.
2. **High Normal Recall (97%)**:
   The model successfully allows 97% of legitimate normal traffic to pass through uninterrupted, minimizing disruption to regular application users.
3. **Generalization Across Unseen Test Data**:
   The NSL-KDD test set (`KDDTest+`) intentionally includes 17 attack subtypes that do not appear in the training split. Achieving an overall accuracy of 78.07% demonstrates strong generalization without memorization or data leakage.

---

## 5. Repository Structure

```
SCM_Project/
|-- .github/
|   |-- ISSUE_TEMPLATE/
|   |   |-- bug_report.md              # SCM Defect Report Template
|   |   `-- change_request.md          # SCM Change Request Template
|   |-- pull_request_template.md       # SCM PR Verification Checklist
|   `-- workflows/
|       `-- ci.yml                     # Multi-Job GitHub Actions CI Pipeline
|-- backend/
|   |-- app/
|   |   |-- agents/                    # Multi-Agent SOC Modules (1 file per agent)
|   |   |   |-- investigation_agent.py # Root-cause analysis & CWE mapping
|   |   |   |-- log_analyzer.py        # Log parsing & model inference
|   |   |   |-- mitigation_agent.py    # Counter-measure & firewall generator
|   |   |   |-- orchestrator.py        # LangGraph StateGraph workflow
|   |   |   |-- report_generator.py    # Incident summary compilation
|   |   |   `-- threat_intel.py        # External threat feed connector
|   |   |-- models/                    # SQLAlchemy ORM models & Pydantic schemas
|   |   |-- routers/                   # FastAPI endpoints (auth, dashboard, predict)
|   |   |-- auth.py                    # JWT authentication & password hashing
|   |   |-- database.py                # Database connection & session factory
|   |   `-- main.py                    # FastAPI application entrypoint
|   |-- models/                        # Serialized ML model pipelines (.pkl)
|   |-- tests/
|   |   `-- test_agents.py             # Pytest automated test suite
|   |-- pytest.ini                     # Pytest environment configuration
|   |-- requirements.txt               # Locked backend dependencies
|   |-- train_model.py                 # CSIC 2010 training script
|   `-- train_nsl_kdd.py               # NSL-KDD training pipeline script
|-- docs/
|   `-- SCM_CONFIGURATION_PLAN.md      # Detailed SCM specification & CI matrix
|-- frontend/
|   |-- src/
|   |   |-- pages/
|   |   |   |-- Dashboard.jsx          # SOC Operator & Tenant Dashboard
|   |   |   `-- Login.jsx              # Operator Authentication Portal
|   |   |-- App.jsx                    # Route handling & provider context
|   |   `-- index.css                  # Tailored styling & contrast theme
|   |-- package.json                   # Frontend dependencies
|   `-- vite.config.js                 # Vite bundler configuration
|-- constant_traffic.py                # Real-time traffic simulation service
|-- csic_database.csv                  # CSIC 2010 HTTP Dataset
|-- pytest.ini                         # Root pytest configuration
|-- .gitignore                         # SCM ignore rules
`-- README.md                          # Comprehensive project documentation
```

---

## 6. Installation & Execution Guide

### Prerequisites
* Python 3.10 or 3.11
* Node.js 20 or higher
* Git

### Step 1: Clone Repository
```bash
git clone https://github.com/Gourishankar403/SCM_Project.git
cd SCM_Project
```

### Step 2: Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3: Run Automated Test Suite
```bash
pytest tests/ -v
```

### Step 4: Start Backend Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8004 --reload
```
* Backend API Documentation: `http://localhost:8004/docs`

### Step 5: Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev -- --port 6076
```
* Dashboard Application: `http://localhost:6076`

### Step 6: Start Real-Time Traffic Generator (Optional)
To stream live simulated telemetry into the dashboard:
```bash
python constant_traffic.py
```

---

## 7. Default Credentials for Evaluation

| Role | Username / Operator ID | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Provider (Global SOC Admin)** | `admin` | `admin123` | Full access across all tenant telemetry |
| **Client (TechCorp Tenant)** | `techcorp_user` | `client123` | Isolated view for techcorp.com domain |

---

## 8. SCM Audit Summary & Status

* **Current Baseline**: `v1.0.0-product-baseline` (Review 3 Product Baseline)
* **CI/CD Pipeline Status**: Passing (GitHub Actions multi-job verified)
* **Repository URL**: [https://github.com/Gourishankar403/SCM_Project](https://github.com/Gourishankar403/SCM_Project)
