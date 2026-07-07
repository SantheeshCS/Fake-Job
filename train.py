import pandas as pd
import json
import joblib
import shap
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, average_precision_score
from sklearn.feature_extraction.text import TfidfVectorizer
from xgboost import XGBClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder
from sklearn.compose import ColumnTransformer

def combine_text(X):
    return (
        X["title"] + " " +
        X["company_profile"] + " " +
        X["description"] + " " +
        X["requirements"] + " " +
        X["benefits"]
    )

def main():
    print("1. Loading and cleaning data...")
    df = pd.read_csv("fake_job_postings.csv")
    
    columns_to_keep = [
        "title", "company_profile", "description", "requirements", "benefits",
        "telecommuting", "has_company_logo", "has_questions",
        "employment_type", "required_experience", "required_education",
        "industry", "function", "location", "fraudulent"
    ]
    df = df[columns_to_keep].copy()
    df.rename(columns={"fraudulent": "label"}, inplace=True)
    
    text_cols = ["title", "company_profile", "description", "requirements", "benefits"]
    for col in text_cols:
        df[col] = df[col].fillna("").astype(str)
        
    binary_cols = ["telecommuting", "has_company_logo", "has_questions"]
    for col in binary_cols:
        df[col] = df[col].fillna(0).astype(int)
        
    cat_cols = ["employment_type", "required_experience", "required_education", "industry", "function", "location"]
    for col in cat_cols:
        df[col] = df[col].fillna("Missing").astype(str)
        
    print("2. Building Pipeline...")
    text_pipeline = Pipeline([
        ("combine", FunctionTransformer(combine_text, validate=False)),
        ("tfidf", TfidfVectorizer(stop_words="english", max_features=5000, ngram_range=(1,2)))
    ])
    
    preprocess = ColumnTransformer([
        ("text", text_pipeline, text_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols),
        ("num", "passthrough", binary_cols)
    ])
    
    X = df.drop("label", axis=1)
    y = df["label"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)
    
    model_pipeline = Pipeline([
        ("prep", preprocess),
        ("clf", XGBClassifier(scale_pos_weight=pos_weight, random_state=42, n_jobs=-1, eval_metric="logloss"))
    ])
    
    print("3. Training Model...")
    model_pipeline.fit(X_train, y_train)
    
    print("4. Evaluating Model...")
    y_pred = model_pipeline.predict(X_test)
    y_proba = model_pipeline.predict_proba(X_test)[:, 1]
    
    acc = accuracy_score(y_test, y_pred)
    pr_auc = average_precision_score(y_test, y_proba)
    print("\n--- Original Model Evaluation ---")
    print(f"Accuracy: {acc:.4f}")
    print(f"PR-AUC:   {pr_auc:.4f}")
    print("\nConfusion Matrix:\n", confusion_matrix(y_test, y_pred))
    print("\nClassification Report:\n", classification_report(y_test, y_pred))
    
    print("5. Saving model and features...")
    joblib.dump(model_pipeline, "model_pipeline.pkl")
    
    fitted_prep = model_pipeline.named_steps['prep']
    tfidf = fitted_prep.transformers_[0][1].named_steps['tfidf']
    text_feature_names = tfidf.get_feature_names_out()
    
    ohe = fitted_prep.transformers_[1][1]
    cat_feature_names = ohe.get_feature_names_out(cat_cols)
    
    feature_names = list(text_feature_names) + list(cat_feature_names) + binary_cols
    
    with open("feature_names.json", "w") as f:
        json.dump(feature_names, f)
        
    print("6. Training SHAP explainer...")
    # Transform training data to use as background for SHAP
    X_train_transformed = fitted_prep.transform(X_train)
    clf = model_pipeline.named_steps['clf']
    
    # XGBClassifier with TreeExplainer
    explainer = shap.TreeExplainer(clf)
    joblib.dump(explainer, "shap_explainer.pkl")
    
    print("7. Verifying Persistence...")
    reloaded_pipeline = joblib.load("model_pipeline.pkl")
    y_pred_reloaded = reloaded_pipeline.predict(X_test)
    
    if (y_pred == y_pred_reloaded).all():
        print("-> SUCCESS: Reloaded model predictions perfectly match in-memory model.")
    else:
        print("-> ERROR: Mismatch between original and reloaded model predictions!")
        
if __name__ == "__main__":
    main()
