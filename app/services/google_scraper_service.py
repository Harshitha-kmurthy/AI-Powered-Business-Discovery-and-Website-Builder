import asyncio
import re

from playwright.async_api import (
    async_playwright,
    TimeoutError as PWTimeout,
)

NAME_SELECTORS = [
    "h1.DUwDvf",
    'h1[class*="fontHeadline"]',
    "h1",
]

ADDRESS_SELECTORS = [
    'button[data-item-id="address"]',
    'button[aria-label*="ddress"]',
    '[data-tooltip="Copy address"]',
]

PHONE_SELECTORS = [
    'button[data-item-id*="phone"]',
    'button[aria-label*="phone"]',
    '[data-tooltip="Copy phone number"]',
]

WEBSITE_SELECTORS = [
    'a[data-item-id="authority"]',
    'a[aria-label*="website" i]',
    'a[data-tooltip*="ebsite"]',
]

RATING_SELECTOR  = "div.F7nice span[aria-hidden='true']"
REVIEWS_SELECTOR = "div.F7nice span[aria-label*='review']"


def extract_lat_lng(url: str):
    m = re.search(r"@(-?\d+\.\d+),(-?\d+\.\d+)", url)
    if m:
        return m.group(1), m.group(2)
    lat = re.search(r"!3d(-?\d+\.\d+)", url)
    lng = re.search(r"!4d(-?\d+\.\d+)", url)
    if lat and lng:
        return lat.group(1), lng.group(1)
    return "", ""


async def get_text(page, selectors: list[str]) -> str:
    for sel in selectors:
        try:
            el = page.locator(sel).first
            if await el.count() > 0:
                return (await el.inner_text(timeout=3000)).strip()
        except Exception:
            continue
    return ""


def build_display_url(src: str) -> str | None:
    """
    Rewrite a Google photo URL to a safe, larger display size.
    Strips everything after the first '=' and appends a known-good size
    parameter, so the result is always a well-formed CDN URL regardless
    of what suffix Google originally embedded.
    Returns None if src doesn't look like a valid Google image URL.
    """
    if not src or ("googleusercontent" not in src and "ggpht" not in src):
        return None

    # Split off any existing size/param suffix that starts with '='
    base = src.split("=")[0]
    if not base.startswith("http"):
        return None

    # Standard, well-supported Google photo size parameter
    return f"{base}=w800-h600-k-no"


async def scrape_images(page) -> list[str]:
    """Scrape up to 5 image URLs from the place's photo section."""
    images: list[str] = []
    try:
        # Try to open the photo gallery
        photo_btn = page.locator(
            'button[aria-label*="Photo" i], button[jsaction*="photo"], '
            'a[aria-label*="Photo" i], div[jsaction*="pane.heroHeaderImage"]'
        ).first

        opened_gallery = False
        if await photo_btn.count() > 0:
            try:
                await photo_btn.click(timeout=3000)
                opened_gallery = True
            except Exception:
                pass

        # Poll until images load (up to ~3 s) instead of a fixed sleep
        if opened_gallery:
            for _ in range(6):
                count = await page.locator(
                    'img[src*="googleusercontent"], img[src*="ggpht"]'
                ).count()
                if count >= 3:
                    break
                await page.wait_for_timeout(500)

        # Collect from <img src>
        img_els = page.locator('img[src*="googleusercontent"], img[src*="ggpht"]')
        count = await img_els.count()
        for i in range(min(count, 20)):
            try:
                src = await img_els.nth(i).get_attribute("src", timeout=1500)
                if not src:
                    continue
                if "googleusercontent" not in src and "ggpht" not in src:
                    continue

                # Skip tiny avatar/icon-sized thumbnails (reviewer profile pics etc.)
                # Filter using actual width/height from the URL before rewriting
                size_match = re.search(r"=w(\d+)-h(\d+)", src)
                if size_match:
                    w, h = int(size_match.group(1)), int(size_match.group(2))
                    if w < 100 or h < 100:
                        continue  # too small — likely a reviewer avatar

                clean_url = build_display_url(src)
                if clean_url and clean_url not in images:
                    images.append(clean_url)
                    if len(images) >= 5:
                        break
            except Exception:
                continue

        # Fallback: some hero images are CSS background-image, not <img src>
        if len(images) == 0:
            bg_els = page.locator(
                'button[jsaction*="heroHeaderImage"] div, div[style*="googleusercontent"]'
            )
            bcount = await bg_els.count()
            for i in range(min(bcount, 10)):
                try:
                    style = await bg_els.nth(i).get_attribute("style", timeout=1000)
                    if style and ("googleusercontent" in style or "ggpht" in style):
                        m = re.search(r'url\("?(https://[^")]+)"?\)', style)
                        if m:
                            clean_url = build_display_url(m.group(1))
                            if clean_url and clean_url not in images:
                                images.append(clean_url)
                                if len(images) >= 5:
                                    break
                except Exception:
                    continue

        # Close the gallery so it doesn't interfere with further scraping
        if opened_gallery:
            try:
                close_btn = page.locator(
                    'button[aria-label*="Close" i], button[jsaction*="close"]'
                ).first
                if await close_btn.count() > 0:
                    await close_btn.click(timeout=1500)
            except Exception:
                pass

    except Exception as e:
        print(f"  ⚠️  scrape_images error: {str(e)[:100]}")

    return images


