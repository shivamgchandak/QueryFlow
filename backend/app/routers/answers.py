from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..models import Answer, Question
from ..schemas import AnswerCreate

router = APIRouter(prefix="/answers", tags=["Answers"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------------
# Add Answer (Guest/Admin)
# -------------------------
@router.post("/{question_id}")
def add_answer(question_id: int, a: AnswerCreate, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()

    if not question:
        raise HTTPException(404, "Question not found")

    if question.status == "Answered":
        raise HTTPException(
            status_code=400,
            detail="Question is closed. No more answers allowed"
        )

    answer = Answer(
        question_id=question_id,
        message=a.message
    )

    db.add(answer)
    db.commit()

    return {"message": "Answer submitted"}

# -------------------------
# Get Answers
# -------------------------
@router.get("/{question_id}")
def get_answers(question_id: int, db: Session = Depends(get_db)):
    return (
        db.query(Answer)
        .filter(Answer.question_id == question_id)
        .order_by(Answer.created_at.desc())
        .all()
    )