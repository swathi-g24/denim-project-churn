import os
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any
import json


class DataProcessor:
    """Handles data preprocessing, synthetic dataset generation, and feature engineering."""
    
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.data_dir = os.path.join(base_dir, "data")
        os.makedirs(self.data_dir, exist_ok=True)
    
    def generate_synthetic_dataset(self, rows: int = 1000) -> pd.DataFrame:
        """Generate a synthetic student churn dataset for demonstration."""
        np.random.seed(42)
        rng = np.random.default_rng(42)
        
        departments = ["CSE", "ECE", "ME", "CE", "MBA", "EEE"]
        genders = ["Male", "Female", "Other"]
        
        data = {
            "Student_ID": [f"STU{i:04d}" for i in range(1, rows + 1)],
            "Age": rng.integers(17, 25, size=rows),
            "Gender": rng.choice(genders, size=rows),
            "GPA": np.clip(rng.normal(7.3, 1.0, rows), 4.0, 10.0),
            "Attendance": np.clip(rng.normal(78.0, 12.0, rows), 40.0, 100.0),
            "Assignment_Completion": np.clip(rng.normal(72.0, 15.0, rows), 20.0, 100.0),
            "Exam_Performance": np.clip(rng.normal(72.0, 12.0, rows), 30.0, 100.0),
            "Engagement_Score": rng.integers(1, 5, size=rows),
            "Participation_Score": rng.integers(1, 5, size=rows),
            "Behavioral_Score": rng.integers(1, 5, size=rows),
            "Previous_Academic_Performance": np.clip(rng.normal(7.0, 1.2, rows), 4.0, 10.0),
            "Course_Satisfaction": rng.integers(1, 5, size=rows),
            "Failed_Subjects": rng.integers(0, 5, size=rows),
            "Assignments_Missed": rng.integers(0, 10, size=rows),
            "LMS_Activity": rng.integers(1, 5, size=rows),
        }
        
        df = pd.DataFrame(data)
        
        # Calculate risk score based on multiple factors
        risk_score = (
            ((df["Attendance"] < 75).astype(int) * 1.2) +
            ((df["GPA"] < 6.5).astype(int) * 1.0) +
            ((df["Failed_Subjects"] > 1).astype(int) * 1.1) +
            ((df["Engagement_Score"] < 3).astype(int) * 0.8) +
            ((df["Assignment_Completion"] < 60).astype(int) * 0.9) +
            ((df["LMS_Activity"] < 3).astype(int) * 0.7) +
            ((df["Behavioral_Score"] < 3).astype(int) * 0.6)
        )
        
        # Convert risk score to probability using sigmoid
        probability = 1 / (1 + np.exp(-(risk_score - 2.0)))
        df["Churn"] = (rng.random(rows) < probability).astype(int)
        
        return df
    
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """Clean, encode, and engineer features for model training."""
        df = df.copy()
        
        # Remove duplicates
        df = df.drop_duplicates().reset_index(drop=True)
        
        # Separate target
        if "Churn" in df.columns:
            target = df["Churn"].astype(int)
            features = df.drop(columns=["Churn", "Student_ID"])
        else:
            raise ValueError("Dataset must contain 'Churn' column")
        
        # Handle missing values
        numeric_columns = features.select_dtypes(include=[np.number]).columns
        categorical_columns = features.select_dtypes(include=['object']).columns
        
        for col in numeric_columns:
            features[col] = pd.to_numeric(features[col], errors='coerce')
            median_value = features[col].median()
            features[col].fillna(median_value, inplace=True)
        
        for col in categorical_columns:
            features[col].fillna("Unknown", inplace=True)
        
        # Feature engineering
        features["Attendance_GPA_Ratio"] = features["Attendance"] / (features["GPA"] + 1e-6)
        features["Engagement_Participation"] = features["Engagement_Score"] * features["Participation_Score"]
        features["Low_Performance_Index"] = ((features["GPA"] < 6.0) | (features["Attendance"] < 75)).astype(int)
        features["Risk_Factor"] = features["Failed_Subjects"] + (features["Attendance"] < 75).astype(int)
        features["Assignment_Efficiency"] = features["Assignment_Completion"] / (features["Assignments_Missed"] + 1)
        
        # Encode categorical variables
        encoded = pd.get_dummies(features, columns=categorical_columns, drop_first=True)
        encoded = encoded.astype(float)
        
        return encoded, target
    
    def get_dataset_statistics(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate and return dataset statistics."""
        stats = {
            "record_count": len(df),
            "feature_count": len(df.columns) - 1,  # Exclude target
            "missing_values": df.isnull().sum().sum(),
            "target_distribution": {
                "churn": int(df["Churn"].sum()),
                "not_churn": int(len(df) - df["Churn"].sum())
            },
            "statistics": {}
        }
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if col != "Churn":
                stats["statistics"][col] = {
                    "mean": float(df[col].mean()),
                    "std": float(df[col].std()),
                    "min": float(df[col].min()),
                    "max": float(df[col].max()),
                    "median": float(df[col].median())
                }
        
        return stats
