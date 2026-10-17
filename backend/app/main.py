from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.modules.scans.router import router as scans_router
from app.modules.users.router import auth_router, users_router

app = FastAPI(title='Diabetic Retinopathy Research API', version='0.1.0')
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origins, allow_methods=['*'], allow_headers=['*'])

@app.get('/health', tags=['system'])
def health() -> dict[str, str]:
    return {'status': 'ok'}

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(scans_router)
