import os
import json
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import shap
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_curve, auc
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
import xgboost as xgb

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
PLOT_DIR = os.path.join(BASE_DIR, "static", "plots")
MODEL_PATH = os.path.join(MODELS_DIR, "churn_model.joblib")
METRICS_PATH = os.path.join(MODELS_DIR, "metrics.json")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(PLOT_DIR, exist_ok=True)


def generate_dataset(path, rows=1000):
    """Generate a synthetic student churn dataset with 1000 records."""
    rng = np.random.default_rng(42)
    departments = ["CSE", "ECE", "ME", "CE", "MBA", "EEE"]
    genders = ["Male", "Female", "Other"]
    internet = ["Yes", "No"]
    extracurricular = ["Yes", "No"]
    placement = ["Yes", "No"]

    data = {
        "Student_ID": [f"STU{i:03d}" for i in range(1, rows + 1)],
        "Age": rng.integers(17, 25, size=rows),
        "Gender": rng.choice(genders, size=rows),
        "Department": rng.choice(departments, size=rows),
        "Semester": rng.integers(1, 9, size=rows),
        "CGPA": np.clip(rng.normal(7.3, 1.0, rows), 4.0, 10.0),
        "Attendance": np.clip(rng.normal(78.0, 12.0, rows), 40.0, 100.0),
        "Internal_Marks": np.clip(rng.normal(72.0, 12.0, rows), 30.0, 100.0),
        "Assignment_Score": np.clip(rng.normal(72.0, 15.0, rows), 20.0, 100.0),
        "Backlogs": rng.integers(0, 5, size=rows),
        "Study_Hours": np.clip(rng.normal(4.5, 1.6, rows), 1.0, 10.0),
        "Placement_Training": rng.choice(placement, size=rows),
        "Extracurricular": rng.choice(extracurricular, size=rows),
        "Family_Income": rng.integers(15000, 120000, size=rows),
        "Distance_From_College": np.clip(rng.normal(12.0, 8.0, rows), 1.0, 60.0),
        "Internet_Access": rng.choice(internet, size=rows),
        "Engagement_Level": rng.integers(1, 5, size=rows),
    }
    df = pd.DataFrame(data)

    risk_score = (
        ((df["Attendance"] < 75).astype(int) * 1.2)
        + ((df["CGPA"] < 6.5).astype(int) * 1.0)
        + ((df["Backlogs"] > 1).astype(int) * 1.1)
        + ((df["Study_Hours"] < 3).astype(int) * 0.9)
        + ((df["Engagement_Level"] < 3).astype(int) * 0.8)
        + ((df["Internal_Marks"] < 60).astype(int) * 1.0)
        + ((df["Assignment_Score"] < 60).astype(int) * 0.9)
    )
    probability = 1 / (1 + np.exp(-(risk_score - 2.0)))
    df["Dropout"] = (rng.random(rows) < probability).astype(int)

    df.to_csv(path, index=False)
    return df


def ensure_dataset(path):
    """Create the dataset file if it is missing or too small."""
    if not os.path.exists(path) or not os.path.getsize(path):
        return generate_dataset(path, rows=1000)

    df = pd.read_csv(path)
    if len(df) < 1000:
        extra_rows = 1000 - len(df)
        extra = generate_dataset(path, rows=extra_rows)
        df = pd.concat([df, extra], ignore_index=True)
        df.to_csv(path, index=False)
    return df


def preprocess_features(df):
    """Clean, encode and engineer features for model training."""
    df = df.copy()
    df = df.drop_duplicates().reset_index(drop=True)

    target = df["Dropout"].astype(int)
    features = df.drop(columns=["Dropout", "Student_ID"])

    categorical_columns = [col for col in features.columns if features[col].dtype == "object"]
    numeric_columns = [col for col in features.columns if col not in categorical_columns]

    for col in numeric_columns:
        features[col] = pd.to_numeric(features[col], errors="coerce")
        median_value = features[col].median()
        features[col].fillna(median_value, inplace=True)

    for col in categorical_columns:
        features[col] = features[col].fillna("Unknown")

    features["attendance_cgpa_ratio"] = features["Attendance"] / (features["CGPA"] + 1e-6)
    features["study_engagement"] = features["Study_Hours"] * features["Engagement_Level"]
    features["low_performance_index"] = ((features["CGPA"] < 6.0) | (features["Attendance"] < 75)).astype(int)
    features["risk_factor"] = features["Backlogs"] + (features["Attendance"] < 75).astype(int)

    encoded = pd.get_dummies(features, columns=categorical_columns, drop_first=True)
    encoded = encoded.astype(float)
    return encoded, target


