# Explainable Student Churn Prediction

This project builds a Flask web application that predicts whether a student is at risk of dropping out and explains the prediction using SHAP. It includes a login page, dashboard, prediction form, result page, SHAP explanation page, training pipeline, SQLite logging, and responsive Bootstrap UI.

## Project Structure

- app.py: Flask web application and routes
- train_model.py: Dataset generation, preprocessing, model training, evaluation, and plotting
- predict.py: Prediction logic and SHAP explanation generation
- templates/: HTML templates
- static/: CSS, JavaScript, and generated charts
- models/: Saved model artifacts and metrics
- dataset.csv: Synthetic student dataset

## How to Run on Windows

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python train_model.py
python app.py
```

Open http://127.0.0.1:5000 in your browser.

## Default Login

- Username: admin
- Password: password
"# student-churn-prediction" 
