from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..database import SessionLocal
from ..models import User
from ..schemas import UserCreate, UserLogin
from ..auth import hash_password, verify_password, create_access_token, get_current_admin

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -------------------------
# Registration guard
# Registering the very first admin (empty users table) is open so a
# fresh clone can bootstrap itself. Once any admin exists, creating
# another one requires a valid admin token.
# -------------------------
def require_admin_or_bootstrap(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if db.query(User).count() == 0:
        return None
    return get_current_admin(authorization)


# -------------------------
# Register Admin
# -------------------------
@router.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_admin_or_bootstrap)
):
    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password),
        role="admin"
    )

    try:
        db.add(new_user)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Admin with this username or email already exists"
        )

    return {"message": "Admin registered successfully"}


# -------------------------
# Login Admin
# -------------------------
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user or not verify_password(
        user.password, db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(
        {"sub": db_user.email, "role": db_user.role}
    )

    return {"access_token": token}