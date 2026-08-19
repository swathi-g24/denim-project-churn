from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict

from ..database import get_db
from ..models import ModelPerformance
from ..ml import ModelTrainer
import os

router = APIRouter(prefix="/model", tags=["models"])


@router.get("/performance")
async def get_model_performance(db: Session = Depends(get_db)):
    """Get model performance metrics for all trained models."""
    models = db.query(ModelPerformance).all()
    
    if not models:
        # Try to load from file
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        try:
            trainer = ModelTrainer(base_dir)
            metrics = trainer.get_model_metrics()
            return metrics
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail="No model performance data found")
    
    return {
        model.model_name: {
            "accuracy": model.accuracy,
            "precision": model.precision,
            "recall": model.recall,
            "f1_score": model.f1_score,
            "roc_auc": model.roc_auc
        }
        for model in models
    }
