// WebsiteBuilder.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import API from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ─── Map pin ─────────────────────────────────────────────────── */
const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="32" height="44" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#8b5cf6"/>
        <stop offset="100%" stop-color="#ec4899"/>
      </linearGradient>
    </defs>
    <path d="M14 0C6.3 0 0 6.3 0 14c0 9.8 14 24 14 24S28 23.8 28 14C28 6.3 21.7 0 14 0z" fill="url(#pg)"/>
    <circle cx="14" cy="14" r="5.5" fill="#fff"/>
  </svg>`,
  iconSize: [32, 44], iconAnchor: [16, 44], popupAnchor: [0, -40],
});

/* ─── Icons ───────────────────────────────────────────────────── */
const IconPhone = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
const IconWeb   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></svg>;
const IconPin   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-7.2-7-12a7 7 0 1 1 14 0c0 4.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>;
const IconImg   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>;
const IconStar  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const IconMail  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
const IconCompass = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="m15 9-2 6-4 2 2-6 4-2z"/></svg>;
const IconSpark = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z"/></svg>;
const IconDownload = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4 4-4M4 21h16"/></svg>;
const IconBack = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;

function stars(r) {
  const n = Math.min(5, Math.round(parseFloat(r) || 0));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.wb-root {
  min-height: 100vh;
  font-family: 'Space Grotesk', sans-serif;
  background: #0a0e1a;
  color: #e8ecf5;
  position: relative;
  overflow-x: hidden;
  padding: 24px;
}
.wb-root::before {
  content: '';
  position: fixed; inset: 0;
  background:
    radial-gradient(circle at 15% 20%, rgba(139,92,246,.25), transparent 40%),
    radial-gradient(circle at 85% 10%, rgba(236,72,153,.2), transparent 40%),
    radial-gradient(circle at 50% 90%, rgba(59,130,246,.22), transparent 45%);
  animation: wbBg 18s ease infinite alternate;
  pointer-events: none;
  z-index: 0;
}
@keyframes wbBg {
  0%   { transform: scale(1) translate(0,0); }
  100% { transform: scale(1.15) translate(-3%,2%); }
}
.wb-orb {
  position: fixed;
  border-radius: 50%;
  filter: blur(60px);
  opacity: .35;
  pointer-events: none;
  z-index: 0;
  animation: wbFloat 14s ease-in-out infinite;
}
.wb-orb.o1 { width: 380px; height: 380px; background: #8b5cf6; top: -80px; left: -80px; }
.wb-orb.o2 { width: 320px; height: 320px; background: #ec4899; bottom: -60px; right: -60px; animation-delay: -4s; }
.wb-orb.o3 { width: 260px; height: 260px; background: #3b82f6; top: 50%; left: 60%; animation-delay: -8s; }
@keyframes wbFloat {
  0%,100% { transform: translate(0,0) scale(1); }
  50%     { transform: translate(30px,-40px) scale(1.1); }
}

.wb-shell { position: relative; z-index: 1; max-width: 1280px; margin: 0 auto; }

/* Header */
.wb-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 18px;
  backdrop-filter: blur(20px);
  margin-bottom: 24px;
  animation: wbFadeDown .6s ease both;
}
.wb-title {
  display: flex; align-items: center; gap: 12px;
  font-size: 1.5rem; font-weight: 700; margin: 0;
  background: linear-gradient(90deg, #8b5cf6, #ec4899, #3b82f6, #8b5cf6);
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: wbGrad 6s linear infinite;
}
@keyframes wbGrad { to { background-position: 300% 0; } }
.wb-title-badge {
  width: 38px; height: 38px; border-radius: 12px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: #fff; box-shadow: 0 8px 24px rgba(139,92,246,.45);
  animation: wbPulse 3s ease-in-out infinite;
}
@keyframes wbPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
.wb-back {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  background: rgba(255,255,255,.06);
  border: 1px solid rgba(255,255,255,.12);
  color: #e8ecf5; border-radius: 10px; cursor: pointer;
  font-family: inherit; font-weight: 500; font-size: .9rem;
  transition: all .25s ease;
}
.wb-back:hover { background: rgba(255,255,255,.12); transform: translateX(-3px); border-color: rgba(139,92,246,.5); }

/* Name block */
.wb-name-block {
  padding: 32px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(139,92,246,.15), rgba(236,72,153,.1));
  border: 1px solid rgba(255,255,255,.1);
  backdrop-filter: blur(20px);
  margin-bottom: 24px;
  animation: wbFadeUp .6s ease .1s both;
  position: relative; overflow: hidden;
}
.wb-name-block::before {
  content: '';
  position: absolute; top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: conic-gradient(from 0deg, transparent, rgba(139,92,246,.15), transparent 30%);
  animation: wbSpin 8s linear infinite;
}
.wb-name-block > * { position: relative; z-index: 1; }
@keyframes wbSpin { to { transform: rotate(360deg); } }
.wb-cat-pill {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(139,92,246,.25);
  border: 1px solid rgba(139,92,246,.4);
  color: #c4b5fd;
  border-radius: 999px;
  font-size: .75rem; font-weight: 600;
  letter-spacing: .08em; text-transform: uppercase;
  margin-bottom: 12px;
}
.wb-biz-name {
  font-size: 2.4rem; font-weight: 700; margin: 0;
  color: #fff; letter-spacing: -.02em;
}

/* Cards */
.wb-card {
  padding: 24px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 18px;
  backdrop-filter: blur(20px);
  transition: all .3s ease;
  animation: wbFadeUp .6s ease both;
}
.wb-card:hover { border-color: rgba(139,92,246,.35); transform: translateY(-2px); }
.wb-card-eyebrow {
  display: flex; align-items: center; gap: 8px;
  font-size: .78rem; font-weight: 600;
  color: #a5b4fc;
  letter-spacing: .1em; text-transform: uppercase;
  margin: 0 0 18px;
}

/* Gallery */
.wb-gallery { margin-bottom: 24px; animation-delay: .2s; }
.wb-main-img-wrap {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  aspect-ratio: 16/9;
  background: #0f172a;
  border: 1px solid rgba(255,255,255,.08);
}
.wb-main-img {
  width: 100%; height: 100%; object-fit: cover;
  animation: wbZoom 1s ease;
}
@keyframes wbZoom { from { transform: scale(1.08); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.wb-img-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(10,14,26,.75); color: #fff;
  border: 1px solid rgba(255,255,255,.15);
  font-size: 1.6rem; cursor: pointer;
  display: grid; place-items: center;
  backdrop-filter: blur(10px);
  transition: all .2s ease;
}
.wb-img-nav:hover { background: rgba(139,92,246,.7); transform: translateY(-50%) scale(1.1); }
.wb-img-nav-prev { left: 14px; }
.wb-img-nav-next { right: 14px; }
.wb-thumb-row {
  display: flex; gap: 10px; margin-top: 14px;
  overflow-x: auto; padding-bottom: 4px;
}
.wb-thumb {
  flex: 0 0 84px; height: 60px;
  border-radius: 8px; overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer; opacity: .6;
  transition: all .25s ease;
}
.wb-thumb:hover { opacity: 1; transform: translateY(-2px); }
.wb-thumb-active { opacity: 1; border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,.25); }
.wb-thumb-img { width: 100%; height: 100%; object-fit: cover; }

/* Details grid */
.wb-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}
@media (max-width: 900px) { .wb-detail-grid { grid-template-columns: 1fr; } }

.wb-record-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.wb-record {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 12px; border-radius: 12px;
  background: rgba(255,255,255,.02);
  border: 1px solid rgba(255,255,255,.05);
  transition: all .25s ease;
}
.wb-record:hover {
  background: rgba(139,92,246,.08);
  border-color: rgba(139,92,246,.25);
  transform: translateX(4px);
}
.wb-record-icon {
  width: 38px; height: 38px; flex-shrink: 0;
  border-radius: 10px;
  display: grid; place-items: center;
  background: linear-gradient(135deg, rgba(139,92,246,.25), rgba(236,72,153,.2));
  color: #c4b5fd;
}
.wb-record-label {
  margin: 0 0 3px; font-size: .7rem; font-weight: 600;
  color: #94a3b8; letter-spacing: .08em; text-transform: uppercase;
}
.wb-record-value { margin: 0; font-size: .95rem; color: #e8ecf5; word-break: break-word; }
.wb-link { color: #a5b4fc; text-decoration: none; transition: color .2s ease; }
.wb-link:hover { color: #ec4899; text-decoration: underline; }
.wb-muted { color: #64748b; font-style: italic; }
.wb-mono { font-family: 'JetBrains Mono', monospace; font-size: .85rem; color: #a5b4fc; }
.wb-hours-open   { color: #10b981; font-weight: 600; }
.wb-hours-closed { color: #ef4444; font-weight: 600; }
.wb-hours-unknown{ color: #94a3b8; }
.wb-rating-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.wb-rating-stars { color: #fbbf24; letter-spacing: 2px; font-size: 1rem; }
.wb-review-pill {
  padding: 3px 10px; background: rgba(251,191,36,.15);
  border: 1px solid rgba(251,191,36,.3);
  color: #fbbf24; border-radius: 999px; font-size: .72rem; font-weight: 600;
}

/* Map */
.wb-coord-chip {
  display: inline-block;
  padding: 5px 12px;
  background: rgba(59,130,246,.15);
  border: 1px solid rgba(59,130,246,.3);
  color: #93c5fd;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  font-size: .75rem;
  margin-bottom: 12px;
}
.wb-map-wrap {
  height: 280px; border-radius: 14px; overflow: hidden;
  border: 1px solid rgba(255,255,255,.1);
  box-shadow: 0 10px 30px rgba(0,0,0,.3);
}
.wb-gmaps-btn {
  display: inline-flex; align-items: center; gap: 8px;
  margin-top: 12px; padding: 10px 18px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff; border-radius: 10px; text-decoration: none;
  font-weight: 600; font-size: .88rem;
  transition: all .25s ease;
  box-shadow: 0 6px 18px rgba(59,130,246,.35);
}
.wb-gmaps-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(59,130,246,.5); }
.wb-map-empty {
  padding: 40px 20px; text-align: center;
  border-radius: 14px;
  background: rgba(255,255,255,.02);
  border: 1px dashed rgba(255,255,255,.15);
  color: #94a3b8;
}

/* Action bar */
.wb-actions {
  display: flex; gap: 14px; flex-wrap: wrap;
  padding: 20px; margin-bottom: 24px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 18px;
  backdrop-filter: blur(20px);
  animation: wbFadeUp .6s ease .3s both;
}
.wb-btn {
  flex: 1; min-width: 200px;
  padding: 14px 22px;
  border: none; border-radius: 12px;
  font-family: inherit; font-weight: 600; font-size: .95rem;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  transition: all .3s ease;
  position: relative; overflow: hidden;
}
.wb-btn::after {
  content: '';
  position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transition: left .6s ease;
}
.wb-btn:hover::after { left: 100%; }
.wb-btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  color: #fff;
  box-shadow: 0 10px 30px rgba(139,92,246,.4);
}
.wb-btn-primary:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(236,72,153,.5); }
.wb-btn-primary:disabled { opacity: .7; cursor: not-allowed; }
.wb-btn-secondary {
  background: rgba(255,255,255,.06);
  color: #e8ecf5;
  border: 1px solid rgba(255,255,255,.15);
}
.wb-btn-secondary:hover { background: rgba(255,255,255,.12); transform: translateY(-2px); }

.wb-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: wbSpin2 .8s linear infinite;
}
@keyframes wbSpin2 { to { transform: rotate(360deg); } }

/* Editor / Preview */
.wb-workspace {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  animation: wbFadeUp .6s ease .4s both;
}
@media (max-width: 1024px) { .wb-workspace { grid-template-columns: 1fr; } }
.wb-pane {
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(255,255,255,.08);
  border-radius: 18px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  display: flex; flex-direction: column;
}
.wb-pane-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(255,255,255,.08);
  background: rgba(0,0,0,.2);
}
.wb-pane-title {
  margin: 0; font-size: .82rem; font-weight: 600;
  color: #cbd5e1; letter-spacing: .1em; text-transform: uppercase;
}
.wb-dots { display: flex; gap: 6px; }
.wb-dot { width: 10px; height: 10px; border-radius: 50%; }
.wb-dot.r { background: #ef4444; }
.wb-dot.y { background: #eab308; }
.wb-dot.g { background: #22c55e; }
.wb-editor {
  width: 100%; height: 520px;
  padding: 18px;
  background: #0a0e1a;
  color: #a5f3fc;
  border: none; outline: none; resize: vertical;
  font-family: 'JetBrains Mono', monospace;
  font-size: .82rem; line-height: 1.6;
}
.wb-preview {
  width: 100%; height: 520px;
  border: none; display: block; background: #fff;
}

.wb-live-dot {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: .72rem; color: #10b981; font-weight: 600;
}
.wb-live-dot::before {
  content: ''; width: 8px; height: 8px; border-radius: 50%;
  background: #10b981; box-shadow: 0 0 10px #10b981;
  animation: wbBlink 1.4s ease-in-out infinite;
}
@keyframes wbBlink { 50% { opacity: .3; } }

@keyframes wbFadeUp   { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
@keyframes wbFadeDown { from { opacity: 0; transform: translateY(-20px);} to { opacity: 1; transform: none; } }

/* Error page */
.wb-error {
  min-height: 100vh;
  display: grid; place-items: center;
  background: #0a0e1a; color: #fff;
  font-family: 'Space Grotesk', sans-serif;
  text-align: center; padding: 24px;
}
.wb-error h2 {
  font-size: 2rem; margin: 0 0 20px;
  background: linear-gradient(90deg, #8b5cf6, #ec4899);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
`;

