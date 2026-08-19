from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict

from ..database import get_db
from ..models import Student, Prediction
from ..schemas import DashboardStats

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics."""
    
    # Total students
    total_students = db.query(Student).count()
    
    # Risk level counts
    low_risk = db.query(Student).filter(Student.risk_level == "Low Risk").count()
    medium_risk = db.query(Student).filter(Student.risk_level == "Medium Risk").count()
    high_risk = db.query(Student).filter(Student.risk_level == "High Risk").count()
    
    # Predicted dropout percentage (high risk students)
    predicted_dropout = (high_risk / total_students * 100) if total_students > 0 else 0
    
    # Average attendance and GPA
    avg_attendance = db.query(func.avg(Student.attendance)).scalar() or 0
    avg_gpa = db.query(func.avg(Student.gpa)).scalar() or 0
    
    # Recent high-risk students (last 10)
    recent_high_risk = db.query(Student).filter(
        Student.risk_level == "High Risk"
    ).order_by(Student.created_at.desc()).limit(10).all()
    
    recent_high_risk_list = [
        {
            "student_id": s.student_id,
            "name": s.name,
            "gpa": s.gpa,
            "attendance": s.attendance,
            "churn_probability": s.churn_probability,
            "risk_level": s.risk_level
        }
        for s in recent_high_risk
    ]
    
    return DashboardStats(
        total_students=total_students,
        low_risk_students=low_risk,
        medium_risk_students=medium_risk,
        high_risk_students=high_risk,
        predicted_dropout_percentage=round(predicted_dropout, 2),
        average_attendance=round(avg_attendance, 2),
        average_gpa=round(avg_gpa, 2),
        recent_high_risk_students=recent_high_risk_list
    )


@router.get("/risk-distribution")
async def get_risk_distribution(db: Session = Depends(get_db)):
    """Get risk level distribution for charts."""
    distribution = db.query(
        Student.risk_level,
        func.count(Student.id).label('count')
    ).group_by(Student.risk_level).all()
    
    return {
        "labels": [item[0] or "Unknown" for item in distribution],
        "data": [item[1] for item in distribution]
    }


@router.get("/attendance-vs-churn")
async def get_attendance_vs_churn(db: Session = Depends(get_db)):
    """Get attendance vs churn data for charts."""
    students = db.query(Student.attendance, Student.churn_probability).all()
    
    return {
        "attendance": [s[0] for s in students],
        "churn_probability": [float(s[1]) if s[1] else 0 for s in students]
    }


@router.get("/gpa-vs-churn")
async def get_gpa_vs_churn(db: Session = Depends(get_db)):
    """Get GPA vs churn data for charts."""
    students = db.query(Student.gpa, Student.churn_probability).all()
    
    return {
        "gpa": [s[0] for s in students],
        "churn_probability": [float(s[1]) if s[1] else 0 for s in students]
    }


@router.get("/engagement-vs-churn")
async def get_engagement_vs_churn(db: Session = Depends(get_db)):
    """Get engagement vs churn data for charts."""
    students = db.query(Student.engagement_score, Student.churn_probability).all()
    
    return {
        "engagement": [s[0] for s in students],
        "churn_probability": [float(s[1]) if s[1] else 0 for s in students]
    }
