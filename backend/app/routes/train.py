from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
import os
from typing import Dict, List

from ..database import get_db
from ..models import Dataset, ModelPerformance, Student
from ..schemas import DatasetStats
from ..ml import ModelTrainer, DataProcessor


def convert_numpy_types(obj):
    """Convert numpy types to native Python types for JSON serialization."""
    if isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {key: convert_numpy_types(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_numpy_types(item) for item in obj]
    return obj

router = APIRouter(prefix="/train", tags=["training"])


@router.post("/")
async def train_model(db: Session = Depends(get_db)):
    """Train ML models using synthetic dataset."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    try:
        # Generate synthetic dataset
        data_processor = DataProcessor(base_dir)
        df = data_processor.generate_synthetic_dataset(rows=1000)
        
        # Save dataset
        dataset_path = os.path.join(base_dir, "data", "dataset.csv")
        df.to_csv(dataset_path, index=False)
        
        # Get dataset statistics
        stats = data_processor.get_dataset_statistics(df)
        
        # Save dataset info to database
        dataset = Dataset(
            filename="synthetic_dataset.csv",
            record_count=stats["record_count"],
            feature_count=stats["feature_count"],
            missing_values=stats["missing_values"],
            target_distribution=str(stats["target_distribution"]),
            statistics=str(stats["statistics"]),
            is_synthetic=True
        )
        db.add(dataset)
        
        # Train models
        trainer = ModelTrainer(base_dir)
        result = trainer.train_models(df)
        
        # Save model performance to database
        for model_name, metrics in result["metrics"].items():
            existing = db.query(ModelPerformance).filter(
                ModelPerformance.model_name == model_name
            ).first()
            
            if existing:
                existing.accuracy = metrics["accuracy"]
                existing.precision = metrics["precision"]
                existing.recall = metrics["recall"]
                existing.f1_score = metrics["f1_score"]
                existing.roc_auc = metrics["roc_auc"]
            else:
                model_perf = ModelPerformance(
                    model_name=model_name,
                    accuracy=metrics["accuracy"],
                    precision=metrics["precision"],
                    recall=metrics["recall"],
                    f1_score=metrics["f1_score"],
                    roc_auc=metrics["roc_auc"]
                )
                db.add(model_perf)
        
        db.commit()
        
        return convert_numpy_types({
            "status": "success",
            "best_model": result["best_model"],
            "metrics": result["metrics"],
            "dataset_stats": stats
        })
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Training error: {str(e)}")


@router.post("/upload-dataset")
async def upload_dataset(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    """Upload multiple CSV datasets for training (supports multiple batches)."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    data_dir = os.path.join(base_dir, "data")
    os.makedirs(data_dir, exist_ok=True)
    
    try:
        # Process all uploaded files
        all_dataframes = []
        total_students_loaded = 0
        errors = []
        
        for file in files:
            try:
                # Read uploaded file
                contents = await file.read()
                
                # Save file
                safe_name = os.path.basename((file.filename or "dataset.csv").replace("\\", "/"))
                upload_path = os.path.join(data_dir, safe_name)
                with open(upload_path, "wb") as f:
                    f.write(contents)
                
                # Load and validate dataset
                df = pd.read_csv(upload_path)
                
                # Create column mapping to handle different naming conventions
                column_mapping = {}
                for col in df.columns:
                    col_lower = col.lower().replace('_', '').replace(' ', '').replace('-', '')
                    
                    # Map various column name formats to standard names
                    if 'studentid' in col_lower or ('student' in col_lower and 'id' in col_lower):
                        column_mapping[col] = 'Student_ID'
                    elif 'age' in col_lower and 'student' not in col_lower:
                        column_mapping[col] = 'Age'
                    elif 'gender' in col_lower:
                        column_mapping[col] = 'Gender'
                    elif 'gpa' in col_lower:
                        column_mapping[col] = 'GPA'
                    elif 'attendance' in col_lower:
                        column_mapping[col] = 'Attendance'
                    elif 'assignmentcompletion' in col_lower or ('assignment' in col_lower and 'completion' in col_lower):
                        column_mapping[col] = 'Assignment_Completion'
                    elif 'examperformance' in col_lower or ('exam' in col_lower and 'performance' in col_lower):
                        column_mapping[col] = 'Exam_Performance'
                    elif 'engagement' in col_lower and 'score' not in col_lower:
                        column_mapping[col] = 'Engagement_Score'
                    elif 'engagementscore' in col_lower or ('engagement' in col_lower and 'score' in col_lower):
                        column_mapping[col] = 'Engagement_Score'
                    elif 'participation' in col_lower:
                        column_mapping[col] = 'Participation_Score'
                    elif 'behavioral' in col_lower:
                        column_mapping[col] = 'Behavioral_Score'
                    elif 'previousacademicperformance' in col_lower or ('previous' in col_lower and 'academic' in col_lower):
                        column_mapping[col] = 'Previous_Academic_Performance'
                    elif 'coursesatisfaction' in col_lower or ('course' in col_lower and 'satisfaction' in col_lower):
                        column_mapping[col] = 'Course_Satisfaction'
                    elif 'failedsubjects' in col_lower or ('failed' in col_lower and 'subject' in col_lower):
                        column_mapping[col] = 'Failed_Subjects'
                    elif 'assignmentsmissed' in col_lower or ('assignment' in col_lower and 'missed' in col_lower):
                        column_mapping[col] = 'Assignments_Missed'
                    elif 'lmsactivity' in col_lower or ('lms' in col_lower and 'activity' in col_lower):
                        column_mapping[col] = 'LMS_Activity'
                    elif 'lms' in col_lower:
                        column_mapping[col] = 'LMS_Activity'
                    elif 'churn' in col_lower:
                        column_mapping[col] = 'Churn'
                
                # Rename columns if mapping exists
                if column_mapping:
                    df = df.rename(columns=column_mapping)
                
                # Remove duplicate columns (keep first occurrence)
                df = df.loc[:, ~df.columns.duplicated()]
                
                # Validate required columns (make some optional with defaults)
                required_columns = [
                    "Student_ID", "Age", "Gender", "GPA", "Attendance",
                    "Assignment_Completion", "Exam_Performance",
                    "Participation_Score", "Behavioral_Score", "Previous_Academic_Performance",
                    "Course_Satisfaction", "Failed_Subjects", "Assignments_Missed",
                    "LMS_Activity", "Churn"
                ]
                
                optional_columns = {
                    "Engagement_Score": 3.0  # Default value if missing
                }
                
                missing_cols = [col for col in required_columns if col not in df.columns]
                if missing_cols:
                    errors.append(f"{file.filename}: Missing columns {missing_cols}")
                    continue
                
                # Add optional columns with defaults if missing
                for col, default_val in optional_columns.items():
                    if col not in df.columns:
                        df[col] = default_val
                
                # Add batch identifier to track which file the student came from
                df['batch_source'] = file.filename
                
                all_dataframes.append(df)
                
            except Exception as e:
                errors.append(f"{file.filename}: {str(e)}")
                continue
        
        if not all_dataframes:
            raise HTTPException(
                status_code=400,
                detail=f"No valid datasets uploaded. Errors: {errors}"
            )
        
        # Combine all dataframes
        combined_df = pd.concat(all_dataframes, ignore_index=True)
        
        # Get statistics
        data_processor = DataProcessor(base_dir)
        stats = data_processor.get_dataset_statistics(combined_df)
        
        # Clear existing students
        db.query(Student).delete()
        
        # Load students into database with error handling
        students_loaded = 0
        for idx, row in combined_df.iterrows():
            try:
                student = Student(
                    student_id=str(row["Student_ID"]),
                    name=f"Student {row['Student_ID']}",
                    age=int(row["Age"]),
                    gender=str(row["Gender"]),
                    gpa=float(row["GPA"]),
                    attendance=float(row["Attendance"]),
                    assignment_completion=float(row["Assignment_Completion"]),
                    exam_performance=float(row["Exam_Performance"]),
                    engagement_score=float(row["Engagement_Score"]),
                    participation_score=float(row["Participation_Score"]),
                    behavioral_score=float(row["Behavioral_Score"]),
                    previous_academic_performance=float(row["Previous_Academic_Performance"]),
                    course_satisfaction=float(row["Course_Satisfaction"]),
                    failed_subjects=int(row["Failed_Subjects"]),
                    assignments_missed=int(row["Assignments_Missed"]),
                    lms_activity=float(row["LMS_Activity"]),
                    risk_level="Not Predicted",
                    churn_probability=0.0,
                    prediction_status="pending"
                )
                db.add(student)
                students_loaded += 1
            except Exception as e:
                errors.append(f"Row {idx}: {str(e)}")
                continue
        
        if errors:
            print(f"Errors loading students: {errors[:5]}")  # Log first 5 errors
        
        # Save dataset info
        dataset = Dataset(
            filename=f"{len(files)} files uploaded",
            record_count=students_loaded,
            feature_count=stats["feature_count"],
            missing_values=stats["missing_values"],
            target_distribution=str(stats["target_distribution"]),
            statistics=str(stats["statistics"]),
            is_synthetic=False
        )
        db.add(dataset)
        db.commit()
        
        return convert_numpy_types({
            "record_count": students_loaded,
            "feature_count": stats["feature_count"],
            "missing_values": stats["missing_values"],
            "target_distribution": stats["target_distribution"],
            "statistics": stats["statistics"],
            "is_synthetic": False,
            "message": f"Successfully loaded {students_loaded} students from {len(files)} file(s)",
            "files_processed": [file.filename for file in files],
            "errors": errors[:10] if errors else None
        })
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")


@router.post("/batch-predict")
async def batch_predict(db: Session = Depends(get_db)):
    """Make predictions for all students in the database."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    try:
        # Load model and artifacts
        trainer = ModelTrainer(base_dir)
        artifacts = trainer.load_model()
        model = artifacts["best_model"]
        feature_columns = artifacts["feature_columns"]
        
        # Get all students
        students = db.query(Student).all()
        
        if not students:
            raise HTTPException(status_code=400, detail="No students found in database")
        
        # Prepare data for batch prediction
        data_processor = DataProcessor(base_dir)
        predictions_data = []
        
        for student in students:
            # Create feature dictionary
            feature_dict = {
                "Age": student.age,
                "Gender": student.gender,
                "GPA": student.gpa,
                "Attendance": student.attendance,
                "Assignment_Completion": student.assignment_completion,
                "Exam_Performance": student.exam_performance,
                "Engagement_Score": student.engagement_score,
                "Participation_Score": student.participation_score,
                "Behavioral_Score": student.behavioral_score,
                "Previous_Academic_Performance": student.previous_academic_performance,
                "Course_Satisfaction": student.course_satisfaction,
                "Failed_Subjects": student.failed_subjects,
                "Assignments_Missed": student.assignments_missed,
                "LMS_Activity": student.lms_activity
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
            
            # Update student
            student.risk_level = risk_level
            student.churn_probability = probability
            student.prediction_status = "completed"
            
            predictions_data.append({
                "student_id": student.student_id,
                "churn_probability": probability,
                "risk_level": risk_level
            })
        
        db.commit()
        
        return {
            "status": "success",
            "total_predictions": len(predictions_data),
            "predictions": predictions_data
        }
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")
