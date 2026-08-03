import os
import sqlite3
from datetime import datetime
from flask import Flask, flash, redirect, render_template, request, session, url_for
from predict import predict_student

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "student_churn.db")

app = Flask(__name__)
app.secret_key = "change-this-secret-key"


def init_db():
    """Create the SQLite database and tables when the app starts."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            probability REAL NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def save_prediction(student_id, risk_level, probability):
    """Log each prediction into the SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO predictions (student_id, risk_level, probability, created_at) VALUES (?, ?, ?, ?)",
        (student_id, risk_level, probability, datetime.now().isoformat()),
    )
    conn.commit()
    conn.close()


@app.before_request
def require_login():
    """Protect routes so the user must log in to access the dashboard."""
    allowed_routes = {"login", "static"}
    if request.endpoint in allowed_routes:
        return None
    if request.path.startswith("/static"):
        return None
    if not session.get("logged_in") and request.endpoint not in {"login", "index"}:
        return redirect(url_for("login"))


@app.route("/")
def index():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    """Authenticate the user using a simple demo login form."""
    if request.method == "POST":
        username = request.form.get("username", "")
        password = request.form.get("password", "")
        if username == "admin" and password == "password":
            session["logged_in"] = True
            session["username"] = username
            flash("Login successful.", "success")
            return redirect(url_for("dashboard"))
        flash("Invalid credentials. Use admin / password.", "danger")
    return render_template("login.html")


@app.route("/logout")
def logout():
    """Clear the session and log the user out."""
    session.clear()
    return redirect(url_for("login"))


@app.route("/dashboard")
def dashboard():
    """Display key metrics and charts on the dashboard."""
    conn = sqlite3.connect(DB_PATH)
    prediction_count = conn.execute("SELECT COUNT(*) FROM predictions").fetchone()[0]
    conn.close()
    return render_template("dashboard.html", prediction_count=prediction_count)


@app.route("/predict", methods=["GET", "POST"])
def predict():
    """Render the prediction form and handle the prediction request."""
    if request.method == "POST":
        student_id = request.form.get("Student_ID", "STU001")
        result = predict_student(request.form)
        save_prediction(student_id, result["label"], result["probability"])
        session["latest_prediction"] = {
            "student_id": student_id,
            "label": result["label"],
            "probability": result["probability"],
            "recommendation": result["recommendation"],
            "contributions": result["contributions"],
        }
        return render_template("result.html", result=result, student_id=student_id)
    return render_template("predict.html")


@app.route("/shap")
def shap_view():
    """Display the latest SHAP explanation for the last predicted student."""
    latest = session.get("latest_prediction")
    if not latest:
        return redirect(url_for("predict"))
    return render_template("shap.html", latest=latest)


if __name__ == "__main__":
    init_db()
    app.run(debug=True, host="0.0.0.0", port=5000)
