import requests
import random
import time

API_URL = "http://localhost:8002/analyze/"
DOMAINS = ["techcorp.com", "finserve.com"]

healthy_requests = [
    {"method": "GET", "url": "/index.html", "user_agent": "Mozilla/5.0", "payload": ""},
    {"method": "GET", "url": "/about", "user_agent": "Chrome/114.0", "payload": ""},
    {"method": "GET", "url": "/contact", "user_agent": "Safari/537.36", "payload": ""},
    {"method": "POST", "url": "/login", "user_agent": "Chrome", "payload": "username=john&password=doe"},
    {"method": "GET", "url": "/api/v1/health", "user_agent": "InternalMonitor", "payload": ""},
    {"method": "GET", "url": "/assets/style.css", "user_agent": "Firefox/112", "payload": ""},
    {"method": "GET", "url": "/assets/main.js", "user_agent": "Firefox/112", "payload": ""},
]

attack_requests = [
    {"method": "POST", "url": "/login", "user_agent": "curl/7.88", "payload": "username=admin' OR '1'='1&password=xyz"},
    {"method": "GET", "url": "/search?q=<script>alert('xss')</script>", "user_agent": "Firefox/112", "payload": ""},
    {"method": "GET", "url": "/../../../../etc/passwd", "user_agent": "python-requests/2.31.0", "payload": ""},
    {"method": "POST", "url": "/api/upload", "user_agent": "PostmanRuntime/7.32", "payload": "<?php system($_GET['cmd']); ?>"},
]

print("Simulating high-volume realistic traffic...")

# Generate 80 requests
for i in range(80):
    # 90% chance of being healthy
    is_attack = random.random() < 0.10
    
    if is_attack:
        req = random.choice(attack_requests)
    else:
        req = random.choice(healthy_requests)
        
    domain = random.choice(DOMAINS)
    
    payload = {
        "method": req["method"],
        "url": req["url"],
        "user_agent": req["user_agent"],
        "payload": req["payload"],
        "company_domain": domain
    }
    
    try:
        resp = requests.post(API_URL, json=payload)
    except Exception as e:
        print("Error connecting to backend", e)
        break

print("Traffic simulation complete!")
