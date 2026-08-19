from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from .routes import (
    predict_router,
    train_router,
    dashboard_router,
    students_router,
    predictions_router,
    models_router
)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Explainable Student Churn Prediction System",
    description="AI-powered system for predicting student dropout risk with SHAP explanations",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:5174", "http://localhost:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict_router)
app.include_router(train_router)
app.include_router(dashboard_router)
app.include_router(students_router)
app.include_router(predictions_router)
app.include_router(models_router)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Explainable Student Churn Prediction System API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/predict/",
            "train": "/train/",
            "upload_dataset": "/train/upload-dataset",
            "dashboard_stats": "/dashboard/stats",
            "students": "/students/",
            "predictions": "/predictions/",
            "model_performance": "/model/performance"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
