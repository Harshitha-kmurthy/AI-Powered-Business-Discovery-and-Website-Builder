import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api";
import "./WebsiteBuilder.css";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 9.8 14 24 14 24S28 23.8 28 14C28 6.3 21.7 0 14 0z" fill="#2563eb"/>
    <circle cx="14" cy="14" r="5.5" fill="#ffffff"/>
  </svg>`,
  iconSize: [28, 38], iconAnchor: [14, 38], popupAnchor: [0, -36],
});

const IconPhone = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
const IconWeb   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></svg>;
const IconPin   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-7.2-7-12a7 7 0 1 1 14 0c0 4.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>;
const IconClock = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>;
const IconImg   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>;

function stars(r) {
  const n = Math.min(5, Math.round(parseFloat(r) || 0));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

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
      <div className="wb-error">
        <h2>No Business Selected</h2>
        <button onClick={() => navigate("/dashboard")}>
          Back To Dashboard
        </button>
      </div>
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
  images: Array.isArray(business.images) ? business.images.filter(Boolean) : []  // NEW
};

      const baseURL = API.defaults.baseURL || "";

      const response = await fetch(`${baseURL}/website/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok || !response.body) {
        throw new Error("Stream failed");
      }

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
    if (!generatedHtml) {
      alert("Generate website first");
      return;
    }

    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${business.name}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const editorValue = loading ? streamingHtml : generatedHtml;

  const handleEditorChange = (e) => {
    setGeneratedHtml(e.target.value);
  };

  return (
    <div className="wb-container">

      <div className="wb-header">
        <h1>AI Website Builder</h1>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </button>
      </div>

      {/* ── Business name block ── */}
      <div className="wb-name-block">
        {business.category && <span className="wb-cat-pill">{business.category}</span>}
        <h2 className="wb-biz-name">{business.name || "Unknown"}</h2>
        {business.rating && (
          <div className="wb-rating-row">
            <span className="wb-stars">{stars(business.rating)}</span>
            <span className="wb-rating-num">{business.rating}</span>
            {business.reviews && <span className="wb-review-pill">{business.reviews} reviews</span>}
          </div>
        )}
      </div>

      {/* ── Image gallery ── */}
     {/* ── Image gallery ── */}
{images.length > 0 && (
  <div className="business-card">
    <h3 className="wb-card-eyebrow"><IconImg /> Photos ({imgIdx + 1}/{images.length})</h3>

    <div className="wb-main-img-wrap">
      <img
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
          <button
            type="button"
            className="wb-img-nav wb-img-nav-prev"
            onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            type="button"
            className="wb-img-nav wb-img-nav-next"
            onClick={() => setImgIdx(i => (i + 1) % images.length)}
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      )}
    </div>

    {images.length > 1 && (
      <div className="wb-thumb-row">
        {images.map((src, i) => (
          <div
            key={i}
            className={`wb-thumb ${i === imgIdx ? "wb-thumb-active" : ""}`}
            onClick={() => setImgIdx(i)}
          >
            <img
              src={src}
              alt=""
              className="wb-thumb-img"
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              loading="lazy"
              onError={e => { e.target.parentElement.style.display = "none"; }}
            />
          </div>
        ))}
      </div>
    )}
  </div>
)}

      {/* ── Details + Map grid ── */}
      <div className="wb-detail-grid">

        <div className="business-card">
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

            {hasLoc && (
              <li className="wb-record">
                <div className="wb-record-icon">🧭</div>
                <div>
                  <p className="wb-record-label">Coordinates</p>
                  <p className="wb-record-value wb-mono">{lat.toFixed(6)}, {lon.toFixed(6)}</p>
                </div>
              </li>
            )}

            {business.email && (
              <li className="wb-record">
                <div className="wb-record-icon">✉️</div>
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

        <div className="business-card">
          <h3 className="wb-card-eyebrow">Location</h3>

          {hasLoc ? (
            <>
              <span className="wb-coord-chip">{lat.toFixed(4)}, {lon.toFixed(4)}</span>
              <div className="wb-map-wrap">
                <MapContainer center={[lat, lon]} zoom={15} scrollWheelZoom={false}
                  style={{ height: "100%", width: "100%", minHeight: 260 }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <Marker position={[lat, lon]} icon={pinIcon}>
                    <Popup><strong>{business.name}</strong>{business.address && <><br />{business.address}</>}</Popup>
                  </Marker>
                </MapContainer>
              </div>
              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noopener" className="wb-gmaps-btn">
                  📍 Open in Google Maps
                </a>
              )}
            </>
          ) : (
            <div className="wb-map-empty">
              <span style={{ fontSize: "2.2rem" }}>📍</span>
              <p>
                {mapUrl
                  ? <a href={mapUrl} target="_blank" rel="noopener" className="wb-link">Open in Google Maps →</a>
                  : "Coordinates not available for this business."}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="action-bar">
        <button className="generate-btn" onClick={generateWebsite} disabled={loading}>
          {loading ? "Generating..." : "Generate Website"}
        </button>
        <button className="download-btn" onClick={downloadHTML}>
          Download HTML
        </button>
      </div>

      <div className="editor-preview">

        <div className="editor-panel">
          <h3>HTML Editor</h3>
          <textarea
            value={editorValue}
            onChange={handleEditorChange}
            style={{ width: "100%", height: "500px", fontFamily: "monospace" }}
          />
        </div>

        <div className="preview-panel">
          <h3>Live Preview</h3>
          <iframe
            title="preview"
            srcDoc={generatedHtml}
            style={{
              width: "100%",
              height: "600px",
              border: "1px solid #ddd",
              display: "block"
            }}
          />
        </div>

      </div>

    </div>
  );
}

export default WebsiteBuilder;