import os
import numpy as np
import pandas as pd
import joblib
from typing import Dict, List, Tuple
import json

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False


class SHAPExplainer:
    """Handles SHAP explanations for individual predictions."""
    
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.models_dir = os.path.join(base_dir, "models")
    
    def generate_explanation(
        self,
        model,
        sample: pd.DataFrame,
        feature_columns: List[str]
    ) -> Tuple[List[Dict[str, str]], Dict[str, float]]:
        """Generate SHAP explanation for a single prediction."""
        
        if SHAP_AVAILABLE:
            try:
                # Try to use SHAP explainer
                explainer = shap.Explainer(model, sample)
                shap_values = explainer(sample)
                values = shap_values.values[0]
            except Exception:
                try:
                    # Fallback to TreeExplainer for tree-based models
                    explainer = shap.TreeExplainer(model)
                    shap_values = explainer.shap_values(sample)
                    if isinstance(shap_values, list):
                        shap_values = shap_values[1]
                    values = shap_values[0]
                except Exception:
                    # Final fallback to feature importance
                    values = self._get_feature_importance(model, sample)
        else:
            values = self._get_feature_importance(model, sample)
        
        # Create human-readable explanations
        explanations = []
        feature_importance = {}
        
        for i, (name, value) in enumerate(zip(feature_columns, values)):
            # Handle numpy arrays and scalars
            if isinstance(value, np.ndarray):
                if value.size == 1:
                    value = float(value.item())
                else:
                    value = float(np.mean(value))
            elif isinstance(value, (np.integer, np.floating)):
                value = float(value)
            else:
                value = float(value)
            
            feature_importance[name] = value
            
            # Create human-readable explanation
            direction = "increases" if value > 0 else "decreases"
            magnitude = abs(value)
            
            if magnitude > 0.1:  # Only include significant factors
                explanations.append({
                    "feature": self._format_feature_name(name),
                    "value": f"{direction} risk",
                    "impact": f"{magnitude:.3f}"
                })
        
        # Sort by impact
        explanations.sort(key=lambda x: abs(float(x["impact"])), reverse=True)
        
        # Return top 5 factors
        top_factors = explanations[:5]
        
        return top_factors, feature_importance
    
    def _get_feature_importance(self, model, sample: pd.DataFrame) -> np.ndarray:
        """Fallback: Get feature importance from model."""
        if hasattr(model, 'feature_importances_'):
            return model.feature_importances_
        elif hasattr(model, 'coef_'):
            return np.abs(model.coef_[0])
        else:
            return np.ones(sample.shape[1])
    
    def _format_feature_name(self, name: str) -> str:
        """Format feature names for human readability."""
        # Replace underscores with spaces and capitalize
        formatted = name.replace('_', ' ')
        # Handle encoded categorical features
        if '_' in formatted and any(word in formatted for word in ['Male', 'Female', 'Yes', 'No']):
            parts = formatted.split()
            if len(parts) > 1:
                formatted = ' '.join(parts[:-1]) + f" ({parts[-1]})"
        return formatted.title()
    
    def generate_intervention_recommendations(
        self,
        features: Dict[str, float],
        risk_level: str
    ) -> List[str]:
        """Generate intervention recommendations based on risk factors."""
        recommendations = []
        
        # Attendance-based recommendations
        if features.get('Attendance', 75) < 75:
            recommendations.append(
                "Consider attendance follow-up and identify barriers affecting participation."
            )
        
        # GPA-based recommendations
        if features.get('GPA', 7.5) < 6.5:
            recommendations.append(
                "Consider additional academic support or tutoring."
            )
        
        # Engagement-based recommendations
        if features.get('Engagement_Score', 3) < 3:
            recommendations.append(
                "Consider contacting the student and encouraging participation in learning activities."
            )
        
        # Assignment-based recommendations
        if features.get('Assignment_Completion', 70) < 60:
            recommendations.append(
                "Consider assignment support and progress monitoring."
            )
        
        # Failed subjects recommendations
        if features.get('Failed_Subjects', 0) > 1:
            recommendations.append(
                "Consider academic counseling and subject-specific support."
            )
        
        # LMS activity recommendations
        if features.get('LMS_Activity', 3) < 3:
            recommendations.append(
                "Consider digital literacy support and encourage online engagement."
            )
        
        # Risk-specific recommendations
        if risk_level == "High Risk":
            recommendations.append(
                "Schedule immediate intervention meeting with academic advisor."
            )
            recommendations.append(
                "Consider personalized academic success plan."
            )
        elif risk_level == "Medium Risk":
            recommendations.append(
                "Monitor progress closely and schedule regular check-ins."
            )
        
        # Remove duplicates while preserving order
        seen = set()
        unique_recommendations = []
        for rec in recommendations:
            if rec not in seen:
                seen.add(rec)
                unique_recommendations.append(rec)
        
        return unique_recommendations