function WebsiteBuilder() {
  const navigate = useNavigate();
  const location = useLocation();
  const business = location.state?.business;
  const [loading, setLoading] = useState(false);
  const [streamingHtml, setStreamingHtml] = useState("");
  const [generatedHtml, setGeneratedHtml] = useState("");
  const [imgIdx, setImgIdx] = useState(0);

  if (!business) {
    return (
      <>
        <style>{styles}</style>
        <div className="wb-error">
          <div>
            <h2>No Business Selected</h2>
            <button className="wb-btn wb-btn-primary" onClick={() => navigate("/dashboard")}>
              <IconBack /> Back To Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  const lat = parseFloat(business.lat);
  const lon = parseFloat(business.lon);
  const hasLoc = !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
  const images = Array.isArray(business.images) ? business.images : [];
  const mapUrl = business.map || business.location_link || null;
  const hoursClass = business.hours
    ? business.hours.toLowerCase().includes("open") ? "wb-hours-open"
    : business.hours.toLowerCase().includes("close") ? "wb-hours-closed"
    : "wb-hours-unknown"
    : null;

  const generateWebsite = async () => {
    setLoading(true);
    setStreamingHtml("");
    setGeneratedHtml("");
    try {
      const payload = {
        name: business.name,
        type: business.type || business.category,
        address: business.address,
        phone: business.phone || "",
        website: business.website || "",
        email: business.email || "",
        lat: business.lat,
        lon: business.lon,
        images: Array.isArray(business.images) ? business.images.filter(Boolean) : [],
      };
      const baseURL = API.defaults.baseURL || "";
      const response = await fetch(`${baseURL}/website/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok || !response.body) throw new Error("Stream failed");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulated = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setStreamingHtml(accumulated);
      }
      setGeneratedHtml(accumulated);
    } catch (error) {
      console.error(error);
      alert("Website Generation Failed");
    }
    setLoading(false);
  };

  const downloadHTML = () => {
    if (!generatedHtml) { alert("Generate website first"); return; }
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${business.name}.html`; a.click();
    URL.revokeObjectURL(url);
  };

  const editorValue = loading ? streamingHtml : generatedHtml;
  const handleEditorChange = (e) => setGeneratedHtml(e.target.value);

  return (
    <>
      <style>{styles}</style>
      <div className="wb-root">
        <div className="wb-orb o1" />
        <div className="wb-orb o2" />
        <div className="wb-orb o3" />

        <div className="wb-shell">
          {/* Header */}
          <div className="wb-header">
            <h1 className="wb-title">
              <span className="wb-title-badge"><IconSpark /></span>
              AI Website Builder
            </h1>
            <button className="wb-back" onClick={() => navigate("/dashboard")}>
              <IconBack /> Dashboard
            </button>
          </div>

          {/* Name block */}
          <div className="wb-name-block">
            {business.category && <span className="wb-cat-pill">{business.category}</span>}
            <h2 className="wb-biz-name">{business.name || "Unknown"}</h2>
          </div>

          {/* Gallery */}
          {images.length > 0 && (
            <div className="wb-card wb-gallery">
              <h3 className="wb-card-eyebrow"><IconImg /> Photos ({imgIdx + 1}/{images.length})</h3>
              <div className="wb-main-img-wrap">
                <img
                  key={imgIdx}
                  src={images[imgIdx]}
                  alt={`${business.name} photo ${imgIdx + 1}`}
                  className="wb-main-img"
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  loading="lazy"
                  onError={e => { e.target.style.display = "none"; }}
                />
                {images.length > 1 && (
                  <>
                    <button type="button" className="wb-img-nav wb-img-nav-prev"
                      onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                      aria-label="Previous photo">‹</button>
                    <button type="button" className="wb-img-nav wb-img-nav-next"
                      onClick={() => setImgIdx(i => (i + 1) % images.length)}
                      aria-label="Next photo">›</button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="wb-thumb-row">
                  {images.map((src, i) => (
                    <div key={i} className={`wb-thumb ${i === imgIdx ? "wb-thumb-active" : ""}`}
                      onClick={() => setImgIdx(i)}>
                      <img src={src} alt="" className="wb-thumb-img"
                        referrerPolicy="no-referrer" crossOrigin="anonymous" loading="lazy"
                        onError={e => { e.target.parentElement.style.display = "none"; }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details + Map */}
          <div className="wb-detail-grid">
            <div className="wb-card">
              <h3 className="wb-card-eyebrow">Contact & Info</h3>
              <ul className="wb-record-list">
                <li className="wb-record">
                  <div className="wb-record-icon"><IconPin /></div>
                  <div>
                    <p className="wb-record-label">Address</p>
                    <p className="wb-record-value">{business.address || <em className="wb-muted">Not provided</em>}</p>
                  </div>
                </li>
                <li className="wb-record">
                  <div className="wb-record-icon"><IconPhone /></div>
                  <div>
                    <p className="wb-record-label">Phone</p>
                    <p className="wb-record-value">
                      {business.phone
                        ? <a href={`tel:${business.phone}`} className="wb-link">{business.phone}</a>
                        : <em className="wb-muted">Not available</em>}
                    </p>
                  </div>
                </li>
                <li className="wb-record">
                  <div className="wb-record-icon"><IconWeb /></div>
                  <div>
                    <p className="wb-record-label">Website</p>
                    <p className="wb-record-value">
                      {business.website
                        ? <a href={business.website} target="_blank" rel="noopener" className="wb-link">
                            {(() => { try { return new URL(business.website).hostname; } catch { return business.website; } })()}
                          </a>
                        : <em className="wb-muted">No website</em>}
                    </p>
                  </div>
                </li>
                <li className="wb-record">
                  <div className="wb-record-icon"><IconClock /></div>
                  <div>
                    <p className="wb-record-label">Hours</p>
                    <p className="wb-record-value">
                      {business.hours
                        ? <span className={hoursClass}>{business.hours}</span>
                        : <em className="wb-muted">Not available</em>}
                    </p>
                  </div>
                </li>
                <li className="wb-record">
                  <div className="wb-record-icon"><IconStar /></div>
                  <div>
                    <p className="wb-record-label">Rating</p>
                    <p className="wb-record-value">
                      {business.rating ? (
                        <span className="wb-rating-row">
                          <span className="wb-rating-stars">{stars(business.rating)}</span>
                          <strong style={{ color: "#fff" }}>{business.rating}</strong>
                          {business.reviews && <span className="wb-review-pill">{business.reviews} reviews</span>}
                        </span>
                      ) : <em className="wb-muted">Not rated</em>}
                    </p>
                  </div>
                </li>
                {hasLoc && (
                  <li className="wb-record">
                    <div className="wb-record-icon"><IconCompass /></div>
                    <div>
                      <p className="wb-record-label">Coordinates</p>
                      <p className="wb-record-value wb-mono">{lat.toFixed(6)}, {lon.toFixed(6)}</p>
                    </div>
                  </li>
                )}
                {business.email && (
                  <li className="wb-record">
                    <div className="wb-record-icon"><IconMail /></div>
                    <div>
                      <p className="wb-record-label">Email</p>
                      <p className="wb-record-value">
                        <a href={`mailto:${business.email}`} className="wb-link">{business.email}</a>
                      </p>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            <div className="wb-card">
              <h3 className="wb-card-eyebrow"><IconPin /> Location</h3>
              {hasLoc ? (
                <>
                  <span className="wb-coord-chip">{lat.toFixed(4)}, {lon.toFixed(4)}</span>
                  <div className="wb-map-wrap">
                    <MapContainer center={[lat, lon]} zoom={15} scrollWheelZoom={false}
                      style={{ height: "100%", width: "100%" }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors' />
                      <Marker position={[lat, lon]} icon={pinIcon}>
                        <Popup><strong>{business.name}</strong>{business.address && <><br />{business.address}</>}</Popup>
                      </Marker>
                    </MapContainer>
                  </div>
                  {mapUrl && (
                    <a href={mapUrl} target="_blank" rel="noopener" className="wb-gmaps-btn">
                      <IconPin /> Open in Google Maps
                    </a>
                  )}
                </>
              ) : (
                <div className="wb-map-empty">
                  <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>📍</div>
                  <p style={{ margin: 0 }}>
                    {mapUrl
                      ? <a href={mapUrl} target="_blank" rel="noopener" className="wb-link">Open in Google Maps →</a>
                      : "Coordinates not available for this business."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="wb-actions">
            <button className="wb-btn wb-btn-primary" onClick={generateWebsite} disabled={loading}>
              {loading ? <><span className="wb-spinner" /> Generating...</> : <><IconSpark /> Generate Website</>}
            </button>
            <button className="wb-btn wb-btn-secondary" onClick={downloadHTML}>
              <IconDownload /> Download HTML
            </button>
          </div>

          {/* Editor / Preview */}
          <div className="wb-workspace">
            <div className="wb-pane">
              <div className="wb-pane-head">
                <h3 className="wb-pane-title">HTML Editor</h3>
                {loading && <span className="wb-live-dot">Streaming</span>}
              </div>
              <textarea
                className="wb-editor"
                value={editorValue}
                onChange={handleEditorChange}
                placeholder="<!-- Generated HTML will appear here -->"
                spellCheck="false"
              />
            </div>
            <div className="wb-pane">
              <div className="wb-pane-head">
                <div className="wb-dots">
                  <span className="wb-dot r" />
                  <span className="wb-dot y" />
                  <span className="wb-dot g" />
                </div>
                <h3 className="wb-pane-title">Live Preview</h3>
                <span style={{ width: 40 }} />
              </div>
              <iframe title="preview" srcDoc={generatedHtml} className="wb-preview" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WebsiteBuilder;