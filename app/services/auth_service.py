from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta


SECRET_KEY = "MYSECRETKEY"

ALGORITHM = "HS256"


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str):

    # bcrypt supports max 72 bytes
    password = password[:72]

    return pwd_context.hash(password)



def verify_password(password, hashed_password):

    password = password[:72]

    return pwd_context.verify(
        password,
        hashed_password
    )



def create_token(data):

    expire = datetime.utcnow() + timedelta(
        minutes=60
    )

    data.update(
        {
            "exp": expire
        }
    )


    token = jwt.encode(
        data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


    return token