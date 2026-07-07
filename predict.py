import pandas as pd
import joblib
import json
import shap
import warnings

# Suppress sklearn/joblib warnings during inference
warnings.filterwarnings("ignore")

# Define the exact required fields based on training
REQUIRED_FIELDS = [
    "title", "company_profile", "description", "requirements", "benefits",
    "telecommuting", "has_company_logo", "has_questions",
    "employment_type", "required_experience", "required_education",
    "industry", "function", "location"
]

# Global cache for loaded artifacts
_MODEL_PIPELINE = None
_SHAP_EXPLAINER = None
_FEATURE_NAMES = None

def _load_artifacts():
    global _MODEL_PIPELINE, _SHAP_EXPLAINER, _FEATURE_NAMES
    if _MODEL_PIPELINE is None:
        _MODEL_PIPELINE = joblib.load("model_pipeline.pkl")
    if _SHAP_EXPLAINER is None:
        _SHAP_EXPLAINER = joblib.load("shap_explainer.pkl")
    if _FEATURE_NAMES is None:
        with open("feature_names.json", "r") as f:
            _FEATURE_NAMES = json.load(f)

def combine_text(X):
    # Needed in scope for the pipeline's FunctionTransformer to deserialize correctly
    return (
        X["title"] + " " +
        X["company_profile"] + " " +
        X["description"] + " " +
        X["requirements"] + " " +
        X["benefits"]
    )

def predict_fraud(job_posting: dict) -> dict:
    """
    Predicts if a job posting is fraudulent using the loaded XGBoost pipeline.
    Also returns top SHAP explainers for the decision.
    """
    _load_artifacts()
    
    # 1. Validation
    missing_fields = [f for f in REQUIRED_FIELDS if f not in job_posting]
    if missing_fields:
        return {"error": f"Missing required fields: {missing_fields}"}
    
    # Convert single posting to DataFrame for sklearn
    df = pd.DataFrame([job_posting])
    
    # Pre-clean inputs just like training
    text_cols = ["title", "company_profile", "description", "requirements", "benefits"]
    for col in text_cols:
        df[col] = df[col].fillna("").astype(str)
        
    binary_cols = ["telecommuting", "has_company_logo", "has_questions"]
    for col in binary_cols:
        df[col] = df[col].fillna(0).astype(int)
        
    cat_cols = ["employment_type", "required_experience", "required_education", "industry", "function", "location"]
    for col in cat_cols:
        df[col] = df[col].fillna("Missing").astype(str)
        
    # 2. Prediction
    prob = float(_MODEL_PIPELINE.predict_proba(df)[0, 1])
    is_fraud = bool(_MODEL_PIPELINE.predict(df)[0])
    
    # 3. SHAP Explainability
    fitted_prep = _MODEL_PIPELINE.named_steps['prep']
    transformed_data = fitted_prep.transform(df)
    
    # Get SHAP values for this instance
    shap_vals = _SHAP_EXPLAINER.shap_values(transformed_data)[0]
    
    # Pair SHAP values with feature names
    feature_impacts = list(zip(_FEATURE_NAMES, shap_vals))
    
    # Sort by absolute impact (largest effect on the prediction, whether positive or negative)
    feature_impacts.sort(key=lambda x: abs(x[1]), reverse=True)
    
    # Top 5 features pushing the score
    top_5 = [{"feature": f[0], "shap_value": float(f[1])} for f in feature_impacts[:5]]
    
    return {
        "fraud_probability": prob,
        "prediction": "fraud" if is_fraud else "real",
        "top_features": top_5
    }

if __name__ == "__main__":
    print("Running Sanity Checks on predict_fraud()...\n")
    
    # Load 3 samples directly from the raw csv to guarantee fidelity
    full_df = pd.read_csv("fake_job_postings.csv")
    full_df = full_df.fillna("")  # Avoid passing actual NaN floats to dict
    
    # Sample 1: A known legitimate job (Index 0)
    real_sample = full_df.iloc[0][REQUIRED_FIELDS].to_dict()
    
    # Sample 2: A known fraud job (Index 98 is fraudulent in the dataset)
    fraud_df = full_df[full_df["fraudulent"] == 1]
    fraud_sample = fraud_df.iloc[0][REQUIRED_FIELDS].to_dict()
    
    # Sample 3: Another fraud job (Index 144) to test variability
    borderline_sample = fraud_df.iloc[5][REQUIRED_FIELDS].to_dict()

    print("--- SAMPLE 1 (True Real) ---")
    res1 = predict_fraud(real_sample)
    print(json.dumps(res1, indent=2))
    
    print("\n--- SAMPLE 2 (True Fraud) ---")
    res2 = predict_fraud(fraud_sample)
    print(json.dumps(res2, indent=2))
    
    print("\n--- SAMPLE 3 (True Fraud - Variation) ---")
    res3 = predict_fraud(borderline_sample)
    print(json.dumps(res3, indent=2))
