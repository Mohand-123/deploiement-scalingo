from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session
import nonexistent_module_for_incident_drill  # noqa: F401

from app.config import settings
from app.database import get_db
from app.models import Note
from app.schemas import NoteCreate, NoteOut

app = FastAPI(title="Déploiement Scalingo — API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/notes", response_model=list[NoteOut])
def list_notes(db: Session = Depends(get_db)):
    return db.scalars(select(Note).order_by(Note.created_at.desc())).all()


@app.post("/notes", response_model=NoteOut, status_code=201)
def create_note(payload: NoteCreate, db: Session = Depends(get_db)):
    note = Note(content=payload.content)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
