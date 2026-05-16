from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import DATA_DIR
from backend.db.connection import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Hermes", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from backend.intent import router as intent_router
from backend.model import router as model_router
from backend.agent import router as agent_router
from backend.dashboard import router as dashboard_router

app.include_router(intent_router, prefix="/api/intent", tags=["intent"])
app.include_router(model_router, prefix="/api/model", tags=["model"])
app.include_router(agent_router, prefix="/api/agent", tags=["agent"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])
