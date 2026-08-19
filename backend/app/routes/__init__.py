from .predict import router as predict_router
from .train import router as train_router
from .dashboard import router as dashboard_router
from .students import router as students_router
from .predictions import router as predictions_router
from .models import router as models_router

__all__ = [
    'predict_router',
    'train_router',
    'dashboard_router',
    'students_router',
    'predictions_router',
    'models_router'
]
