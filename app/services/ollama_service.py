import requests
import json


OLLAMA_URL = "http://localhost:11434/api/generate"

MODEL = "qwen2.5-coder:7b"



def build_prompt(data):
    return f"""You are an HTML/CSS/JS code generator. Output ONLY valid HTML. No explanations, no markdown, no ``` fences. Start your response with <!DOCTYPE html> and end with </html>.

Fill in this EXACT structure. Do not skip any part. Do not invent extra sections. Do not rename any class. Do not use local image paths like logo.png or about.jpg — every image must use the picsum pattern below.

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
- Use this EXACT pattern for every image, changing only the seed number:
  https://picsum.photos/seed/SEEDNUMBER/WIDTH/HEIGHT
- Use a different seed number for every single image on the page (1, 2, 3, 4, 5, 6, 7, 8, 9, 10...). Never reuse a seed.

REQUIRED <body> SECTIONS IN THIS EXACT ORDER — use these exact id values, they are required for the nav links and CSS scroll offset to work:

1. Navbar (id not needed) — see NAVBAR MARKUP below.
2. <header id="hero" class="hero reveal">
3. <section id="about" class="reveal">
4. <section id="services" class="reveal">
5. <section id="gallery" class="reveal">
6. <section id="features" class="reveal">
7. <section id="contact" class="reveal">
8. <section id="map" class="reveal">
9. <footer class="reveal">
10. Floating buttons (direct children of body, after footer)

SECTION DETAILS:

1. NAVBAR MARKUP — copy this EXACT structure, only changing text and seed number. Use ONLY ONE <h1> in the entire page (it goes in the hero, NOT here — use <span> in navbar, not <h1>):
<nav class="navbar">
  <div class="logo-group">
    <img src="https://picsum.photos/seed/10/60/60" alt="{data.name} logo" class="logo-img">
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

3. <section id="about" class="reveal"> — copy this EXACT wrapper structure, only change seed number and paragraph text:
<section id="about" class="reveal">
  <div class="about-grid">
    <img src="https://picsum.photos/seed/20/600/400" alt="About {data.name}" class="about-img">
    <div class="about-text">
      <h2>About Us</h2>
      <p>2-3 sentences you write describing {data.name}, a {data.type} located at {data.address}</p>
    </div>
  </div>
</section>

4. <section id="services" class="reveal"> — heading "Our Services", a <div class="grid"> of exactly 3 <div class="card"> items. Each card: <img> (picsum pattern), <h3> service title relevant to a {data.type}, <p> short description.

5. <section id="gallery" class="reveal"> — heading "Gallery", a <div class="grid"> of exactly 4 <img> elements using the picsum pattern.

6. <section id="features" class="reveal"> — heading "Why Choose Us", a <div class="grid"> of 3 <div class="feature"> items, each with an inline SVG icon (simple <svg> circle or path, NOT an external image), <h4> title, <p> description.

7. <section id="contact" class="reveal"> — heading "Contact Us", a <form onsubmit="return false;"> with labeled inputs for Name, Email, Phone, Message and a submit <button>. Below the form, plain text showing EXACTLY these three lines:
   Phone: {data.phone}
   Email: {data.email}
   Address: {data.address}

8. <section id="map" class="reveal"> — THIS SECTION IS MANDATORY, DO NOT SKIP IT. Heading "Find Us", followed by exactly this iframe:
<iframe src="https://www.google.com/maps?q={data.lat},{data.lon}&output=embed" width="100%" height="350" style="border:0;" loading="lazy"></iframe>

9. <footer class="reveal"> — business name, current year copyright text, 2 plain text links "Privacy Policy" / "Terms".

10. FLOATING BUTTONS — copy exactly, only change tel/wa.me numbers. These are bare <a> tags, NOT wrapped in a <div>:
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
  background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://picsum.photos/seed/1/1200/800') no-repeat center center/cover;
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

form {{ display: flex; flex-direction: column; gap: 12px; max-width: 500px; }}
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

#map iframe {{ width: 100%; border-radius: 8px; }}

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

FINAL CHECKLIST — before you finish, verify your output satisfies EVERY item below. If any item is missing, add it:
[ ] Exactly ONE <h1> tag in the whole document (inside hero only)
[ ] Navbar uses <span class="logo"> NOT <h1>
[ ] All 6 nav links use real hrefs (#hero #about #services #gallery #features #contact), NONE are href="#"
[ ] Every <img> src starts with https://picsum.photos/seed/ — zero local paths like logo.png
[ ] Section order matches: hero, about, services, gallery, features, contact, map, footer
[ ] #map section exists with the exact iframe src shown above — this is required, not optional
[ ] Contact section shows Phone/Email/Address as plain text lines, not just a form
[ ] Floating call-btn and whatsapp-btn are bare <a> tags directly under <body>, not wrapped in <div>
[ ] Every section id (about, services, gallery, features, contact, map) is present exactly once

Now output the complete single HTML file following this structure exactly.
"""

def stream_html(data):
    prompt = build_prompt(data)

    with requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": True,
            "options": {
                "temperature": 0.25,
                "top_p": 0.9,
                "repeat_penalty": 1.1
            }
        },
        stream=True,
        timeout=None
    ) as response:
        response.raise_for_status()
        for line in response.iter_lines():
            if not line:
                continue
            chunk = json.loads(line.decode("utf-8"))
            token = chunk.get("response", "")
            if token:
                yield token
            if chunk.get("done"):
                break