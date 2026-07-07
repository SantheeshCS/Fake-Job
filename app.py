from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import re

def combine_text(X):
    return (
        X["title"].astype(str) + " " +
        X["company_profile"].astype(str) + " " +
        X["description"].astype(str) + " " +
        X["requirements"].astype(str) + " " +
        X["benefits"].astype(str)
    )

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Make sure to load the model properly (this must be available)
try:
    model = joblib.load("model_pipeline.pkl")
except Exception as e:
    print(f"Warning: Model could not be loaded: {e}")
    model = None

def cyber_rules(data):
    score = 100
    reasons = []
    text = " ".join(str(v) for v in data.values()).lower()

    if re.search(r"(pay|fee|deposit|upi|registration|money)", text):
        score -= 25
        reasons.append("Payment related words detected")

    if re.search(r"(gmail|yahoo|outlook|hotmail)", data.get("email", "").lower()):
        score -= 20
        reasons.append("Public email domain used")

    if re.search(r"\.(xyz|tk|top|cf|gq)", data.get("website", "").lower()):
        score -= 15
        reasons.append("Suspicious website domain")

    if data.get("contact", "").lower() in ["whatsapp", "telegram"]:
        score -= 15
        reasons.append("Unofficial contact method used")

    try:
        salary = int(data.get("salary", "0"))
        if salary > 1000000:
            score -= 15
            reasons.append("Unrealistic high salary")
    except:
        pass

    if re.search(r"(no interview|guaranteed|instant)", text):
        score -= 20
        reasons.append("No interview / guaranteed job")

    score = max(score, 0)

    if score >= 80:
        risk = "LOW RISK"
    elif score >= 40:
        risk = "MEDIUM RISK"
    else:
        risk = "HIGH RISK"

    return score, risk, reasons


@app.route("/api/detect", methods=["POST"])
def detect():
    if not model:
        return jsonify({"error": "Model not loaded"}), 500

    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Features expected by model_pipeline.pkl
        feature_data = {
            "title": data.get("title", ""),
            "company_profile": data.get("company", ""),
            "description": data.get("description", ""),
            "requirements": "",
            "benefits": "",
            "telecommuting": int(data.get("telecommuting", 0)),
            "has_company_logo": int(data.get("has_company_logo", 0)),
            "has_questions": int(data.get("has_questions", 0)),
            "employment_type": "Missing",
            "required_experience": "Missing",
            "required_education": "Missing",
            "industry": "Missing",
            "function": "Missing",
            "location": "Missing"
        }

        df = pd.DataFrame([feature_data])
        ai_pred = model.predict(df)[0]
        ai_conf = max(model.predict_proba(df)[0]) * 100

        trust, risk, reasons = cyber_rules(data)
        
        result_msg = ""
        if ai_pred == 1:
            result_msg = f"⚠️ Fake Job Detected ({risk}) | AI Confidence: {ai_conf:.2f}%"
        else:
            result_msg = f"✅ Legitimate Job ({risk}) | AI Confidence: {ai_conf:.2f}%"

        return jsonify({
            "is_fake": int(ai_pred),
            "confidence": float(ai_conf),
            "trust_score": trust,
            "risk_level": risk,
            "reasons": reasons,
            "result_message": result_msg
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
