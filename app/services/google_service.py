import requests
import os



API_KEY=os.getenv(
    "GOOGLE_API_KEY"
)



def google_places_search(
        business,
        city
):


    try:


        url=(
        "https://maps.googleapis.com/maps/api/place/textsearch/json"
        )



        params={

        "query":
        f"{business} in {city}",

        "key":
        API_KEY

        }



        response=requests.get(
            url,
            params=params,
            timeout=10
        )


        data=response.json()



        if data.get("status")!="OK":

            return []



        results=[]



        for item in data["results"]:


            loc=item["geometry"]["location"]



            results.append({

                "name":
                item.get("name"),


                "address":
                item.get("formatted_address"),


                "rating":
                item.get("rating"),


                "lat":
                loc.get("lat"),


                "lon":
                loc.get("lng"),


                "source":
                "Google API"


            })



        return results



    except Exception as e:


        print(e)

        return []