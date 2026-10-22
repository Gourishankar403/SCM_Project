import time
import os
from playwright.sync_api import sync_playwright

output_dir = r"c:\SCM_Project\docs\screenshots"
os.makedirs(output_dir, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 900})
    page = context.new_page()

    print("1. Capturing Login Portal...")
    page.goto("http://localhost:6076/login")
    page.wait_for_load_state("networkidle")
    time.sleep(1)
    page.screenshot(path=os.path.join(output_dir, "figure5_login_portal.png"))

    print("2. Logging in as Admin...")
    page.fill('input[type="text"]', "admin")
    page.fill('input[type="password"]', "admin123")
    page.click('button[type="submit"]')
    page.wait_for_url("**/dashboard")
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    print("3. Capturing Admin Dashboard (Figure 1)...")
    page.screenshot(path=os.path.join(output_dir, "figure1_admin_dashboard.png"))

    print("4. Capturing Threat Detection & Dispatch Console (Figure 2)...")
    # Click Dispatch Response to trigger real incident
    dispatch_btn = page.query_selector('button:has-text("Dispatch Response")')
    if dispatch_btn:
        dispatch_btn.click()
        time.sleep(2)
    page.screenshot(path=os.path.join(output_dir, "figure2_admin_threat_dispatch.png"))

    print("5. Logging out of Admin and Logging in as TechCorp Client...")
    logout_btn = page.query_selector('button:has-text("Sign Out"), button:has-text("Logout"), button:has-text("Operator Logout")')
    if logout_btn:
        logout_btn.click()
    else:
        page.evaluate("localStorage.clear()")
        page.goto("http://localhost:6076/login")

    page.wait_for_url("**/login")
    page.fill('input[type="text"]', "techcorp_user")
    page.fill('input[type="password"]', "client123")
    page.click('button[type="submit"]')
    page.wait_for_url("**/dashboard")
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    print("6. Capturing TechCorp Flash Alert (Figure 3)...")
    page.screenshot(path=os.path.join(output_dir, "figure3_tenant_flash_alert.png"))

    print("7. Capturing Tenant Permissions (Figure 4)...")
    # Scroll down to permissions
    perm_section = page.query_selector('text=Manage Permissions')
    if perm_section:
        perm_section.scroll_into_view_if_needed()
        time.sleep(1)
    page.screenshot(path=os.path.join(output_dir, "figure4_tenant_permissions.png"))

    browser.close()
    print("Done capturing application screenshots!")
