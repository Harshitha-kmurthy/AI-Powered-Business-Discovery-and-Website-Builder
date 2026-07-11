import asyncio
import sys


if sys.platform == "win32":

    asyncio.set_event_loop_policy(
        asyncio.WindowsProactorEventLoopPolicy()
    )


from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.api.router import router



app=FastAPI()



app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],

)



app.include_router(

    router,

    prefix="/api"

)