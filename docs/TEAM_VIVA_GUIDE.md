# SENTINELAI: TEAM BRIEFING & SCM VIVA DEFENSE GUIDE
### Software Configuration Management (SCM) Project — VIT
**Repository:** [https://github.com/Gourishankar403/SCM_Project](https://github.com/Gourishankar403/SCM_Project)

---

## 1. EXECUTIVE SUMMARY: WHAT HAVE WE BUILT?

**The Core Concept**:  
SentinelAI is an **Autonomous Multi-Agent Cyber Defense & Incident Response System** designed for enterprise Security Operations Centers (SOCs) operating in a multi-tenant cloud environment.

**The Problem We Solve**:  
Traditional SOCs are overwhelmed by thousands of daily alerts. Over 70% are false alarms (causing "alert fatigue"), and human response times (30 to 45 minutes) are far too slow for machine-speed attacks. Furthermore, typical machine learning projects stop at binary classification (predicting 0 or 1) and leave the response to humans.

**Our Solution**:  
SentinelAI closes the detection-remediation loop. We built an autonomous pipeline of **six specialized AI micro-agents** coordinated through a LangGraph state graph. When a request hits the system:
1. It is normalized and analyzed.
2. A machine learning model identifies whether it is anomalous.
3. If malicious, specialized agents investigate the root cause (mapping to standard CWE vulnerabilities), synthesize executable perimeter firewall drop rules (`iptables`), and immediately dispatch an automated incident alert to the affected tenant.

---

## 2. INDIVIDUAL ROLES & CONFIGURATION ITEM (CI) OWNERSHIP

During the review, the evaluator will ask each team member what they personally owned and implemented. Here is the exact role breakdown:

```
+---------------------------------------------------------------------------------------------------------+
|                                    TEAM ROLES & CI RESPONSIBILITY                                       |
+---------------------+-------------------+-----------------------------------+---------------------------+
| Team Member         | Registration No.  | SCM Role                          | Assigned CIs              |
+---------------------+-------------------+-----------------------------------+---------------------------+
| Gouri Shankar Binu  | 24MIS0137         | SCM Coordinator & Architecture    | CI-01, CI-04, CI-08       |
| Arjun S             | 24MIS0128         | Documentation & Release Owner     | CI-02, CI-05, CI-06       |
| Ojaswita Dhar       | 24MIS0131         | Build, Test & CI/CD Owner         | CI-03, CI-07, CI-09       |
+---------------------+-------------------+-----------------------------------+---------------------------+
```

### What Each Person Should Say in the Viva:

#### Gouri Shankar Binu (24MIS0137) — SCM Coordinator & Architecture Lead
* **What you owned**:
  * Overall SCM governance: Repository structure, branch policy (`main` vs `develop`), and baseline tags (`v0.1.0`, `v0.2.0`, `v1.0.0-product-baseline`).
  * **CI-01**: Agent Orchestration Layer (`backend/app/agents/orchestrator.py`) using LangGraph StateGraph.
  * **CI-04**: Incident Investigation Agent (`backend/app/agents/investigation_agent.py`) for automated root-cause analysis and CWE mapping.
  * **CI-08**: Multi-Tenant React Frontend UI (`frontend/src/`).
* **Your key talking point**:  
  *"I architected the multi-agent state machine in LangGraph and maintained the SCM baselines. I ensured our system is not a black-box chatbot, but a deterministic sequence of state transitions where malicious events trigger automated investigation and mitigation."*

#### Arjun S (24MIS0128) — Documentation & Release Owner
* **What you owned**:
  * Project documentation, release notes, and Change Control templates.
  * **CI-02**: Log Analysis Module (`backend/app/agents/log_analyzer.py`) for request parsing, URI extraction, and input normalization.
  * **CI-05**: Mitigation Recommendation Agent (`backend/app/agents/mitigation_agent.py`) for automated counter-measure formulation and dynamic `iptables` drop rule synthesis.
  * **CI-06**: Report Generation Service (`backend/app/agents/report_generator.py`) for structured incident audit compilation.
* **Your key talking point**:  
  *"I developed the Log Analyzer, Mitigation Agent, and Report Generation Service. My focus was closing the incident loop: rather than merely detecting threats, my mitigation agent translates threat intelligence into actionable iptables firewall rules and dispatches structured audit reports."*

#### Ojaswita Dhar (24MIS0131) — Build, Testing & CI/CD Owner
* **What you owned**:
  * Automated testing and Continuous Integration (CI/CD) pipelines.
  * **CI-03**: Threat Intelligence Connector (`backend/app/agents/threat_intel.py`) for correlating payloads against known attack signatures.
  * **CI-07**: ML Models and Datasets (`backend/train_nsl_kdd.py`, CSIC 2010, and NSL-KDD benchmark training pipelines).
  * **CI-09**: CI/CD and Test Automation (`.github/workflows/ci.yml` and `backend/tests/test_agents.py`).
* **Your key talking point**:  
  *"I managed the CI/CD pipeline on GitHub Actions, the automated pytest regression suite, and the ML threat detection engine. I trained our Histogram Gradient Boosting model on the 125,973-record NSL-KDD dataset, achieving 97% attack precision and 81.06% accuracy on zero-day attack test sets."*

---

## 3. SOFTWARE CONFIGURATION MANAGEMENT (SCM) & GIT WORKFLOW

When ma'am asks: *"How did you use GitHub as an SCM tool?"*, explain the **4 Pillars of SCM**:

### Pillar 1: Configuration Identification
* We broke down the entire system into 9 distinct Configuration Items (CI-01 through CI-09).
* Every CI has an assigned owner, clear directory boundary, and documented version.

### Pillar 2: Baseline Management (Milestone Checkpoints)
We checkpointed the project lifecycle into three formal Git-tagged baselines:
* **Baseline I (`v0.1.0` / `v0.1`) — Functional Baseline (Review 1)**: Requirements frozen, CI catalog identified, and branching policies established.
* **Baseline II (`v0.2.0` / `v0.2`) — Design Baseline (Review 2)**: Database schema, LangGraph orchestrator bindings, and multi-tenant UI design frozen.
* **Baseline III (`v1.0.0-product-baseline`) — Product Baseline (Review 3)**: Complete 6-stage autonomous SOC pipeline, optimized NSL-KDD model, automated CI/CD pipeline, and passing regression test suites.

### Pillar 3: Change Control Management
* **Change Requests (CRs)**: No developer directly pushes code to `main`. To propose a modification to any baseline, a formal Change Request issue is submitted using `.github/ISSUE_TEMPLATE/change_request.md`.
* **Defect Reports**: Regressions are logged via `.github/ISSUE_TEMPLATE/bug_report.md`.
* **Pull Request (PR) Checklist**: Configured in `.github/pull_request_template.md`. Mandates local unit tests pass, no regression against existing CIs, and peer review approval.
* **Branching Strategy**:
  * `main`: Protected production branch holding verified baselines only.
  * `develop`: Integration branch where tested feature branches converge.
  * `feature/<ci-name>`: Short-lived feature branches isolated per Configuration Item.

### Pillar 4: Configuration Auditing & Verification (Automated CI/CD)
* Enforced via **GitHub Actions** (`.github/workflows/ci.yml`).
* Every `push` and `pull_request` automatically triggers virtual Ubuntu runners that verify all CIs before code can enter `develop` or `main`.

---

## 4. HOW THE CI/CD PIPELINE WORKS (GITHUB ACTIONS)

Our GitHub Actions pipeline contains **two concurrent automated verification jobs**:

```
[ Git Push / Pull Request to develop or main ]
                      |
         +------------+------------+
         |                         |
         v                         v
+-----------------------+   +-----------------------+
|  Job 1: Backend CI    |   |  Job 2: Frontend CI   |
|  - Runner: Ubuntu     |   |  - Runner: Ubuntu     |
|  - Python 3.11        |   |  - Node.js 20         |
|  - pip install reqs   |   |  - npm install        |
|  - pytest tests/ -v   |   |  - npm run build      |
+-----------------------+   +-----------------------+
         |                         |
         +------------+------------+
                      |
                      v
             [ Both Jobs Pass: Green Checkmark on GitHub ]
```

1. **Backend CI Job (`backend-audit-and-test`)**:
   * Spins up Python 3.11 on an Ubuntu runner.
   * Installs locked dependencies from `backend/requirements.txt`.
   * Executes `pytest backend/tests/ -v`.
   * Verifies that all 6 agents execute deterministically and that normal traffic and attack payloads are handled correctly.
2. **Frontend CI Job (`frontend-build-verification`)**:
   * Spins up Node.js 20 on an Ubuntu runner.
   * Installs frontend packages and executes production bundle compilation (`npm run build`).
   * Guarantees zero syntax errors, missing imports, or asset compilation failures.

---

## 5. THE 6 AI AGENTS: ARCHITECTURAL BREAKDOWN

Located in `backend/app/agents/` (**one agent per file**):

```
1. Log Analyzer (CI-02)        --> Parses HTTP method, URI, headers, payload, and flow metrics.
2. Threat Detection Engine     --> ML Classifier (HistGradientBoosting) predicts Normal (0) vs Attack (1).
3. Threat Intel Connector (CI-03) --> Identifies attack signatures (SQLi, XSS, Directory Traversal).
4. Investigation Agent (CI-04) --> Performs root cause analysis & maps to CWE-89, CWE-79, CWE-22.
5. Mitigation Agent (CI-05)    --> Synthesizes executable firewall drop rules: iptables -A INPUT -s <IP> -j DROP.
6. Report Generator (CI-06)    --> Assembles time-stamped incident audit summaries for database & dashboard.
Orchestrator (CI-01)           --> LangGraph StateGraph that routes execution sequentially.
```

---

## 6. MACHINE LEARNING ENGINE: METRICS & EXPLANATION

### Datasets Used:
1. **CSIC 2010 HTTP Dataset**: Focuses on web application attacks (SQL Injection, Cross-Site Scripting, Buffer Overflows).
2. **NSL-KDD Benchmark Dataset**: Industry benchmark for network flow intrusion detection.
   * Training Split: `KDDTrain+.txt` (125,973 network flow records).
   * Test Split: `KDDTest+.txt` (22,544 benchmark test records).

### The Model:
* Algorithm: `HistGradientBoostingClassifier` with $L_2$ regularization ($L_2 = 2.0$) and calibrated decision threshold ($\tau = 0.38$).

### Performance Numbers to Remember:

| Metric | Score | Practical Meaning |
| :--- | :--- | :--- |
| **Attack Precision** | **97.00%** | When our system flags an attack, it is correct **97 out of 100 times**. Practically **zero false alarms**. |
| **Normal Recall** | **97.00%** | 97% of legitimate client traffic passes through without disruption. **Preserves business uptime**. |
| **Attack Recall** | **69.00%** | Successfully catches 69% of attacks on a test set containing **17 zero-day attack subtypes**. |
| **Overall Accuracy** | **81.06%** | High overall accuracy on unseen, zero-day network traffic. |

---

## 7. LIVE DEMO PLAYBOOK (WHAT TO CLICK DURING REVIEW)

1. **Step 1: Open Application**
   * Frontend URL: `http://localhost:6076`
   * Backend API: `http://localhost:8004/docs`

2. **Step 2: Log in as Global Administrator (Provider View)**
   * Operator ID: `admin`
   * Passcode: `admin123`
   * **What to show**:
     * Live Traffic Monitor graph moving dynamically in real time.
     * Total Traffic, Clean Requests, and Threats Blocked counter cards.
     * The **Threat Detection & Dispatch Console** card showing:
       * `Threat Detected` (red badge)
       * Incident ID (e.g., `INC-2222`)
       * `Automatic Incident Response Sent` (green badge)
       * Synchronized Perimeter Rule (`iptables -A INPUT -s ... -j DROP`).
     * Click the red **`Dispatch Response`** button. Watch it dispatch a new incident and update the counters live.

3. **Step 3: Log in as TechCorp Client (Tenant View)**
   * Click **Sign Out** and log in with Operator ID: `techcorp_user`, Passcode: `client123`.
   * **What to show**:
     * The **Flash Security Alert Banner** at the top from the SentinelAI SOC Security Team.
     * Point out: Incident ID, Threat Vector (SQLi), Applied Mitigation, and Perimeter Firewall rule.
     * Click **`Acknowledge Notice`** to demonstrate client acknowledgment.
     * Scroll down to **Manage Permissions**: show that the client can toggle Provider Monitoring and Share Signatures independently to preserve privacy.

4. **Step 4: Show GitHub SCM Governance**
   * Open `https://github.com/Gourishankar403/SCM_Project` on your browser:
     * Click **Actions**: Show the green passing checkmarks for both Backend and Frontend verification jobs.
     * Click **Releases / Tags**: Show formal baseline tags `v0.1.0`, `v0.2.0`, and `v1.0.0-product-baseline`.
     * Click `.github/ISSUE_TEMPLATE`: Show Change Request and Bug Report templates.

---

## 8. POTENTIAL VIVA QUESTIONS & MODEL ANSWERS

#### Q1: "What is the novelty in your project?"
* **Answer**: *"Traditional projects are passive classifiers: they predict 0 or 1 and stop. Monolithic LLM chatbots hallucinate and cannot safely control infrastructure. SentinelAI's novelty is a closed-loop autonomous response pipeline using a 6-stage LangGraph state machine: when an attack is detected, our agents investigate the root cause (mapping to CWEs), dynamically synthesize executable iptables drop rules, and dispatch real-time incident responses directly to the affected tenant."*

#### Q2: "How is this related to Software Configuration Management (SCM)?"
* **Answer**: *"We implemented the 4 formal pillars of SCM:
  1. Configuration Identification: Cataloged 9 discrete CIs with individual owners.
  2. Baseline Management: Checkpointed three formal baselines (Functional v0.1.0, Design v0.2.0, and Product v1.0.0-product-baseline).
  3. Change Control: Enforced GitHub Issue Change Request templates, PR checklists, and branch policies.
  4. Configuration Auditing: Implemented automated GitHub Actions CI/CD executing regression tests and frontend build checks on every push."*

#### Q3: "Why is your NSL-KDD accuracy 81.06% and not 99%?"
* **Answer**: *"In the official NSL-KDD benchmark, the test set (KDDTest+) intentionally includes 17 novel zero-day attack subtypes that never appeared in the training set. A model reporting 99% on training data is typically overfitted or suffering from data leakage. Achieving 81.06% accuracy on unseen zero-day attacks while maintaining 97% attack precision demonstrates true generalization without false alarms."*

#### Q4: "Why did you separate the system into micro-agents rather than one script?"
* **Answer**: *"Separation of concerns. In SCM, modularity reduces coupling and limits change impact. If we need to update the threat intelligence connector (CI-03), we do not touch the log analyzer (CI-02) or the orchestrator (CI-01). Furthermore, LangGraph gives us deterministic state transitions and early exit routing, short-circuiting benign traffic to eliminate unnecessary computation."*
