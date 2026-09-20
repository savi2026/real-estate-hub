from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import health, properties, matching, analytics

app = FastAPI(title="Nagpur Real Estate Brokerage API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(properties.router, prefix="/api")
app.include_router(matching.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")