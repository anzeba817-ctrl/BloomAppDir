from collections.abc import Awaitable, Callable

from fastapi import FastAPI, Request, Response

from .core.config import settings
from .core.crypto import CryptoService
from .core.db import close_pool, init_pool
from .routers.auth import router as auth_router
from .routers.ai import router as ai_router
from .routers.dashboard import router as dashboard_router
from .routers.sync import router as sync_router

app = FastAPI(title="Bloom FastAPI Microservice", version="1.0.0")


@app.on_event("startup")
async def on_startup() -> None:
    await init_pool()


@app.on_event("shutdown")
async def on_shutdown() -> None:
    await close_pool()


@app.middleware("http")
async def crypto_middleware(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    request.state.crypto = CryptoService(settings.encryption_key)
    return await call_next(request)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(sync_router)
app.include_router(ai_router)
app.include_router(dashboard_router)
app.include_router(auth_router)
