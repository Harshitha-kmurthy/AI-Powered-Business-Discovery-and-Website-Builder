import requests
import json

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5-coder:7b"


def _resolve_images(data):
    """
    Build the exact image URL for every slot on the page.
    Uses scraped photos (data.images) first, in order.
    Falls back to the SAME picsum seeds/sizes the original prompt used,
    so behavior is 100% unchanged when there are no scraped images.
    """
    raw = getattr(data, "images", None) or []
    pool = [str(u).strip() for u in raw if u and str(u).strip().startswith("http")]

    def take(fallback_seed, w, h):
        if pool:
            return pool.pop(0)
        return f"https://picsum.photos/seed/{fallback_seed}/{w}/{h}"

    return {
        "logo": take(10, 60, 60),
        "hero": take(1, 1200, 800),
        "about": take(20, 600, 400),
        # original prompt left gallery(4)/services(3) seeds up to the model
        # (seeds 2-9+ range); keep same sizes, just give it concrete fallbacks too
        "gallery": [take(30 + i, 500, 400) for i in range(4)],
        "services": [take(40 + i, 500, 400) for i in range(3)],
    }


def build_prompt(data):
    imgs = _resolve_images(data)

    # NEW: plain-text summary of scraped photos for the BUSINESS DETAILS block
    raw_images = getattr(data, "images", None) or []
    scraped_images = [str(u).strip() for u in raw_images if u and str(u).strip().startswith("http")]
    images_line = ", ".join(scraped_images) if scraped_images else "None provided"

    return f"""You are an HTML/CSS/JS code generator. Output ONLY valid HTML. No explanations, no markdown, no ``` fences. Start your response with <!DOCTYPE html> and end with </html>.

Fill in this EXACT structure. Do not skip any part. Do not invent extra sections. Do not rename any class. Do not use local image paths like logo.png or about.jpg — every image must use the exact URLs given below.

REQUIRED <head> CONTENTS:
- <meta charset="UTF-8">
- <meta name="viewport" content="width=device-width, initial-scale=1.0">
- <meta name="description" content="short description of the business">
- <title>{data.name}</title>
- Google Font link for 'Poppins'
- One single <style> block containing ALL CSS (no external CSS files)

IMAGES:
- NEVER use local paths (logo.png, about.jpg, fruits.jpg, etc). These do not exist and will show as broken images.
- NEVER use source.unsplash.com (it is offline).
- Use these EXACT image URLs, copied character-for-character, one per slot — do not modify them, do not reuse the same URL twice, do not invent new ones:
  Logo (navbar):        {imgs['logo']}
  Hero background (CSS): {imgs['hero']}
  About image:          {imgs['about']}
  Gallery image 1:      {imgs['gallery'][0]}
  Gallery image 2:      {imgs['gallery'][1]}
  Gallery image 3:      {imgs['gallery'][2]}
  Gallery image 4:      {imgs['gallery'][3]}
  Service card 1 image: {imgs['services'][0]}
  Service card 2 image: {imgs['services'][1]}
  Service card 3 image: {imgs['services'][2]}

THERE IS NO MAP SECTION IN THIS WEBSITE. Do NOT include any <iframe>, Google Maps embed, or any section with id="map" anywhere in the output. Do NOT mention a map, location embed, or "Find Us" heading at all.

REQUIRED <body> SECTIONS IN THIS EXACT ORDER — use these exact id values, they are required for the nav links and CSS scroll offset to work:

1. Navbar (id not needed) — see NAVBAR MARKUP below.
2. <header id="hero" class="hero reveal">
3. <section id="about" class="reveal">
4. <section id="services" class="reveal">
5. <section id="gallery" class="reveal">
6. <section id="features" class="reveal">
7. <section id="contact" class="reveal">
8. <footer class="reveal">
9. Floating buttons (direct children of body, after footer)

SECTION DETAILS:

1. NAVBAR MARKUP — copy this EXACT structure, only changing text. Use ONLY ONE <h1> in the entire page (it goes in the hero, NOT here — use <span> in navbar, not <h1>):
<nav class="navbar">
  <div class="logo-group">
    <img src="{imgs['logo']}" alt="{data.name} logo" class="logo-img">
    <div class="logo-text">
      <span class="logo">{data.name}</span>
      <span class="slogan">a short catchy slogan you write for a {data.type}</span>
    </div>
  </div>
  <ul class="nav-links">
    <li><a href="#hero">Home</a></li>
    <li><a href="#about">About</a></li>
    <li><a href="#services">Services</a></li>
    <li><a href="#gallery">Gallery</a></li>
    <li><a href="#features">Why Us</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
  <button class="hamburger" onclick="document.querySelector('.nav-links').classList.toggle('open')">☰</button>
</nav>
IMPORTANT: nav link hrefs must be #hero, #about, #services, #gallery, #features, #contact exactly as shown — NEVER use href="#" for these links.

2. <header id="hero" class="hero reveal"> — the ONLY <h1> on the page goes here: <h1>{data.name}</h1>. Also a one-line tagline you write based on business type "{data.type}", and <a class="cta-btn" href="#contact">Get In Touch</a>.

3. <section id="about" class="reveal"> — copy this EXACT wrapper structure, only change paragraph text:
<section id="about" class="reveal">
  <div class="about-grid">
    <img src="{imgs['about']}" alt="About {data.name}" class="about-img">
    <div class="about-text">
      <h2>About Us</h2>
      <p>2-3 sentences you write describing {data.name}, a {data.type} located at {data.address}</p>
    </div>
  </div>
</section>

4. <section id="services" class="reveal"> — heading "Our Services", a <div class="grid"> of exactly 3 <div class="card"> items, using the 3 service card image URLs above in order. Each card: <img>, <h3> service title relevant to a {data.type}, <p> short description.

5. <section id="gallery" class="reveal"> — heading "Gallery", a <div class="grid"> of exactly 4 <img> elements, using the 4 gallery image URLs above in order.

6. <section id="features" class="reveal"> — heading "Why Choose Us", a <div class="grid"> of 3 <div class="feature"> items, each with an inline SVG icon (simple <svg> circle or path, NOT an external image), <h4> title, <p> description.

7. <section id="contact" class="reveal"> — copy this EXACT structure. It has BOTH a form AND the plain-text contact details below it — include both, do not replace one with the other:
<section id="contact" class="reveal">
  <h2>Contact Us</h2>
  <form onsubmit="return false;">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
    <label for="phone">Phone</label>
    <input type="tel" id="phone" name="phone" required>
    <label for="message">Message</label>
    <textarea id="message" name="message" required></textarea>
    <button type="submit">Send</button>
  </form>
  <div class="contact-details">
    <p>Phone: {data.phone if data.phone else "Not available"}</p>
    <p>Email: {data.email if data.email else "Not available"}</p>
    <p>Address: {data.address}</p>
  </div>
</section>

8. <footer class="reveal"> — business name, current year copyright text, 2 plain text links "Privacy Policy" / "Terms".

9. FLOATING BUTTONS — copy exactly, only change tel/wa.me numbers. These are bare <a> tags, NOT wrapped in a <div>:
<a class="call-btn" href="tel:{data.phone}">📞</a>
<a class="whatsapp-btn" href="https://wa.me/{data.phone}">💬</a>

CSS REQUIREMENTS — the <style> block MUST include ALL of the following rules, copied exactly as written (only adjust --primary/--dark/--light colors to fit a {data.type} business, never remove or rename selectors):

:root {{
  --primary: #3498db;
  --dark: #2c3e50;
  --light: #ecf0f1;
}}

* {{ box-sizing: border-box; }}

body {{
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
  scroll-behavior: smooth;
}}

img {{ max-width: 100%; height: auto; display: block; }}

.navbar {{
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: var(--primary);
  color: white;
  z-index: 1000;
}}

.logo-group {{ display: flex; align-items: center; gap: 12px; }}
.logo-img {{ width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }}
.logo-text {{ display: flex; flex-direction: column; line-height: 1.2; }}
.logo-text .logo {{ font-weight: 700; font-size: 1.1rem; }}
.logo-text .slogan {{ font-size: 0.75rem; opacity: 0.85; font-weight: 400; }}

.nav-links {{ list-style: none; display: flex; gap: 20px; margin: 0; padding: 0; }}
.nav-links a {{ text-decoration: none; color: white; }}

.hamburger {{ display: none; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: white; }}

.hero {{
  min-height: 60vh;
  padding: 2rem 1rem;
  margin-top: 0;
  background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('{imgs['hero']}') no-repeat center center/cover;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
}}

.hero h1 {{ font-size: clamp(1.8rem, 5vw, 3rem); margin-bottom: 0.5rem; }}

.hero .cta-btn {{
  background-color: var(--primary);
  color: white;
  padding: 0.7rem 1.5rem;
  border-radius: 5px;
  text-decoration: none;
  margin-top: 1rem;
  display: inline-block;
}}

section, footer {{
  padding: 2rem 1rem;
  padding-top: calc(2rem + 70px);
  max-width: 1200px;
  margin: 0 auto;
  overflow: hidden;
}}

.about-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 30px; align-items: center; }}
.about-img {{ border-radius: 8px; }}

.grid {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }}

.card, .feature {{
  background-color: var(--light);
  padding: 1rem;
  border-radius: 8px;
  transition: transform 0.3s ease;
}}
.card:hover, .feature:hover {{ transform: translateY(-6px); }}

form {{ display: flex; flex-direction: column; gap: 12px; max-width: 500px; margin-bottom: 1.5rem; }}
form input, form textarea {{
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
}}
form button {{
  background-color: var(--primary);
  color: white;
  padding: 0.7rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}}

.contact-details p {{ margin: 0.3rem 0; }}

footer {{ background-color: var(--dark); color: white; text-align: center; }}
footer a {{ color: white; margin: 0 8px; }}

.call-btn, .whatsapp-btn {{
  position: fixed;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  font-size: 1.4rem;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  z-index: 1000;
}}
.call-btn {{ bottom: 90px; background-color: var(--primary); }}
.whatsapp-btn {{ bottom: 20px; background-color: #25D366; }}

.reveal {{ opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease, transform 0.6s ease; }}
.reveal.visible {{ opacity: 1; transform: translateY(0); }}

@media (max-width: 768px) {{
  .nav-links {{
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: var(--primary);
    padding: 1rem;
  }}
  .nav-links.open {{ display: flex; }}
  .hamburger {{ display: block; }}
  .grid {{ grid-template-columns: 1fr; }}
  .about-grid {{ grid-template-columns: 1fr; }}
  section, footer {{ padding: 1.5rem 1rem; padding-top: calc(1.5rem + 70px); }}
  .hero h1 {{ font-size: 2rem; }}
  .logo-text .slogan {{ display: none; }}
}}

@media (max-width: 480px) {{
  .navbar {{ padding: 1rem; }}
  .card, .feature {{ padding: 0.75rem; }}
  .call-btn, .whatsapp-btn {{ width: 44px; height: 44px; font-size: 1.2rem; }}
}}

Do NOT use any @keyframes animation applied directly on page load. Use ONLY the .reveal / .reveal.visible opacity+transform pattern above, toggled by IntersectionObserver in JavaScript.

JAVASCRIPT — the closing <script> block (right before </body>) MUST include ONLY this exact IntersectionObserver logic. Do NOT add a separate hamburger click listener in JS:

<script>
const observer = new IntersectionObserver((entries) => {{
  entries.forEach(entry => {{
    if (entry.isIntersecting) {{
      entry.target.classList.add('visible');
    }}
  }});
}}, {{ threshold: 0.15 }});

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
</script>

BUSINESS DETAILS:
Business Name : {data.name}
Business Type : {data.type}
Address       : {data.address}
Phone         : {data.phone}
Email         : {data.email}
Website       : {data.website}
Latitude      : {data.lat}
Longitude     : {data.lon}
Scraped Photos: {images_line}


FINAL CHECKLIST — before you finish, verify your output satisfies EVERY item below. If any item is missing, fix it before finishing:
[ ] Exactly ONE <h1> tag in the whole document (inside hero only)
[ ] Navbar uses <span class="logo"> NOT <h1>
[ ] Navbar logo image uses the exact logo URL given above
[ ] All 6 nav links use real hrefs (#hero #about #services #gallery #features #contact), NONE are href="#"
[ ] Every <img> src matches one of the exact URLs given above — zero local paths, zero invented URLs
[ ] NO map section exists anywhere — no <iframe>, no id="map", no "Find Us" heading
[ ] Section order matches exactly: hero, about, services, gallery, features, contact, footer (8 sections total, no more, no less)
[ ] Contact section has BOTH the <form> AND the plain-text Phone/Email/Address lines — not just one of them
[ ] Email line shows "Not available" if {data.email} is empty — never leave it blank
[ ] Floating call-btn and whatsapp-btn are bare <a> tags directly under <body>, not wrapped in <div>
[ ] Every section id (about, services, gallery, features, contact) is present exactly once

Now output the complete single HTML file following this structure exactly.
"""


