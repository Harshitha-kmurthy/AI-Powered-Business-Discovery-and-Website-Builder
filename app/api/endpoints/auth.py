from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models.user import User
from app.schemas.user import *
from app.services.auth_service import *


router=APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)



def get_db():

    db=SessionLocal()

    try:
        yield db

    finally:
        db.close()



@router.post("/register")


def register(
    user:RegisterSchema,
    db:Session=Depends(get_db)
):


    existing=db.query(User).filter(
        User.email==user.email
    ).first()


    if existing:

        raise HTTPException(
            400,
            "Email already exists"
        )


    new_user=User(

        username=user.username,

        email=user.email,

        password=hash_password(
            user.password
        )
    )


    db.add(new_user)

    db.commit()


    return {
        "message":"User created"
    }





@router.post("/login",
response_model=Token)


def login(

    user:LoginSchema,

    db:Session=Depends(get_db)

):


    db_user=db.query(User).filter(
        User.email==user.email
    ).first()


    if not db_user:

        raise HTTPException(
            401,
            "Invalid credentials"
        )



    if not verify_password(
        user.password,
        db_user.password
    ):

        raise HTTPException(
            401,
            "Invalid password"
        )



    token=create_token(
        {
            "sub":db_user.email
        }
    )


    return {

        "access_token":token,

        "token_type":"bearer"

    }