from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import case, desc

from ..database import SessionLocal
from ..models import Question, Answer
from ..schemas import QuestionCreate
from ..websocket import manager
from ..auth import get_current_admin

router = APIRouter(prefix="/questions", tags=["Questions"])


# -------------------------
# DB Dependency
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# Sorting Logic
# Escalated first, then latest
# -------------------------
def sorted_questions(db: Session):
    return (
        db.query(Question)
        .order_by(
            case(
                (Question.status == "Escalated", 0),
                else_=1
            ),
            desc(Question.created_at)
        )
        .all()
    )


# -------------------------
# Create Question (Guest)
# -------------------------
@router.post("/")
async def create_question(
    q: QuestionCreate,
    db: Session = Depends(get_db)
):
    if not q.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be blank"
        )

    question = Question(
        message=q.message,
        status="Pending"
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    await manager.broadcast([
        {
            "id": x.id,
            "message": x.message,
            "status": x.status,
            "created_at": x.created_at.isoformat()
        }
        for x in sorted_questions(db)
    ])

    return {"message": "Question submitted"}


# -------------------------
# Get Questions
# -------------------------
@router.get("/")
def get_questions(db: Session = Depends(get_db)):
    return sorted_questions(db)


# -------------------------
# Update Status (Admin only)
# -------------------------
@router.put("/{question_id}/status")
async def update_status(
    question_id: int,
    status: str,
    db: Session = Depends(get_db),
    admin: dict = Depends(get_current_admin)
):
    # -------------------------
    # Validate Question
    # -------------------------
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # ❌ Terminal state protection
    if question.status == "Answered":
        raise HTTPException(
            status_code=400,
            detail="Answered questions cannot be modified"
        )

    # -------------------------
    # Validate Status
    # -------------------------
    allowed_statuses = {"Pending", "Escalated", "Answered"}
    new_status = status.capitalize()

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid status value"
        )

    # -------------------------
    # Business Rules
    # -------------------------
    if new_status == "Answered":
        # Must have at least one answer
        answer_count = (
            db.query(Answer)
            .filter(Answer.question_id == question_id)
            .count()
        )

        if answer_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Cannot mark as Answered without answers"
            )

    # -------------------------
    # Apply Status
    # -------------------------
    question.status = new_status
    db.commit()

    await manager.broadcast([
        {
            "id": x.id,
            "message": x.message,
            "status": x.status,
            "created_at": x.created_at.isoformat()
        }
        for x in sorted_questions(db)
    ])

    return {"message": "Status updated successfully"}