def stream_html(data):
    prompt = build_prompt(data)

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL,
                "prompt": prompt,
                "stream": True,
                "options": {
                    "temperature": 0.25,
                    "top_p": 0.9,
                    "repeat_penalty": 1.1,
                    "num_ctx": 8192,      # avoid silent prompt/output truncation
                    "num_predict": 4096,  # make sure long HTML isn't cut off early
                },
            },
            stream=True,
            timeout=300,
        )
        response.raise_for_status()
    except requests.exceptions.ConnectionError:
        yield "<!-- ERROR: Could not connect to Ollama. Is it running on localhost:11434? -->"
        return
    except requests.exceptions.Timeout:
        yield "<!-- ERROR: Ollama request timed out. -->"
        return
    except requests.exceptions.HTTPError as e:
        yield f"<!-- ERROR: Ollama returned an error: {e} -->"
        return

    buffer = ""
    started = False

    with response:
        for line in response.iter_lines():
            if not line:
                continue
            try:
                chunk = json.loads(line.decode("utf-8"))
            except json.JSONDecodeError:
                continue

            token = chunk.get("response", "")
            if token:
                buffer += token

                if not started:
                    stripped = buffer.lstrip()
                    if stripped.startswith("```"):
                        if "\n" in buffer:
                            buffer = buffer.split("\n", 1)[1]
                            started = True
                        else:
                            continue
                    else:
                        started = True

                if started and buffer:
                    yield buffer
                    buffer = ""

            if chunk.get("done"):
                break

    if buffer:
        if buffer.rstrip().endswith("```"):
            buffer = buffer.rstrip()[:-3]
        yield buffer
