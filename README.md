# Explainable Student Churn Prediction System

An AI-powered full-stack web application that predicts student dropout risk with SHAP (Shapley Additive Explanations) to provide interpretable insights for educators.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Problem Statement](#problem-statement)
- [Proposed Solution](#proposed-solution)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [ML Algorithms](#ml-algorithms)
- [SHAP Explanation](#shap-explanation)
- [Dataset Format](#dataset-format)
- [Installation](#installation)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [How to Train the Model](#how-to-train-the-model)
- [How to Run the Application](#how-to-run-the-application)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)

## 🎯 Project Overview

This system helps educators identify students at risk of dropping out by analyzing academic, attendance, behavioral, and engagement data. The key differentiator is **explainability** - every prediction includes SHAP-based explanations showing exactly why a student is considered at risk.

## 📊 Problem Statement

Student dropout is a significant challenge in educational institutions. Traditional methods of identifying at-risk students are often reactive and lack explainability. Educators need:

1. **Early identification** of at-risk students
2. **Understandable explanations** of why a student is at risk
3. **Actionable recommendations** for intervention
4. **Data-driven decisions** based on multiple factors

## 💡 Proposed Solution

A comprehensive ML-powered system that:

- **Predicts** churn probability using multiple ML algorithms
- **Explains** predictions using SHAP values
- **Classifies** students into Low/Medium/High risk categories
- **Recommends** specific interventions based on risk factors
- **Tracks** prediction history over time
- **Visualizes** data through interactive dashboards

## ✨ Features

### Dashboard
- Total students overview
- Risk level distribution (Low/Medium/High)
- Predicted dropout percentage
- Average attendance and GPA
- Interactive charts (Risk distribution, Attendance vs Churn, GPA vs Churn, Engagement vs Churn)
- Recent high-risk students list

### Student Management
- Complete student list with search and filtering
- Sort by various attributes
- Detailed student profiles with all metrics
- Risk badges and churn probabilities
- Prediction history per student

### Prediction System
- Comprehensive prediction form with 15+ features
- Real-time ML model predictions
- SHAP-based explanations of predictions
- Top 5 risk factors with impact scores
- Automated intervention recommendations
- Risk classification with configurable thresholds

### Model Performance
- Comparison of 4 ML algorithms (Logistic Regression, Decision Tree, Random Forest, XGBoost)
- Metrics: Accuracy, Precision, Recall, F1-Score, ROC-AUC
- Visual comparison charts
- Model descriptions and use cases

### Dataset Management
- CSV dataset upload with validation
- Synthetic dataset generator for demonstration
- Dataset statistics and quality checks
- Required column validation

### Prediction History
- Complete log of all predictions
- Filter by student
- Model used for each prediction
- Timestamp tracking

## 🏗️ Architecture

```
┌─────────────────┐
│   React Frontend │
│   (Vite + Tailwind)│
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│   FastAPI Backend │
│   (Python)       │
└────────┬────────┘
         │
    ┌────┴────┐
    ↓         ↓
┌──────┐  ┌─────────┐
│SQLite│  │ ML Pipeline│
│ DB   │  │ (scikit-learn│
└──────┘  │ XGBoost SHAP)│
          └───────────┘
```

### Data Flow

```
Student Dataset → Data Collection → Data Preprocessing → Feature Engineering 
→ Train/Test Split → Multiple ML Models → Model Evaluation → Best Model Selection 
→ SHAP Explainability → Prediction Engine → Risk Classification → Dashboard 
→ Teacher Intervention
```

## 🛠️ Technology Stack

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Axios** - HTTP client

### Backend
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - ORM
- **SQLite** - Database (development)
- **Pydantic** - Data validation

### Machine Learning
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing
- **Scikit-learn** - ML algorithms
- **XGBoost** - Gradient boosting
- **SHAP** - Model explainability
- **Joblib** - Model serialization

## 🤖 ML Algorithms

### 1. Logistic Regression
- **Purpose**: Interpretable baseline model
- **Strengths**: Clear coefficients, easy to interpret
- **Use Case**: Understanding linear relationships

### 2. Decision Tree
- **Purpose**: Decision rules and stability
- **Strengths**: Clear decision paths, handles non-linear relationships
- **Use Case**: Creating interpretable rules

### 3. Random Forest
- **Purpose**: Ensemble method for stability
- **Strengths**: Reduces overfitting, robust predictions
- **Use Case**: Improved accuracy over single trees

### 4. XGBoost
- **Purpose**: High-performance gradient boosting
- **Strengths**: Handles complex patterns, state-of-the-art performance
- **Use Case**: Best overall accuracy

**Model Selection**: The system automatically selects the best model based on F1-score, prioritizing correct identification of at-risk students.

## 🔍 SHAP Explanation

SHAP (Shapley Additive Explanations) provides game-theoretic explanations of individual predictions:

### How It Works
- Calculates contribution of each feature to the prediction
- Shows positive/negative impact on churn probability
- Ranks features by importance for each student

### Example Output
```
Risk: HIGH
Probability: 78%

Main contributing factors:
1. Attendance: 58% — increases risk
2. GPA: 5.4 — increases risk
3. Assignment completion: 48% — increases risk
4. Engagement: Low — increases risk
5. Failed subjects: 3 — increases risk
```

## 📁 Dataset Format

### Required Columns

```csv
Student_ID,Age,Gender,GPA,Attendance,Assignment_Completion,Exam_Performance,
Engagement_Score,Participation_Score,Behavioral_Score,Previous_Academic_Performance,
Course_Satisfaction,Failed_Subjects,Assignments_Missed,LMS_Activity,Churn
```

### Column Descriptions

- **Student_ID**: Unique identifier (string)
- **Age**: Student age (integer, 17-30)
- **Gender**: Male/Female/Other (string)
- **GPA**: Grade Point Average (float, 0-10)
- **Attendance**: Attendance percentage (float, 0-100)
- **Assignment_Completion**: Assignment completion rate (float, 0-100)
- **Exam_Performance**: Exam scores (float, 0-100)
- **Engagement_Score**: Engagement level (integer, 1-5)
- **Participation_Score**: Participation level (integer, 1-5)
- **Behavioral_Score**: Behavior score (integer, 1-5)
- **Previous_Academic_Performance**: Past academic record (float, 0-10)
- **Course_Satisfaction**: Satisfaction rating (integer, 1-5)
- **Failed_Subjects**: Number of failed subjects (integer)
- **Assignments_Missed**: Number of missed assignments (integer)
- **LMS_Activity**: Learning management system activity (integer, 1-5)
- **Churn**: Target variable (integer, 0 or 1)

## 🚀 Installation

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Installation

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Installation

```powershell
cd frontend
npm install
```

## ⚙️ Backend Setup

1. **Navigate to backend directory**
   ```powershell
   cd backend
   ```

2. **Activate virtual environment**
   ```powershell
   venv\Scripts\activate
   ```

3. **Install dependencies**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Start the FastAPI server**
   ```powershell
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## 🎨 Frontend Setup

1. **Navigate to frontend directory**
   ```powershell
   cd frontend
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Start the development server**
   ```powershell
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 🎓 How to Train the Model

### Option 1: Via Web Interface

1. Login to the application
2. Navigate to **Dataset** page
3. Click **"Train Models with Synthetic Data"**
4. Wait for training to complete
5. View results on **Model Performance** page

### Option 2: Via API

```bash
curl -X POST http://localhost:8000/train/
```

### Option 3: Upload Custom Dataset

1. Prepare CSV with required columns
2. Navigate to **Dataset** page
3. Upload the CSV file
4. Click **"Train Models with Synthetic Data"** (uses uploaded data)

## 🏃 How to Run the Application

### Quick Start (Two Terminals)

**Terminal 1 - Backend:**
```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Access the Application

1. Open browser: `http://localhost:5173`
2. Login with demo credentials:
   - Username: `admin`
   - Password: `password`

### First Steps

1. **Train the model**: Go to Dataset page and click "Train Models with Synthetic Data"
2. **View dashboard**: Explore the dashboard with sample data
3. **Make predictions**: Use the Predict page to analyze students
4. **View performance**: Check Model Performance page for metrics

## 📚 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### Authentication
- `GET /` - API information
- `GET /health` - Health check

#### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/risk-distribution` - Risk level distribution
- `GET /dashboard/attendance-vs-churn` - Attendance vs churn data
- `GET /dashboard/gpa-vs-churn` - GPA vs churn data
- `GET /dashboard/engagement-vs-churn` - Engagement vs churn data

#### Students
- `GET /students/` - List all students
- `GET /students/{student_id}` - Get student details

#### Predictions
- `POST /predict/` - Make a prediction
- `GET /predictions/` - Get prediction history
- `GET /predictions/student/{student_id}` - Get student predictions

#### Training
- `POST /train/` - Train models with synthetic data
- `POST /train/upload-dataset` - Upload custom dataset

#### Models
- `GET /model/performance` - Get model performance metrics

### Example Prediction Request

```json
{
  "student_id": "STU0001",
  "age": 20,
  "gender": "Male",
  "gpa": 7.5,
  "attendance": 75.0,
  "assignment_completion": 70.0,
  "exam_performance": 70.0,
  "engagement_score": 3.0,
  "participation_score": 3.0,
  "behavioral_score": 3.0,
  "previous_academic_performance": 7.0,
  "course_satisfaction": 3.0,
  "failed_subjects": 0,
  "assignments_missed": 0,
  "lms_activity": 3.0
}
```

### Example Prediction Response

```json
{
  "student_id": "STU0001",
  "churn_probability": 0.78,
  "risk_level": "High Risk",
  "model_used": "XGBoost",
  "prediction_date": "2024-01-15T10:30:00",
  "shap_explanation": {
    "Attendance": 0.15,
    "GPA": 0.12,
    "Engagement_Score": 0.08
  },
  "intervention_recommendations": [
    "Consider attendance follow-up and identify barriers affecting participation.",
    "Consider additional academic support or tutoring."
  ],
  "top_factors": [
    {
      "feature": "Attendance",
      "value": "increases risk",
      "impact": "0.150"
    }
  ]
}
```

## 📸 Screenshots

### Dashboard
- Overview of student statistics
- Risk distribution charts
- Recent high-risk students

### Prediction Form
- Comprehensive student data input
- Real-time prediction results
- SHAP explanation visualization

### Student Details
- Complete student profile
- Academic performance metrics
- Engagement indicators
- Prediction history

### Model Performance
- Comparison chart of all models
- Detailed metrics table
- Model descriptions

## 🔮 Future Enhancements

- [ ] Real-time data integration with LMS
- [ ] Email notifications for high-risk students
- [ ] Advanced analytics and trend analysis
- [ ] Multi-institution support
- [ ] Mobile application
- [ ] Export reports to PDF
- [ ] Custom risk threshold configuration
- [ ] Additional ML algorithms (Neural Networks, SVM)
- [ ] Time-series analysis for trend prediction
- [ ] Collaborative filtering for peer recommendations

## 📄 License

This project is for educational and demonstration purposes.

## 👥 Contributors

Built as an academic project for student churn prediction and explainable AI research.

## 📞 Support

For issues or questions, please refer to the API documentation or check the error messages in the application logs.
