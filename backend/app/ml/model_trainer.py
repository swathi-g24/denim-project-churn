import os
import json
import numpy as np
import pandas as pd
import joblib
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
import xgboost as xgb

from .data_processor import DataProcessor


class ModelTrainer:
    """Handles ML model training, evaluation, and selection."""
    
    # Risk classification thresholds (configurable)
    RISK_THRESHOLDS = {
        "low": (0.0, 0.39),
        "medium": (0.40, 0.69),
        "high": (0.70, 1.0)
    }
    
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.models_dir = os.path.join(base_dir, "models")
        self.data_processor = DataProcessor(base_dir)
        os.makedirs(self.models_dir, exist_ok=True)
    
    def classify_risk(self, probability: float) -> str:
        """Classify student risk level based on probability threshold."""
        if probability >= self.RISK_THRESHOLDS["high"][0]:
            return "High Risk"
        elif probability >= self.RISK_THRESHOLDS["medium"][0]:
            return "Medium Risk"
        else:
            return "Low Risk"
    
    def train_models(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Train multiple ML models and select the best one."""
        X, y = self.data_processor.preprocess_data(df)
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.25, random_state=42, stratify=y
        )
        
        # Define models
        models = {
            "Logistic Regression": make_pipeline(
                StandardScaler(),
                LogisticRegression(max_iter=2000, random_state=42)
            ),
            "Decision Tree": DecisionTreeClassifier(
                random_state=42, max_depth=6, min_samples_split=10
            ),
            "Random Forest": RandomForestClassifier(
                n_estimators=200, random_state=42, n_jobs=-1, max_depth=10
            ),
            "XGBoost": xgb.XGBClassifier(
                n_estimators=200,
                learning_rate=0.08,
                max_depth=4,
                subsample=0.9,
                colsample_bytree=0.8,
                eval_metric="logloss",
                random_state=42,
                n_jobs=-1
            )
        }
        
        # Train and evaluate each model
        metrics = {}
        trained_models = {}
        
        for name, model in models.items():
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            y_prob = model.predict_proba(X_test)[:, 1]
            
            model_metrics = {
                "accuracy": float(accuracy_score(y_test, y_pred)),
                "precision": float(precision_score(y_test, y_pred, zero_division=0)),
                "recall": float(recall_score(y_test, y_pred, zero_division=0)),
                "f1_score": float(f1_score(y_test, y_pred, zero_division=0)),
                "roc_auc": float(roc_auc_score(y_test, y_prob))
            }
            
            metrics[name] = model_metrics
            trained_models[name] = model
        
        # Select best model based on F1-score (important for identifying at-risk students)
        best_model_name = max(metrics, key=lambda n: metrics[n]["f1_score"])
        best_model = trained_models[best_model_name]
        
        # Save all models and artifacts
        artifacts = {
            "best_model": best_model,
            "best_model_name": best_model_name,
            "all_models": trained_models,
            "feature_columns": X.columns.tolist(),
            "metrics": metrics,
            "scaler": StandardScaler().fit(X_train)
        }
        
        # Save individual models
        for name, model in trained_models.items():
            model_path = os.path.join(self.models_dir, f"{name.lower().replace(' ', '_')}.pkl")
            joblib.dump(model, model_path)
        
        # Save scaler
        scaler_path = os.path.join(self.models_dir, "scaler.pkl")
        joblib.dump(artifacts["scaler"], scaler_path)
        
        # Save best model with metadata
        best_model_path = os.path.join(self.models_dir, "best_model.pkl")
        joblib.dump(artifacts, best_model_path)
        
        # Save metrics
        metrics_path = os.path.join(self.models_dir, "metrics.json")
        with open(metrics_path, 'w') as f:
            json.dump(metrics, f, indent=2)
        
        return {
            "best_model": best_model_name,
            "metrics": metrics,
            "feature_columns": X.columns.tolist()
        }
    
    def load_model(self) -> Dict[str, Any]:
        """Load the trained model and artifacts."""
        model_path = os.path.join(self.models_dir, "best_model.pkl")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError("Model not found. Please train the model first.")
        
        return joblib.load(model_path)
    
    def get_model_metrics(self) -> Dict[str, Dict[str, float]]:
        """Load and return model performance metrics."""
        metrics_path = os.path.join(self.models_dir, "metrics.json")
        
        if not os.path.exists(metrics_path):
            raise FileNotFoundError("Metrics not found. Please train the model first.")
        
        with open(metrics_path, 'r') as f:
            return json.load(f)
