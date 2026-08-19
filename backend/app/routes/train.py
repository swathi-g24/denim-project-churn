from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
import numpy as np
import os
from typing import Dict

from ..database import get_db
from ..models import Dataset, ModelPerformance
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
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a CSV dataset for training."""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    try:
        # Read uploaded file
        contents = await file.read()
        
        # Save file
        upload_path = os.path.join(base_dir, "data", file.filename)
        with open(upload_path, "wb") as f:
            f.write(contents)
        
        # Load and validate dataset
        df = pd.read_csv(upload_path)
        
        # Validate required columns
        required_columns = [
            "Student_ID", "Age", "Gender", "GPA", "Attendance",
            "Assignment_Completion", "Exam_Performance", "Engagement_Score",
            "Participation_Score", "Behavioral_Score", "Previous_Academic_Performance",
            "Course_Satisfaction", "Failed_Subjects", "Assignments_Missed",
            "LMS_Activity", "Churn"
        ]
        
        missing_cols = [col for col in required_columns if col not in df.columns]
        if missing_cols:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing_cols}"
            )
        
        # Get statistics
        data_processor = DataProcessor(base_dir)
        stats = data_processor.get_dataset_statistics(df)
        
        # Save dataset info
        dataset = Dataset(
            filename=file.filename,
            record_count=stats["record_count"],
            feature_count=stats["feature_count"],
            missing_values=stats["missing_values"],
            target_distribution=str(stats["target_distribution"]),
            statistics=str(stats["statistics"]),
            is_synthetic=False
        )
        db.add(dataset)
        db.commit()
        
        return DatasetStats(
            record_count=stats["record_count"],
            feature_count=stats["feature_count"],
            missing_values=stats["missing_values"],
            target_distribution=stats["target_distribution"],
            statistics=stats["statistics"],
            is_synthetic=False
        )
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Upload error: {str(e)}")
