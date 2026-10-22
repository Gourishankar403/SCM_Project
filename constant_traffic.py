import requests
import random
import time
import threading

API_URL = "http://localhost:8004/analyze/"
DOMAINS = ["techcorp.com", "finserve.com"]

# Use actual URLs from the CSIC dataset so the ML model recognizes them as Healthy (0)
healthy_requests = [
    {"method": "GET", "url": "http://localhost:8080/tienda1/index.jsp HTTP/1.1", "user_agent": "Mozilla/5.0", "payload": ""},
    {"method": "GET", "url": "http://localhost:8080/tienda1/publico/anadir.jsp?id=3&nombre=Vino+Rioja&precio=100&cantidad=55&B1=A%F1adir+al+carrito HTTP/1.1", "user_agent": "Mozilla/5.0", "payload": ""},
    {"method": "POST", "url": "http://localhost:8080/tienda1/publico/anadir.jsp HTTP/1.1", "user_agent": "Mozilla/5.0", "payload": "id=3&nombre=Vino+Rioja&precio=100&cantidad=55&B1=A%F1adir+al+carrito"}
]

# Real attack vectors (the model will flag unknown/suspicious as 1)
attack_requests = [
    {"method": "POST", "url": "http://localhost:8080/tienda1/publico/autenticar.jsp HTTP/1.1", "user_agent": "curl/7.88", "payload": "modo=entrar&login=admin' OR '1'='1&pwd=xyz"},
    {"method": "GET", "url": "http://localhost:8080/tienda1/publico/vaciar.jsp?b2=<script>alert('xss')</script> HTTP/1.1", "user_agent": "Firefox/112", "payload": ""},
    {"method": "GET", "url": "http://localhost:8080/tienda1/../../../../etc/passwd HTTP/1.1", "user_agent": "python-requests", "payload": ""},
]

def send_traffic():
    while True:
        # Vary the load somewhat randomly for a nice graph curve
        num_requests = random.randint(2, 6)
        
        for _ in range(num_requests):
            # 0.5% attacks to make the threats really really tiny
            is_attack = random.random() < 0.005
            req = random.choice(attack_requests) if is_attack else random.choice(healthy_requests)
            domain = random.choice(DOMAINS)
            
            payload = {
                "method": req["method"],
                "url": req["url"],
                "user_agent": req["user_agent"],
                "payload": req["payload"],
                "company_domain": domain
            }
            
            try:
                requests.post(API_URL, json=payload, timeout=2)
            except:
                pass
                
        # Sleep randomly between 1 and 3 seconds
        time.sleep(random.uniform(1.0, 3.0))

print("Starting constant live traffic simulation (95% Healthy)... Press Ctrl+C to stop.")
send_traffic()
