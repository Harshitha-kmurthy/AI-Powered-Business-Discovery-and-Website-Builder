from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas.website import WebsiteRequest
from app.services.ollama_service import stream_html


router = APIRouter(
    prefix="/website",
    tags=["Website Builder"]
)


@router.post("/generate")
def generate(request: WebsiteRequest):
    return StreamingResponse(
        stream_html(request),
        media_type="text/plain"
    )