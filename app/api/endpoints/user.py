from fastapi import APIRouter, Depends
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer

from app.services.auth_service import SECRET_KEY, ALGORITHM


router = APIRouter(
    prefix="/user",
    tags=["User"]
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)



def get_current_user(
    token:str = Depends(oauth2_scheme)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )


        email = payload.get("sub")


        return email


    except JWTError:

        return None



@router.get("/dashboard")
def dashboard(
    user=Depends(get_current_user)
):

    return {

        "message":f"Welcome {user}"

    }