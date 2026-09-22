import os
import pickle
from langgraph.graph import StateGraph, END
from typing import TypedDict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load ML Models
MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'model.pkl')
VECTORIZER_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'vectorizer.pkl')

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(VECTORIZER_PATH, 'rb') as f:
        vectorizer = pickle.load(f)
except Exception as e:
    logger.warning("ML models not found. Predictions will default to false.")
    model, vectorizer = None, None

class RequestState(TypedDict):
    method: str
    url: str
    user_agent: str
    payload: str
    combined_text: str
    is_attack: bool
    confidence: float

def parse_request(state: RequestState):
    # Combine features just like in training
    method = state.get("method", "") or ""
    url = state.get("url", "") or ""
    payload = state.get("payload", "") or ""
    combined_text = f"{method} {url} {payload}"
    return {"combined_text": combined_text}

def predict_threat(state: RequestState):
    if not model or not vectorizer:
        return {"is_attack": False, "confidence": 0.0}
    
    combined_text = state.get("combined_text", "")
    try:
        vec = vectorizer.transform([combined_text])
        prediction = model.predict(vec)[0]
        # In Random Forest we can also get probability
        proba = model.predict_proba(vec)[0]
        confidence = float(max(proba))
        
        is_attack = True if prediction == 1 else False
        return {"is_attack": is_attack, "confidence": confidence}
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return {"is_attack": False, "confidence": 0.0}

# Define LangGraph
workflow = StateGraph(RequestState)
workflow.add_node("parse", parse_request)
workflow.add_node("predict", predict_threat)

workflow.set_entry_point("parse")
workflow.add_edge("parse", "predict")
workflow.add_edge("predict", END)

threat_analyzer = workflow.compile()
