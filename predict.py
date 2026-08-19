import os
import numpy as np
import pandas as pd
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

try:
    import shap
except ImportError:  # pragma: no cover - optional dependency fallback
    shap = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "churn_model.joblib")
PLOT_DIR = os.path.join(BASE_DIR, "static", "plots")
os.makedirs(PLOT_DIR, exist_ok=True)


def load_model_artifact():
    """Load the saved trained model artifact."""
    if not os.path.exists(MODEL_PATH):
        import train_model

        train_model.train_models()
    return joblib.load(MODEL_PATH)


def build_feature_frame(raw_payload):
    """Convert a form payload into the feature structure expected by the trained model."""
    payload = dict(raw_payload)
    data = {
        "Age": float(payload.get("Age", 20)),
        "Gender": payload.get("Gender", "Male"),
        "Department": payload.get("Department", "CSE"),
        "Semester": int(payload.get("Semester", 4)),
        "CGPA": float(payload.get("CGPA", 7.5)),
        "Attendance": float(payload.get("Attendance", 75.0)),
        "Internal_Marks": float(payload.get("Internal_Marks", 70.0)),
        "Assignment_Score": float(payload.get("Assignment_Score", 70.0)),
        "Backlogs": int(payload.get("Backlogs", 0)),
        "Study_Hours": float(payload.get("Study_Hours", 4.0)),
        "Placement_Training": payload.get("Placement_Training", "Yes"),
        "Extracurricular": payload.get("Extracurricular", "No"),
        "Family_Income": float(payload.get("Family_Income", 50000)),
        "Distance_From_College": float(payload.get("Distance_From_College", 10)),
        "Internet_Access": payload.get("Internet_Access", "Yes"),
        "Engagement_Level": int(payload.get("Engagement_Level", 3)),
    }
    frame = pd.DataFrame([data])
    frame["attendance_cgpa_ratio"] = frame["Attendance"] / (frame["CGPA"] + 1e-6)
    frame["study_engagement"] = frame["Study_Hours"] * frame["Engagement_Level"]
    frame["low_performance_index"] = ((frame["CGPA"] < 6.0) | (frame["Attendance"] < 75)).astype(int)
    frame["risk_factor"] = frame["Backlogs"] + (frame["Attendance"] < 75).astype(int)

    categorical_columns = ["Gender", "Department", "Placement_Training", "Extracurricular", "Internet_Access"]
    frame = pd.get_dummies(frame, columns=categorical_columns, drop_first=True)
    frame = frame.astype(float)
    return frame


def align_features(frame, feature_columns):
    """Align the incoming features with the columns used during training."""
    aligned = pd.DataFrame(index=[0], columns=feature_columns, dtype=float)
    aligned.loc[0, :] = 0.0
    for col in frame.columns:
        if col in aligned.columns:
            aligned[col] = frame[col].iloc[0]
    return aligned.fillna(0.0)


def generate_local_explanation(model, sample_frame, feature_columns, output_path):
    """Create a SHAP bar plot and return top contribution values."""
    values = None
    if shap is not None:
        try:
            explainer = shap.Explainer(model, sample_frame)
            shap_values = explainer(sample_frame)
            values = shap_values.values[0]
        except Exception:
            try:
                explainer = shap.TreeExplainer(model)
                shap_values = explainer.shap_values(sample_frame)
                if isinstance(shap_values, list):
                    shap_values = shap_values[1]
                values = shap_values[0]
            except Exception:
                values = None

    if values is None:
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
        elif hasattr(model, "coef_"):
            importances = np.abs(model.coef_[0])
        else:
            importances = np.ones(sample_frame.shape[1])
        values = importances

    feature_names = feature_columns
    contribution = sorted(zip(feature_names, values), key=lambda item: abs(item[1]), reverse=True)[:8]

    plt.figure(figsize=(8, 4.5))
    names = [name for name, _ in contribution]
    scores = [value for _, value in contribution]
    plt.barh(names, scores, color="#1f77b4")
    plt.title("Top SHAP Contributions")
    plt.xlabel("SHAP Value")
    plt.tight_layout()
    plt.savefig(output_path, dpi=150)
    plt.close()
    return contribution


def predict_student(raw_payload):
    """Make a churn prediction and produce an explanation for the student."""
    artifact = load_model_artifact()
    feature_columns = artifact["feature_columns"]
    model = artifact["model"]

    raw_frame = build_feature_frame(raw_payload)
    aligned_frame = align_features(raw_frame, feature_columns)

    probability = float(model.predict_proba(aligned_frame)[0][1])
    label = "High Risk" if probability >= 0.5 else "Low Risk"
    explanation_path = os.path.join(PLOT_DIR, "latest_shap.png")
    contributions = generate_local_explanation(model, aligned_frame, feature_columns, explanation_path)

    recommendation = "Recommend immediate academic support and counseling." if label == "High Risk" else "Continue monitoring and encourage consistent study habits."
    return {
        "label": label,
        "probability": round(probability, 4),
        "recommendation": recommendation,
        "contributions": [
            {"feature": feature, "value": round(float(value), 4)} for feature, value in contributions
        ],
        "plot_path": "/static/plots/latest_shap.png",
    }