def plot_confusion_matrix(y_true, y_pred, path):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(6, 5))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", cbar=False)
    plt.title("Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.tight_layout()
    plt.savefig(path, dpi=150)
    plt.close()


def plot_roc_curve(y_true, y_prob, path):
    fpr, tpr, _ = roc_curve(y_true, y_prob)
    roc_auc = auc(fpr, tpr)
    plt.figure(figsize=(6, 5))
    plt.plot(fpr, tpr, label=f"AUC = {roc_auc:.2f}")
    plt.plot([0, 1], [0, 1], linestyle="--", color="gray")
    plt.title("ROC Curve")
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(path, dpi=150)
    plt.close()


def plot_shap_summary(model, X_test, path):
    try:
        explainer = shap.Explainer(model, X_test)
        shap_values = explainer(X_test)
        shap.summary_plot(shap_values, X_test, plot_type="bar", show=False)
    except Exception:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_test)
        if isinstance(shap_values, list):
            shap_values = shap_values[1]
        shap.summary_plot(shap_values, X_test, plot_type="bar", show=False)
    plt.tight_layout()
    plt.savefig(path, dpi=200)
    plt.close()


def train_models():
    """Train multiple classifiers and save the best one."""
    df = ensure_dataset(DATASET_PATH)
    X, y = preprocess_features(df)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    models = {
        "Logistic Regression": make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000, random_state=42)),
        "Decision Tree": DecisionTreeClassifier(random_state=42, max_depth=6),
        "Random Forest": RandomForestClassifier(n_estimators=220, random_state=42, n_jobs=-1),
        "XGBoost": xgb.XGBClassifier(
            n_estimators=220,
            learning_rate=0.08,
            max_depth=4,
            subsample=0.9,
            colsample_bytree=0.8,
            eval_metric="logloss",
            random_state=42,
        ),
    }

    metrics = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        score = {
            "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
            "precision": round(float(precision_score(y_test, y_pred, zero_division=0)), 4),
            "recall": round(float(recall_score(y_test, y_pred, zero_division=0)), 4),
            "f1": round(float(f1_score(y_test, y_pred, zero_division=0)), 4),
        }
        metrics[name] = score

    best_name = max(metrics, key=lambda n: (metrics[n]["f1"], metrics[n]["accuracy"]))
    best_model = models[best_name]
    best_model.fit(X_train, y_train)
    y_pred = best_model.predict(X_test)
    y_prob = best_model.predict_proba(X_test)[:, 1]

    plot_confusion_matrix(y_test, y_pred, os.path.join(PLOT_DIR, "confusion_matrix.png"))
    plot_roc_curve(y_test, y_prob, os.path.join(PLOT_DIR, "roc_curve.png"))
    plot_shap_summary(best_model, X_test, os.path.join(PLOT_DIR, "shap_summary.png"))

    artifact = {
        "model": best_model,
        "model_name": best_name,
        "feature_columns": X.columns.tolist(),
        "metrics": metrics,
        "best_metrics": metrics[best_name],
    }

    with open(METRICS_PATH, "w", encoding="utf-8") as fh:
        json.dump({"model_name": best_name, "metrics": metrics, "best_metrics": metrics[best_name]}, fh, indent=2)

    joblib.dump(artifact, MODEL_PATH)
    return artifact


def ensure_model_artifacts():
    """Train the model if the artifact is missing."""
    if not os.path.exists(MODEL_PATH):
        return train_models()
    return joblib.load(MODEL_PATH)


if __name__ == "__main__":
    artifact = train_models()
    print("Training completed successfully.")
    print(json.dumps(artifact["best_metrics"], indent=2))
