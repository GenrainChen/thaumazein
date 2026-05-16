import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "hermes.db"

ZHIPU_API_KEY = os.getenv("ZHIPU_API_KEY", "")
ZHIPU_MODEL = os.getenv("ZHIPU_MODEL", "glm-4.7-flash")

BACKEND_HOST = os.getenv("HERMES_HOST", "127.0.0.1")
BACKEND_PORT = int(os.getenv("HERMES_PORT", "8000"))
