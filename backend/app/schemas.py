from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime


class StudentCreate(BaseModel):
    student_id: str
    name: str
    age: int = 20
    gender: str = "Male"
    gpa: float = 7.5
    attendance: float = 75.0
    assignment_completion: float = 70.0
    exam_performance: float = 70.0
    engagement_score: float = 3.0
    participation_score: float = 3.0
    behavioral_score: float = 3.0
    previous_academic_performance: float = 7.0
    course_satisfaction: float = 3.0
    failed_subjects: int = 0
    assignments_missed: int = 0
    lms_activity: float = 3.0


class StudentResponse(BaseModel):
    id: int
    student_id: str
    name: str
    age: int
    gender: str
    gpa: float
    attendance: float
    assignment_completion: float
    exam_performance: float
    engagement_score: float
    participation_score: float
    behavioral_score: float
    previous_academic_performance: float
    course_satisfaction: float
    failed_subjects: int
    assignments_missed: int
    lms_activity: float
    risk_level: Optional[str] = None
    churn_probability: Optional[float] = None
    prediction_status: str = "pending"
    created_at: datetime

    class Config:
        from_attributes = True


class PredictionRequest(BaseModel):
    student_id: str
    age: int = 20
    gender: str = "Male"
    gpa: float = 7.5
    attendance: float = 75.0
    assignment_completion: float = 70.0
    exam_performance: float = 70.0
    engagement_score: float = 3.0
    participation_score: float = 3.0
    behavioral_score: float = 3.0
    previous_academic_performance: float = 7.0
    course_satisfaction: float = 3.0
    failed_subjects: int = 0
    assignments_missed: int = 0
    lms_activity: float = 3.0


class PredictionResponse(BaseModel):
    student_id: str
    churn_probability: float
    risk_level: str
    model_used: str
    prediction_date: datetime
    shap_explanation: Dict[str, float]
    intervention_recommendations: List[str]
    top_factors: List[Dict[str, str]]


class DashboardStats(BaseModel):
    total_students: int
    low_risk_students: int
    medium_risk_students: int
    high_risk_students: int
    predicted_dropout_percentage: float
    average_attendance: float
    average_gpa: float
    recent_high_risk_students: List[Dict]


class ModelMetrics(BaseModel):
    model_name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    roc_auc: float


class DatasetStats(BaseModel):
    record_count: int
    feature_count: int
    missing_values: int
    target_distribution: Dict[str, int]
    statistics: Dict[str, Dict[str, float]]
    is_synthetic: bool


class LoginRequest(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
