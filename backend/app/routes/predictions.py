from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Prediction

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.get("/")
async def get_predictions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get prediction history."""
    predictions = db.query(Prediction).order_by(
        Prediction.prediction_date.desc()
    ).offset(skip).limit(limit).all()
    
    return [
        {
            "id": p.id,
            "student_id": p.student_id,
            "churn_probability": p.churn_probability,
            "risk_level": p.risk_level,
            "model_used": p.model_used,
            "prediction_date": p.prediction_date.isoformat()
        }
        for p in predictions
    ]


@router.get("/student/{student_id}")
async def get_student_predictions(student_id: str, db: Session = Depends(get_db)):
    """Get prediction history for a specific student."""
    predictions = db.query(Prediction).filter(
        Prediction.student_id == student_id
    ).order_by(Prediction.prediction_date.desc()).all()
    
    return [
        {
            "id": p.id,
            "student_id": p.student_id,
            "churn_probability": p.churn_probability,
            "risk_level": p.risk_level,
            "model_used": p.model_used,
            "prediction_date": p.prediction_date.isoformat()
        }
        for p in predictions
    ]
