from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import Student
from ..schemas import StudentResponse

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/", response_model=List[StudentResponse])
async def get_students(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    risk_level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get list of students with optional filtering and search."""
    query = db.query(Student)
    
    # Apply search filter
    if search:
        query = query.filter(
            (Student.student_id.ilike(f"%{search}%")) |
            (Student.name.ilike(f"%{search}%"))
        )
    
    # Apply risk level filter
    if risk_level:
        query = query.filter(Student.risk_level == risk_level)
    
    # Apply pagination and ordering
    students = query.order_by(Student.created_at.desc()).offset(skip).limit(limit).all()
    
    return students


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: str, db: Session = Depends(get_db)):
    """Get detailed information for a specific student."""
    student = db.query(Student).filter(Student.student_id == student_id).first()
    
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return student
