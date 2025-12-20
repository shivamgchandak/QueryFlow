from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from .models import Base
from .routers import auth, questions, answers
from .websocket import manager

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hemut QnA Dashboard API",
    version="1.0.0",
    description="Real-time Q&A system with admin moderation"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(questions.router)
app.include_router(answers.router)

@app.websocket("/ws/questions")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except:
        manager.disconnect(websocket)