from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict
import pandas as pd
import numpy as np
import os

from ..database import get_db
from ..models import Prediction, Student
from ..schemas import PredictionRequest, PredictionResponse
from ..ml import ModelTrainer, SHAPExplainer, DataProcessor

router = APIRouter(prefix="/predict", tags=["prediction"])


@router.post("/", response_model=PredictionResponse)
async def make_prediction(
    request: PredictionRequest,
    db: Session = Depends(get_db)
):
    """Make a churn prediction for a student with SHAP explanation."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    try:
        # Load model and artifacts
        trainer = ModelTrainer(base_dir)
        artifacts = trainer.load_model()
        model = artifacts["best_model"]
        feature_columns = artifacts["feature_columns"]
        
        # Prepare input features
        data_processor = DataProcessor(base_dir)
        
        # Create feature dictionary
        feature_dict = {
            "Age": request.age,
            "Gender": request.gender,
            "GPA": request.gpa,
            "Attendance": request.attendance,
            "Assignment_Completion": request.assignment_completion,
            "Exam_Performance": request.exam_performance,
            "Engagement_Score": request.engagement_score,
            "Participation_Score": request.participation_score,
            "Behavioral_Score": request.behavioral_score,
            "Previous_Academic_Performance": request.previous_academic_performance,
            "Course_Satisfaction": request.course_satisfaction,
            "Failed_Subjects": request.failed_subjects,
            "Assignments_Missed": request.assignments_missed,
            "LMS_Activity": request.lms_activity
        }
        
        # Create DataFrame and apply feature engineering
        df = pd.DataFrame([feature_dict])
        
        # Feature engineering
        df["Attendance_GPA_Ratio"] = df["Attendance"] / (df["GPA"] + 1e-6)
        df["Engagement_Participation"] = df["Engagement_Score"] * df["Participation_Score"]
        df["Low_Performance_Index"] = ((df["GPA"] < 6.0) | (df["Attendance"] < 75)).astype(int)
        df["Risk_Factor"] = df["Failed_Subjects"] + (df["Attendance"] < 75).astype(int)
        df["Assignment_Efficiency"] = df["Assignment_Completion"] / (df["Assignments_Missed"] + 1)
        
        # Encode categorical variables
        categorical_columns = ["Gender"]
        df_encoded = pd.get_dummies(df, columns=categorical_columns, drop_first=True)
        df_encoded = df_encoded.astype(float)
        
        # Align features with training data
        aligned = pd.DataFrame(columns=feature_columns, data=[[0.0] * len(feature_columns)])
        for col in df_encoded.columns:
            if col in aligned.columns:
                aligned[col] = df_encoded[col].values[0]
        
        # Make prediction
        probability = float(model.predict_proba(aligned)[0][1])
        risk_level = trainer.classify_risk(probability)
        
        # Generate SHAP explanation with actual feature values
        explainer = SHAPExplainer(base_dir)
        # Create a mapping of feature columns to their actual values
        feature_value_mapping = {}
        
        # Map original feature values to their corresponding columns
        for col in feature_columns:
            if col in aligned.columns:
                try:
                    feature_value_mapping[col] = float(aligned[col].values[0])
                except (ValueError, TypeError):
                    pass
            
            # Map original feature names to engineered columns
            col_lower = col.lower().replace('_', '')
            for key, value in feature_dict.items():
                key_lower = key.lower().replace('_', '')
                if key_lower in col_lower or col_lower in key_lower:
                    try:
                        feature_value_mapping[col] = float(value)
                    except (ValueError, TypeError):
                        pass
        
        top_factors, shap_values = explainer.generate_explanation(
            model, aligned, feature_columns, feature_value_mapping
        )
        
        # Generate intervention recommendations
        recommendations = explainer.generate_intervention_recommendations(
            feature_dict, risk_level
        )
        
        # Save prediction to database
        prediction = Prediction(
            student_id=request.student_id,
            churn_probability=probability,
            risk_level=risk_level,
            model_used=artifacts["best_model_name"],
            features=str(feature_dict),
            shap_explanation=str(shap_values),
            intervention_recommendations=str(recommendations)
        )
        db.add(prediction)
        
        # Update or create student record
        student = db.query(Student).filter(Student.student_id == request.student_id).first()
        if student:
            student.risk_level = risk_level
            student.churn_probability = probability
            student.prediction_status = "completed"
            # Update student fields
            student.age = request.age
            student.gender = request.gender
            student.gpa = request.gpa
            student.attendance = request.attendance
            student.assignment_completion = request.assignment_completion
            student.exam_performance = request.exam_performance
            student.engagement_score = request.engagement_score
            student.participation_score = request.participation_score
            student.behavioral_score = request.behavioral_score
            student.previous_academic_performance = request.previous_academic_performance
            student.course_satisfaction = request.course_satisfaction
            student.failed_subjects = request.failed_subjects
            student.assignments_missed = request.assignments_missed
            student.lms_activity = request.lms_activity
        else:
            student = Student(
                student_id=request.student_id,
                name=f"Student {request.student_id}",
                age=request.age,
                gender=request.gender,
                gpa=request.gpa,
                attendance=request.attendance,
                assignment_completion=request.assignment_completion,
                exam_performance=request.exam_performance,
                engagement_score=request.engagement_score,
                participation_score=request.participation_score,
                behavioral_score=request.behavioral_score,
                previous_academic_performance=request.previous_academic_performance,
                course_satisfaction=request.course_satisfaction,
                failed_subjects=request.failed_subjects,
                assignments_missed=request.assignments_missed,
                lms_activity=request.lms_activity,
                risk_level=risk_level,
                churn_probability=probability,
                prediction_status="completed"
            )
            db.add(student)
        
        db.commit()
        
        return PredictionResponse(
            student_id=request.student_id,
            churn_probability=probability,
            risk_level=risk_level,
            model_used=artifacts["best_model_name"],
            prediction_date=prediction.prediction_date,
            shap_explanation=shap_values,
            intervention_recommendations=recommendations,
            top_factors=top_factors
        )
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")
