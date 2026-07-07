# Fake Job Posting Detection

This project provides an AI-powered system to detect fraudulent or fake job postings. It combines a trained Machine Learning model (XGBoost) and a heuristic rule-based engine to evaluate job descriptions, returning a risk assessment and explainable AI insights.

## Project Structure

- **`train.py`**: The model training pipeline. It loads data from `fake_job_postings.csv`, processes text data using TF-IDF, handles categorical data with One-Hot Encoding, and trains an `XGBClassifier`. It evaluates the model and saves the trained pipeline (`model_pipeline.pkl`), feature names (`feature_names.json`), and a SHAP explainer (`shap_explainer.pkl`) for interpretability.
- **`predict.py`**: A standalone inference module. It loads the serialized artifacts and provides a `predict_fraud()` function that evaluates a single job posting dictionary. It utilizes SHAP values to explain the top 5 features driving the model's decision.
- **`app.py`**: A Flask web application providing RESTful API endpoints. 
  - `POST /api/detect`: Takes a JSON payload of job details, runs the AI model prediction, and applies a rule-based engine (`cyber_rules`) to check for common scam indicators (e.g., suspicious emails, unrealistic salary, payment requests). Returns a comprehensive JSON response with the final verdict, confidence, trust score, and risk reasons.
  - `GET /api/health`: A simple health check endpoint.
- **`requirements.txt`**: The python dependencies for the project.

## Setup & Installation

1. **Clone the repository and navigate to the project directory**
2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Ensure the dataset exists:**
   Place `fake_job_postings.csv` in the root directory.

## Usage

### 1. Training the Model
To train the AI model from scratch and generate the required `.pkl` and `.json` artifacts, run:
```bash
python train.py
```
This will train the XGBoost classifier and generate `model_pipeline.pkl`, `shap_explainer.pkl`, and `feature_names.json`.

### 2. Testing Inference Locally
You can run the prediction script to perform sanity checks on known legitimate and fraudulent samples:
```bash
python predict.py
```

### 3. Running the API Server
To start the Flask backend API server, run:
```bash
python app.py
```
The server will start at `http://127.0.0.1:5000/`.

**API Endpoint: `/api/detect` (POST)**

**Sample Request Body:**
```json
{
  "title": "Data Entry Clerk",
  "company": "Tech Solutions",
  "description": "Easy work from home. High salary.",
  "telecommuting": 1,
  "has_company_logo": 0,
  "has_questions": 0,
  "email": "hr@gmail.com",
  "salary": "1500000"
}
```

**Sample Response:**
```json
{
  "is_fake": 1,
  "confidence": 92.5,
  "trust_score": 65,
  "risk_level": "MEDIUM RISK",
  "reasons": [
    "Public email domain used",
    "Unrealistic high salary"
  ],
  "result_message": "⚠️ Fake Job Detected (MEDIUM RISK) | AI Confidence: 92.50%"
}
```

## How It Works

1. **AI Model (XGBoost):** Analyzes text features (title, description, requirements) and categorical/binary features to predict the likelihood of fraud based on historical data.
2. **SHAP Explainer:** Provides interpretability by showing exactly which features contributed the most to the AI's prediction.
3. **Rule-Based Engine:** Applies practical heuristic rules (e.g., checking for public email domains like `@gmail.com`, checking for upfront payment requests) to provide an immediate "Trust Score" and readable reasons for the risk level.
