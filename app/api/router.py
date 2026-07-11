from fastapi import APIRouter

from app.api.endpoints import auth,business,website




router=APIRouter()


router.include_router(
auth.router
)


router.include_router(
business.router
)

router.include_router(website.router)