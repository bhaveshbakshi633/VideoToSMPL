"""FastAPI app — single-user local backend for the VideoToSMPL webapp.

Run with:
    uvicorn server.main:app --host 127.0.0.1 --port 8000 --reload
"""

from __future__ import annotations

import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from server import __version__
from server.routes import health as health_routes
from server.routes import jobs as jobs_routes

logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
)

app = FastAPI(
    title="VideoToSMPL API",
    version=__version__,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(health_routes.router, prefix="/api", tags=["meta"])
app.include_router(jobs_routes.router, prefix="/api", tags=["jobs"])


@app.get("/api", include_in_schema=False)
def root() -> JSONResponse:
    return JSONResponse({"name": "VideoToSMPL", "version": __version__, "docs": "/api/docs"})
