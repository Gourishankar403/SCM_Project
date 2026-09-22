import pickle
import os

# Load models once
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.pkl")
VEC_PATH = os.path.join(BASE_DIR, "models", "vectorizer.pkl")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(VEC_PATH, "rb") as f:
    vectorizer = pickle.load(f)

def analyze_log(state: dict) -> dict:
    """
    Log Analysis Module: Parses and normalizes network/system logs for anomaly detection.
    """
    method = state.get("method", "") or ""
    url = state.get("url", "") or ""
    payload = state.get("payload", "") or ""
    
    combined_text = f"{method} {url} {payload}"
    
    vec_input = vectorizer.transform([combined_text])
    prediction = model.predict(vec_input)[0]
    
    state["is_attack"] = bool(prediction == 1)
    state["log_analysis_complete"] = True
    return state
