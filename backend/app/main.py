from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routes import health, properties, matching, analytics, admin, auth, images, nlp, enquiries, saved

app = FastAPI(title="Nagpur Real Estate Brokerage API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(properties.router, prefix="/api")
app.include_router(matching.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(images.router, prefix="/api")
app.include_router(nlp.router, prefix="/api")
app.include_router(enquiries.router, prefix="/api")
app.include_router(saved.router, prefix="/api")