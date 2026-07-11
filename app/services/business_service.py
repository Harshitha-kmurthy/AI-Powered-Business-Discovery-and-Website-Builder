import asyncio

from app.services.google_scraper_service import google_maps_scrape

from app.services.osm_service import find_business

from app.services.google_service import google_places_search




async def search_business(
        business,
        city
):


    print(
        "Trying Google Maps Scraper"
    )


    try:


        data = await asyncio.to_thread(

            google_maps_scrape,

            business,

            city

        )


        if data:

            return data



    except Exception as e:


        print(
            "Scraper failed",
            e
        )




    print(
        "Trying OpenStreetMap"
    )


    try:


        osm=find_business(
            business,
            city
        )


        if osm:

            return osm


    except Exception as e:


        print(
            "OSM failed",
            e
        )





    print(
        "Trying Google API"
    )


    return google_places_search(
        business,
        city
    )