from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean
from sqlalchemy.sql import func
from .database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    age = Column(Integer)
    gender = Column(String(20))
    gpa = Column(Float)
    attendance = Column(Float)
    assignment_completion = Column(Float)
    exam_performance = Column(Float)
    engagement_score = Column(Float)
    participation_score = Column(Float)
    behavioral_score = Column(Float)
    previous_academic_performance = Column(Float)
    course_satisfaction = Column(Float)
    failed_subjects = Column(Integer)
    assignments_missed = Column(Integer)
    lms_activity = Column(Float)
    risk_level = Column(String(20))
    churn_probability = Column(Float)
    prediction_status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String(50), index=True, nullable=False)
    churn_probability = Column(Float, nullable=False)
    risk_level = Column(String(20), nullable=False)
    model_used = Column(String(50), nullable=False)
    prediction_date = Column(DateTime(timezone=True), server_default=func.now())
    features = Column(Text)  # JSON string of input features
    shap_explanation = Column(Text)  # JSON string of SHAP values
    intervention_recommendations = Column(Text)  # JSON string of recommendations


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    record_count = Column(Integer)
    feature_count = Column(Integer)
    missing_values = Column(Integer)
    target_distribution = Column(Text)  # JSON string
    statistics = Column(Text)  # JSON string of basic statistics
    is_synthetic = Column(Boolean, default=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())


class ModelPerformance(Base):
    __tablename__ = "model_performance"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(50), unique=True, nullable=False)
    accuracy = Column(Float)
    precision = Column(Float)
    recall = Column(Float)
    f1_score = Column(Float)
    roc_auc = Column(Float)
    training_date = Column(DateTime(timezone=True), server_default=func.now())
