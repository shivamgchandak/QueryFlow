from pydantic import BaseModel, Field
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class QuestionCreate(BaseModel):
    message: str = Field(..., min_length=1)

class AnswerCreate(BaseModel):
    message: str = Field(..., min_length=1)

class QuestionResponse(BaseModel):
    id: int
    message: str
    status: str
    created_at: datetime

    class Config:
        orm_mode = True