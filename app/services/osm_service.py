import requests
import time
import sys

OVERPASS_SERVERS = [
    "https://overpass-api.de/api/interpreter",
    # kumi.systems was renamed to private.coffee; the old hostname is being phased out.
    "https://overpass.private.coffee/api/interpreter",
]

# Both Nominatim AND Overpass now actively enforce their usage policies: they
# require a real, identifying User-Agent (not the default "python-requests/x.x"
# string). overpass-api.de started returning 406 Not Acceptable for requests
# without one after tightening anti-abuse rules. Put your own email/app name here.
APP_HEADERS = {
    "User-Agent": "business-finder-script/1.0 (karthikrkarthi6@gmail.com)",
    "Referer": "https://karthikr.great-site.net/",
}

# (connect_timeout, read_timeout). Read timeout is kept a bit above the
# Overpass query's own [timeout:25] so the client doesn't give up before
# the server itself would.
REQUEST_TIMEOUT = (5, 30)

TYPE_MAP = {
    "hospital": ["amenity=hospital"],
    "clinic": ["amenity=clinic"],
    "gym": ["leisure=fitness_centre"],
    "pharmacy": ["amenity=pharmacy"],
    "bank": ["amenity=bank"],
    "restaurant": ["amenity=restaurant"],
}


def geocode_city(city):
    print(f"[geocode] looking up '{city}' ...")
    try:
        r = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": f"{city}, India", "format": "json", "limit": 1},
            headers=APP_HEADERS,
            timeout=REQUEST_TIMEOUT,
        )
        r.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(f"[geocode] request failed: {e}")
        return None

    try:
        data = r.json()
    except ValueError:
        print("[geocode] response was not valid JSON")
        return None

    if not data:
        print(f"[geocode] no results found for '{city}'")
        return None

    result = {
        "lat": float(data[0]["lat"]),
        "lon": float(data[0]["lon"]),
        "name": data[0]["display_name"].split(",")[0],
    }
    print(f"[geocode] found {result['name']} ({result['lat']}, {result['lon']})")
    return result


def search_overpass(tags, lat, lon):
    query_parts = ""
    for tag in tags:
        k, v = tag.split("=")
        query_parts += f"""
        node["{k}"="{v}"](around:5000,{lat},{lon});
        way["{k}"="{v}"](around:5000,{lat},{lon});
        """

    # Added [timeout:25] so the SERVER also gives up after 25s, instead of
    # only relying on the client-side requests timeout below.
    query = f"""
    [out:json][timeout:25];
    (
    {query_parts}
    );
    out center 50;
    """

    for server in OVERPASS_SERVERS:
        print(f"[overpass] trying {server} ...")
        try:
            response = requests.post(
                server,
                data={"data": query},
                headers=APP_HEADERS,
                timeout=REQUEST_TIMEOUT,
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[overpass] {server} failed: {e}")
            time.sleep(2)
        except ValueError:
            print(f"[overpass] {server} returned invalid JSON")
            time.sleep(2)

    print("[overpass] all servers failed")
    return None


def find_business(business, city):
    location = geocode_city(city)
    if not location:
        return []

    tags = TYPE_MAP.get(business.lower())
    if tags is None:
        print(f"[find_business] unknown type '{business}', defaulting to restaurant")
        tags = ["amenity=restaurant"]

    data = search_overpass(tags, location["lat"], location["lon"])
    if not data:
        return []

    # .get() instead of data["elements"] so a malformed/error response
    # doesn't crash with a KeyError.
    elements = data.get("elements", [])
    results = []

    for item in elements:
        t = item.get("tags", {})
        if "name" not in t:
            continue

        lat = item.get("lat") or item.get("center", {}).get("lat")
        lon = item.get("lon") or item.get("center", {}).get("lon")

        results.append({
            "name": t.get("name"),
            "type": business,
            "address": t.get("addr:street", ""),
            "phone": t.get("phone", ""),
            "website": t.get("website", ""),
            "lat": lat,
            "lon": lon,
            "map": f"https://www.openstreetmap.org/?mlat={lat}&mlon={lon}",
        })

    print(f"[find_business] found {len(results)} result(s)")
    return results
