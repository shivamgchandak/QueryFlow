import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

logger = logging.getLogger("uvicorn.error")

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # Render (and most managed Postgres providers) hand out `postgres://`
    # URLs, but SQLAlchemy 1.4+ requires the `postgresql://` scheme.
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)
    logger.warning("Using Postgres database (DATABASE_URL is set)")
else:
    # Local dev fallback: an ephemeral SQLite file. Production should
    # always set DATABASE_URL to a real Postgres instance so data
    # survives redeploys/restarts.
    DB_PATH = Path(__file__).resolve().parent.parent / "qna.db"
    engine = create_engine(
        f"sqlite:///{DB_PATH}", connect_args={"check_same_thread": False}
    )
    logger.warning(
        "DATABASE_URL is not set — using ephemeral SQLite at %s. "
        "Data will NOT survive a redeploy/restart on Render's free tier.",
        DB_PATH,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()