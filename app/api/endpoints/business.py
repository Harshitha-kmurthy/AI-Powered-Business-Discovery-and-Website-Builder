from fastapi import APIRouter,HTTPException

from app.services.business_service import search_business


router=APIRouter(
prefix="/business",
tags=["Business"]
)



@router.post("/search")
async def search(data:dict):


    business=data.get("business")

    location=data.get("location")



    if not business or not location:

        raise HTTPException(
            400,
            "business and location required"
        )


    result=await search_business(
        business,
        location
    )



    return {

        "count":len(result),

        "results":result

    }