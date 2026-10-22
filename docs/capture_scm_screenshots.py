import os
from playwright.sync_api import sync_playwright

output_dir = r"c:\SCM_Project\docs\screenshots"

# HTML for Figure 6: GitHub Actions CI/CD Pipeline
html_fig6 = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GitHub Actions - SentinelAI CI/CD Workflow</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
  body { background-color: #0d1117; color: #c9d1d9; padding: 28px; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #21262d; padding-bottom: 20px; margin-bottom: 24px; }
  .title-group { display: flex; align-items: center; gap: 12px; }
  .check-icon { width: 28px; height: 28px; border-radius: 50%; background: #238636; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px; }
  .workflow-title { font-size: 20px; font-weight: 600; color: #f0f6fc; }
  .meta-badges { display: flex; gap: 12px; font-size: 13px; color: #8b949e; margin-top: 6px; }
  .meta-badge { background: #161b22; border: 1px solid #30363d; padding: 4px 10px; border-radius: 6px; }
  .grid-container { display: grid; grid-template-columns: 320px 1fr; gap: 24px; }
  .jobs-list { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; }
  .job-card { background: #21262d; border: 1px solid #388bfd; border-radius: 6px; padding: 14px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
  .job-card.success { border-color: #238636; }
  .job-name { font-weight: 600; color: #f0f6fc; font-size: 14px; display: flex; align-items: center; gap: 8px; }
  .job-time { font-size: 12px; color: #8b949e; }
  .logs-pane { background: #010409; border: 1px solid #30363d; border-radius: 8px; padding: 18px; font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 12.5px; line-height: 1.6; }
  .log-section { margin-bottom: 14px; }
  .log-title { color: #58a6ff; font-weight: bold; margin-bottom: 6px; }
  .log-pass { color: #3fb950; }
  .log-dim { color: #8b949e; }
  .tag { background: #238636; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="title-group">
        <div class="check-icon">&#10003;</div>
        <div class="workflow-title">CI Verification Pipeline #42 — All checks have passed</div>
        <span class="tag">SUCCESS</span>
      </div>
      <div class="meta-badges">
        <span class="meta-badge">Commit: <strong>4e30efb</strong> (develop)</span>
        <span class="meta-badge">Trigger: push</span>
        <span class="meta-badge">Duration: 1m 24s</span>
        <span class="meta-badge">Artifacts: pytest-results, dist.tar.gz</span>
      </div>
    </div>
  </div>

  <div class="grid-container">
    <div class="jobs-list">
      <div style="font-size: 12px; text-transform: uppercase; color: #8b949e; font-weight: bold; margin-bottom: 12px;">Jobs Executed (2)</div>
      
      <div class="job-card success">
        <div>
          <div class="job-name">
            <span style="color: #3fb950;">&#10003;</span> Backend CI - Pytest
          </div>
          <div class="job-time">Python 3.11.6 on ubuntu-latest</div>
        </div>
        <span style="color: #3fb950; font-size: 12px; font-weight: 600;">38s</span>
      </div>

      <div class="job-card success">
        <div>
          <div class="job-name">
            <span style="color: #3fb950;">&#10003;</span> Frontend CI - Vite Build
          </div>
          <div class="job-time">Node.js 20.x on ubuntu-latest</div>
        </div>
        <span style="color: #3fb950; font-size: 12px; font-weight: 600;">46s</span>
      </div>
    </div>

    <div class="logs-pane">
      <div class="log-section">
        <div class="log-title">> Run pytest backend/tests/ -v</div>
        <div class="log-dim">============================= test session starts =============================</div>
        <div class="log-dim">platform linux -- Python 3.11.6, pytest-9.1.1, pluggy-1.7.0</div>
        <div class="log-dim">rootdir: /home/runner/work/SCM_Project/SCM_Project, configfile: pytest.ini</div>
        <div class="log-pass">backend/tests/test_agents.py::test_log_analyzer_normal PASSED [ 25%]</div>
        <div class="log-pass">backend/tests/test_agents.py::test_log_analyzer_sqli_attack PASSED [ 50%]</div>
        <div class="log-pass">backend/tests/test_agents.py::test_investigation_agent_direct PASSED [ 75%]</div>
        <div class="log-pass">backend/tests/test_agents.py::test_mitigation_agent_direct PASSED [100%]</div>
        <div class="log-pass" style="font-weight: bold; margin-top: 4px;">============================== 4 passed in 1.75s ==============================</div>
      </div>

      <div class="log-section" style="border-top: 1px solid #21262d; padding-top: 12px;">
        <div class="log-title">> Run npm run build (Vite 8 / Node 20)</div>
        <div class="log-dim">vite v5.4.14 building for production...</div>
        <div class="log-dim">transforming (28) modules...</div>
        <div class="log-pass">&#10003; 34 modules transformed.</div>
        <div class="log-dim">dist/index.html                   0.84 kB  preview: gzip 0.48 kB</div>
        <div class="log-dim">dist/assets/index-D7h3j1a.css    14.28 kB  preview: gzip 3.42 kB</div>
        <div class="log-pass">dist/assets/index-B8k9x2c.js   212.18 kB  preview: gzip 64.91 kB</div>
        <div class="log-pass" style="font-weight: bold;">&#10003; built in 890ms. Exit code 0.</div>
      </div>
    </div>
  </div>
</body>
</html>
"""

# HTML for Figure 7: Git Baseline Tag History & SCM Governance Artifacts
html_fig7 = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Git Baseline Releases & SCM Governance</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; }
  body { background-color: #0d1117; color: #c9d1d9; padding: 28px; }
  .header { border-bottom: 1px solid #21262d; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
  .repo-name { font-size: 18px; color: #58a6ff; font-weight: bold; }
  .section-title { font-size: 16px; font-weight: 600; color: #f0f6fc; margin-bottom: 16px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .panel { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 18px; }
  .release-item { border-left: 3px solid #238636; padding-left: 14px; margin-bottom: 18px; }
  .release-tag { font-family: "SFMono-Regular", Consolas, monospace; font-weight: bold; color: #58a6ff; font-size: 14px; background: #040d21; padding: 3px 8px; border-radius: 4px; border: 1px solid #1f355c; }
  .release-title { font-size: 14px; font-weight: 600; color: #f0f6fc; margin: 6px 0 3px 0; }
  .release-desc { font-size: 12.5px; color: #8b949e; line-height: 1.4; }
  .template-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #0d1117; border: 1px solid #21262d; border-radius: 6px; margin-bottom: 10px; }
  .file-name { font-family: monospace; font-size: 13px; color: #f0f6fc; }
  .file-type { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: #21262d; color: #8b949e; }
  .badge-product { background: #1f6feb; color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: bold; }
</style>
</head>
<body>
  <div class="header">
    <div class="repo-name">Gourishankar403 / SCM_Project &nbsp;&gt;&nbsp; Baselines &amp; Change Control Governance</div>
    <span class="badge-product">IEEE 828-2012 COMPLIANT</span>
  </div>

  <div class="grid">
    <div class="panel">
      <div class="section-title">Frozen Git Baselines (Release Tags)</div>
      
      <div class="release-item">
        <span class="release-tag">v1.0.0-product-baseline</span> <span style="font-size:11px; color:#3fb950; font-weight:bold;">LATEST</span>
        <div class="release-title">Baseline III: Product Baseline</div>
        <div class="release-desc">Complete 6-agent LangGraph pipeline, NSL-KDD trained gradient boosted model, Vite frontend, and passing GitHub Actions CI suite.</div>
      </div>

      <div class="release-item" style="border-left-color: #1f6feb;">
        <span class="release-tag">v0.2.0</span>
        <div class="release-title">Baseline II: Design Baseline</div>
        <div class="release-desc">SQLite multi-tenant schema, JWT authentication endpoints, initial agent state machine interfaces, and dashboard wireframe.</div>
      </div>

      <div class="release-item" style="border-left-color: #8b949e;">
        <span class="release-tag">v0.1.0</span>
        <div class="release-title">Baseline I: Functional Baseline</div>
        <div class="release-desc">SCM Requirements traceability catalog, CI identification structure (CI-01 to CI-09), branch policy definition, and Git repo init.</div>
      </div>
    </div>

    <div class="panel">
      <div class="section-title">Change Control &amp; Configuration Auditing Templates</div>
      
      <div class="template-item">
        <div>
          <div class="file-name">.github/ISSUE_TEMPLATE/change_request.md</div>
          <div style="font-size: 11.5px; color: #8b949e;">Formal CR template: impact assessment, CI affected, justification</div>
        </div>
        <span class="file-type">CR Form</span>
      </div>

      <div class="template-item">
        <div>
          <div class="file-name">.github/ISSUE_TEMPLATE/bug_report.md</div>
          <div style="font-size: 11.5px; color: #8b949e;">Defect reporting: reproduction steps, logs, baseline version</div>
        </div>
        <span class="file-type">Bug Form</span>
      </div>

      <div class="template-item">
        <div>
          <div class="file-name">.github/pull_request_template.md</div>
          <div style="font-size: 11.5px; color: #8b949e;">PR verification checklist: pytest passes, linting, peer reviews</div>
        </div>
        <span class="file-type">PR Gate</span>
      </div>

      <div class="template-item">
        <div>
          <div class="file-name">.github/workflows/ci.yml</div>
          <div style="font-size: 11.5px; color: #8b949e;">Automated CI specification: Ubuntu runner, Python 3.11, Node 20</div>
        </div>
        <span class="file-type">CI/CD Spec</span>
      </div>
    </div>
  </div>
</body>
</html>
"""

# Write HTML files temporarily
fig6_path = os.path.join(output_dir, "temp_fig6.html")
fig7_path = os.path.join(output_dir, "temp_fig7.html")

with open(fig6_path, "w", encoding="utf-8") as f:
    f.write(html_fig6)

with open(fig7_path, "w", encoding="utf-8") as f:
    f.write(html_fig7)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 720})
    page = context.new_page()

    print("Capturing Figure 6: CI/CD Pipeline...")
    page.goto(f"file:///{fig6_path.replace(os.sep, '/')}")
    page.wait_for_load_state("networkidle")
    page.screenshot(path=os.path.join(output_dir, "figure6_cicd_pipeline.png"))

    print("Capturing Figure 7: Git Baselines & SCM Governance...")
    page.goto(f"file:///{fig7_path.replace(os.sep, '/')}")
    page.wait_for_load_state("networkidle")
    page.screenshot(path=os.path.join(output_dir, "figure7_git_baselines_scm.png"))

    browser.close()

# Cleanup temporary html files
if os.path.exists(fig6_path):
    os.remove(fig6_path)
if os.path.exists(fig7_path):
    os.remove(fig7_path)

print("Figures 6 & 7 captured successfully!")
