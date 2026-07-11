from pydantic import BaseModel


class WebsiteRequest(BaseModel):

    name: str

    type: str

    address: str

    phone: str | None = ""

    website: str | None = ""

    email: str | None = ""

    lat: float | None = None

    lon: float | None = None