async def scrape_place(context, url: str) -> dict | None:
    page = await context.new_page()
    data: dict = {}

    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=30_000)

        try:
            await page.wait_for_selector("h1", timeout=10_000)
        except PWTimeout:
            pass

        data["name"]    = await get_text(page, NAME_SELECTORS)
        data["address"] = await get_text(page, ADDRESS_SELECTORS)
        data["phone"]   = await get_text(page, PHONE_SELECTORS)

        # Rating
        try:
            el = page.locator(RATING_SELECTOR).first
            if await el.count() > 0:
                data["rating"] = (await el.inner_text(timeout=3000)).strip()
            else:
                data["rating"] = ""
        except Exception:
            data["rating"] = ""

        # Reviews count
        try:
            el = page.locator(REVIEWS_SELECTOR).first
            if await el.count() > 0:
                label = await el.get_attribute("aria-label", timeout=3000)
                m = re.search(r"([\d,]+)", label or "")
                data["reviews"] = m.group(1) if m else ""
            else:
                data["reviews"] = ""
        except Exception:
            data["reviews"] = ""

        # Category
        try:
            cat_sel = '.DkEaL, button[jsaction*="category"], span[jsaction*="category"]'
            el = page.locator(cat_sel).first
            if await el.count() > 0:
                data["category"] = (await el.inner_text(timeout=3000)).strip()
            else:
                data["category"] = ""
        except Exception:
            data["category"] = ""

        # Hours
        try:
            el = page.locator('[data-item-id*="oh"] .ZDu9vd span').first
            if await el.count() > 0:
                data["hours"] = (await el.inner_text(timeout=3000)).strip()
            else:
                data["hours"] = ""
        except Exception:
            data["hours"] = ""

        # Website
        data["website"] = ""
        for sel in WEBSITE_SELECTORS:
            try:
                el = page.locator(sel).first
                if await el.count() > 0:
                    href = await el.get_attribute("href", timeout=3000)
                    if href and "google.com" not in href:
                        data["website"] = href
                        break
            except Exception:
                continue

        # Images (with retry-poll + CSS background-image fallback)
        data["images"] = await scrape_images(page)

        # Debug log — remove or comment out in production
        print(f"  📸 {data.get('name', '?')}: {len(data['images'])} images found")
        for img_url in data["images"]:
            print(f"      {img_url}")

        lat, lng = extract_lat_lng(page.url)
        data["lat"]    = lat
        data["lon"]    = lng
        data["map"]    = page.url
        data["source"] = "Google Maps Scraper"

    except Exception as e:
        print(f"  ⚠️  scrape_place error: {str(e)[:100]}")
        return None
    finally:
        await page.close()

    return data if data.get("name") else None


async def run_google_scraper(
    business: str,
    city: str,
    limit: int = 10,
    concurrency: int = 3,
) -> list[dict]:
    search_url = (
        "https://www.google.com/maps/search/"
        + f"{business}+{city}".replace(" ", "+")
    )
    results: list[dict] = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-dev-shm-usage",
                "--disable-blink-features=AutomationControlled",
            ],
        )
        context = await browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent=(
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="en-US",
        )

        page = await context.new_page()

        try:
            await page.goto(search_url, wait_until="domcontentloaded", timeout=30_000)
        except PWTimeout:
            pass

        try:
            await page.wait_for_selector(
                'div[role="feed"], a[href*="/maps/place/"]', timeout=15_000
            )
        except PWTimeout:
            await browser.close()
            return []

        # Dismiss cookie/consent banners if present
        for sel in ['button[aria-label="Accept all"]', 'button[jsname="b3VHJd"]']:
            try:
                btn = page.locator(sel).first
                if await btn.count() > 0:
                    await btn.click(timeout=2000)
                    await page.wait_for_timeout(800)
                    break
            except Exception:
                pass

        # Scroll the results feed until we have enough links
        panel = page.locator('div[role="feed"]')
        scroll_attempts, last_count = 0, 0
        while scroll_attempts < 12:
            try:
                await panel.evaluate("el => el.scrollBy(0, 800)")
            except Exception:
                await page.keyboard.press("End")
            await page.wait_for_timeout(900)
            links = page.locator('a[href*="/maps/place/"]')
            cur = await links.count()
            if cur >= limit:
                break
            if cur == last_count:
                scroll_attempts += 1
            else:
                scroll_attempts = 0
                last_count = cur

        # Deduplicate place URLs
        links = page.locator('a[href*="/maps/place/"]')
        total = await links.count()
        seen: set[str] = set()
        hrefs: list[str] = []
        for i in range(total):
            try:
                href = await links.nth(i).get_attribute("href", timeout=2000)
                clean = re.sub(r"\?.*$", "", href or "")
                if clean and clean not in seen and "/maps/place/" in clean:
                    seen.add(clean)
                    hrefs.append(clean)
            except Exception:
                continue
            if len(hrefs) >= limit:
                break

        await page.close()

        # Scrape each place concurrently (bounded by semaphore)
        sem = asyncio.Semaphore(concurrency)

        async def bounded_scrape(url: str):
            async with sem:
                return await scrape_place(context, url)

        tasks = [bounded_scrape(href) for href in hrefs]
        raw = await asyncio.gather(*tasks)
        results = [r for r in raw if r is not None]

        await browser.close()

    return results


def google_maps_scrape(business: str, city: str, limit: int = 10) -> list[dict]:
    loop = asyncio.new_event_loop()
    try:
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(
            run_google_scraper(business, city, limit)
        )
        return result
    finally:
        loop.close()