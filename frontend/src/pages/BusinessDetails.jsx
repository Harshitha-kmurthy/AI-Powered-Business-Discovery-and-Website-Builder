import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

const pinIcon = L.divIcon({
  className: "",
  html: `<svg width="28" height="38" viewBox="0 0 28 38" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 9.8 14 24 14 24S28 23.8 28 14C28 6.3 21.7 0 14 0z" fill="#4f8ef7"/>
    <circle cx="14" cy="14" r="5.5" fill="#080c14"/>
  </svg>`,
  iconSize: [28, 38], iconAnchor: [14, 38], popupAnchor: [0, -36],
});

const IconBack  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
const IconPhone = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>;
const IconWeb   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></svg>;
const IconPin   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-7.2-7-12a7 7 0 1 1 14 0c0 4.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>;
const IconClock = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>;
const IconImg   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>;

function stars(r) {
  const n = Math.min(5, Math.round(parseFloat(r) || 0));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export default function BusinessDetails() {
  const navigate = useNavigate();
  const [imgIdx, setImgIdx] = useState(0);

  const [biz] = useState(() => {
    try { return JSON.parse(localStorage.getItem("selectedBusiness") || "null"); }
    catch { return null; }
  });

  if (!biz) {
    return (
      <div style={S.page}>
        <div style={S.emptyState}>
          <div style={S.emptyIcon}>🧭</div>
          <h2 style={{ color:"#eef1f8", marginBottom:"0.5rem" }}>No business selected</h2>
          <p style={{ color:"#4a5a7a", marginBottom:"1.5rem" }}>Pick a business from the results to see its full profile.</p>
          <button style={S.backBtn} onClick={() => navigate("/")}>← Back to results</button>
        </div>
      </div>
    );
  }

  const lat = parseFloat(biz.lat);
  const lon = parseFloat(biz.lon);
  const hasLoc = !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
  const images = Array.isArray(biz.images) ? biz.images : [];
  const mapUrl = biz.map || biz.location_link || null;

  const hoursStyle = biz.hours
    ? biz.hours.toLowerCase().includes("open") ? S.hoursOpen
    : biz.hours.toLowerCase().includes("close") ? S.hoursClosed
    : S.hoursUnknown
    : null;

  return (
    <div style={S.page}>
      {/* ── Header bar ── */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logo} onClick={() => navigate("/")} role="button" tabIndex={0} onKeyDown={e => e.key==="Enter" && navigate("/")}>
            <div style={S.logoMark}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-5.8-8-12a8 8 0 0 1 16 0c0 6.2-8 12-8 12z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <span style={S.logoText}>Map<span style={{ color:"#4f8ef7" }}>Scrape</span></span>
          </div>
        </div>
      </header>

      <main style={S.main}>
        <button style={S.backBtn} onClick={() => navigate("/")}>
          <IconBack /> Back to results
        </button>

        {/* ── Business name block ── */}
        <div style={S.nameBlock}>
          <div style={S.nameMeta}>
            {biz.category && <span style={S.catPill}>{biz.category}</span>}
          </div>
          <h1 style={S.bizName}>{biz.name || "Unknown"}</h1>
          {biz.rating && (
            <div style={S.ratingRow}>
              <span style={S.starsStr}>{stars(biz.rating)}</span>
              <span style={S.ratingNum}>{biz.rating}</span>
              {biz.reviews && <span style={S.reviewPill}>{biz.reviews} reviews</span>}
            </div>
          )}
        </div>

        {/* ── Image gallery ── */}
        {images.length > 0 && (
          <div style={S.galleryCard}>
            <div style={S.cardEyebrow}><IconImg /> Photos</div>
            <div style={S.gallery}>
              {/* Main image */}
              <div style={S.mainImgWrap}>
                <img src={images[imgIdx]} alt={biz.name} style={S.mainImg}
                  onError={e => { e.target.src = ""; e.target.style.display = "none"; }} />
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div style={S.thumbRow}>
                  {images.map((src, i) => (
                    <div key={i} style={{ ...S.thumb, ...(i === imgIdx ? S.thumbActive : {}) }}
                      onClick={() => setImgIdx(i)}>
                      <img src={src} alt="" style={S.thumbImg}
                        onError={e => { e.target.parentElement.style.display = "none"; }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Content grid ── */}
        <div style={S.grid}>

          {/* Details card */}
          <div style={S.card}>
            <div style={S.cardEyebrow}>Contact & Info</div>
            <ul style={S.detailList}>

              <li style={S.detailItem}>
                <div style={S.detailIcon}><IconPin /></div>
                <div>
                  <p style={S.detailLabel}>Address</p>
                  <p style={S.detailValue}>{biz.address || <em style={{ color:"#2d3a52" }}>Not provided</em>}</p>
                </div>
              </li>

              <li style={S.detailItem}>
                <div style={S.detailIcon}><IconPhone /></div>
                <div>
                  <p style={S.detailLabel}>Phone</p>
                  <p style={S.detailValue}>
                    {biz.phone
                      ? <a href={`tel:${biz.phone}`} style={S.phoneLink}>{biz.phone}</a>
                      : <em style={{ color:"#2d3a52" }}>Not available</em>}
                  </p>
                </div>
              </li>

              <li style={S.detailItem}>
                <div style={S.detailIcon}><IconWeb /></div>
                <div>
                  <p style={S.detailLabel}>Website</p>
                  <p style={S.detailValue}>
                    {biz.website
                      ? <a href={biz.website} target="_blank" rel="noopener" style={S.webLink}>
                          {(() => { try { return new URL(biz.website).hostname; } catch { return biz.website; } })()}
                        </a>
                      : <em style={{ color:"#2d3a52" }}>No website</em>}
                  </p>
                </div>
              </li>

              <li style={S.detailItem}>
                <div style={S.detailIcon}><IconClock /></div>
                <div>
                  <p style={S.detailLabel}>Hours</p>
                  <p style={S.detailValue}>
                    {biz.hours
                      ? <span style={hoursStyle}>{biz.hours}</span>
                      : <em style={{ color:"#2d3a52" }}>Not available</em>}
                  </p>
                </div>
              </li>

              {hasLoc && (
                <li style={S.detailItem}>
                  <div style={S.detailIcon}>🧭</div>
                  <div>
                    <p style={S.detailLabel}>Coordinates</p>
                    <p style={{ ...S.detailValue, fontFamily:"monospace", fontSize:"0.8rem" }}>
                      {lat.toFixed(6)}, {lon.toFixed(6)}
                    </p>
                  </div>
                </li>
              )}

              {/* Image URLs row */}
              {images.length > 0 && (
                <li style={S.detailItem}>
                  <div style={S.detailIcon}><IconImg /></div>
                  <div style={{ flex:1 }}>
                    <p style={S.detailLabel}>Image URLs ({images.length})</p>
                    <div style={S.urlList}>
                      {images.map((url, i) => (
                        <a key={i} href={url} target="_blank" rel="noopener" style={S.urlChip}>
                          Image {i+1} ↗
                        </a>
                      ))}
                    </div>
                  </div>
                </li>
              )}

            </ul>
          </div>

          {/* Map card */}
          <div style={S.card}>
            <div style={S.cardEyebrow}>Location</div>

            {hasLoc ? (
              <>
                <span style={S.coordChip}>{lat.toFixed(4)}, {lon.toFixed(4)}</span>
                <div style={S.mapWrap}>
                  <MapContainer center={[lat, lon]} zoom={15} scrollWheelZoom={false}
                    style={{ height:"100%", width:"100%", minHeight:300 }}>
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    />
                    <Marker position={[lat, lon]} icon={pinIcon}>
                      <Popup><strong>{biz.name}</strong>{biz.address && <><br/>{biz.address}</>}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
                {mapUrl && (
                  <a href={mapUrl} target="_blank" rel="noopener" style={S.gmapsBtn}>
                    📍 Open in Google Maps
                  </a>
                )}
              </>
            ) : (
              <div style={S.mapEmpty}>
                <span style={{ fontSize:"2.5rem" }}>📍</span>
                <p style={{ color:"#2d3a52", fontSize:"0.88rem" }}>
                  {mapUrl
                    ? <><a href={mapUrl} target="_blank" rel="noopener" style={S.webLink}>Open in Google Maps →</a></>
                    : "Coordinates not available for this business."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */
const S = {
  page: { minHeight:"100vh", background:"#080c14", fontFamily:"'Inter',sans-serif", color:"#dde3ee" },

  header: { background:"#0d1120", borderBottom:"1px solid #1c2540", padding:"0 2rem", position:"sticky", top:0, zIndex:100 },
  headerInner: { maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", height:56 },
  logo: { display:"flex", alignItems:"center", gap:"0.5rem", cursor:"pointer", fontWeight:700, fontSize:"1rem" },
  logoMark: { width:28, height:28, background:"linear-gradient(135deg,#4f8ef7,#38d9a9)", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center" },
  logoText: { color:"#dde3ee" },

  main: { maxWidth:1200, margin:"0 auto", padding:"2rem 2rem 5rem" },

  backBtn: { display:"inline-flex", alignItems:"center", gap:"0.4rem", background:"transparent", border:"1.5px solid #1c2540", color:"#5a6888", fontFamily:"Inter,sans-serif", fontSize:"0.83rem", padding:"0.4rem 0.9rem", borderRadius:7, cursor:"pointer", marginBottom:"1.75rem" },

  nameBlock: { marginBottom:"1.75rem" },
  nameMeta: { marginBottom:"0.5rem" },
  catPill: { display:"inline-block", background:"rgba(79,142,247,0.1)", color:"#4f8ef7", border:"1px solid rgba(79,142,247,0.2)", padding:"3px 12px", borderRadius:20, fontSize:"0.75rem", fontWeight:500 },
  bizName: { fontSize:"clamp(1.5rem,3vw,2.2rem)", fontWeight:700, letterSpacing:"-0.03em", color:"#eef1f8", margin:"0 0 0.5rem" },
  ratingRow: { display:"flex", alignItems:"center", gap:"0.65rem", flexWrap:"wrap" },
  starsStr: { color:"#f5a31a", fontSize:"1rem", letterSpacing:1 },
  ratingNum: { fontSize:"1.1rem", fontWeight:700, color:"#eef1f8" },
  reviewPill: { background:"#0d1120", border:"1px solid #1c2540", color:"#4a5a7a", padding:"2px 10px", borderRadius:20, fontSize:"0.8rem" },

  // Gallery
  galleryCard: { background:"#0d1120", border:"1px solid #1c2540", borderRadius:12, padding:"1.25rem 1.5rem", marginBottom:"1.5rem" },
  gallery: { marginTop:"0.85rem" },
  mainImgWrap: { width:"100%", height:300, borderRadius:8, overflow:"hidden", background:"#080c14", marginBottom:"0.75rem" },
  mainImg: { width:"100%", height:"100%", objectFit:"cover", display:"block" },
  thumbRow: { display:"flex", gap:"0.5rem", flexWrap:"wrap" },
  thumb: { width:72, height:56, borderRadius:6, overflow:"hidden", cursor:"pointer", border:"2px solid transparent", transition:"border-color 0.15s" },
  thumbActive: { border:"2px solid #4f8ef7" },
  thumbImg: { width:"100%", height:"100%", objectFit:"cover" },

  grid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" },

  card: { background:"#0d1120", border:"1px solid #1c2540", borderRadius:12, padding:"1.25rem 1.5rem" },
  cardEyebrow: { display:"flex", alignItems:"center", gap:"0.4rem", fontSize:"0.68rem", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", color:"#3d4e6a", marginBottom:"1rem" },

  detailList: { listStyle:"none", padding:0, margin:0, display:"flex", flexDirection:"column", gap:"0.9rem" },
  detailItem: { display:"flex", gap:"0.7rem", alignItems:"flex-start" },
  detailIcon: { width:32, height:32, background:"rgba(79,142,247,0.08)", border:"1px solid rgba(79,142,247,0.15)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", color:"#4f8ef7", flexShrink:0 },
  detailLabel: { fontSize:"0.7rem", color:"#3d4e6a", margin:"0 0 2px", textTransform:"uppercase", letterSpacing:"0.06em" },
  detailValue: { fontSize:"0.88rem", color:"#bdc8dc", margin:0, lineHeight:1.45 },
  phoneLink: { color:"#38d9a9", textDecoration:"none", fontWeight:500 },
  webLink: { color:"#4f8ef7", textDecoration:"none" },

  hoursOpen:    { background:"rgba(56,217,169,0.1)", color:"#38d9a9", border:"1px solid rgba(56,217,169,0.2)", padding:"2px 8px", borderRadius:20, fontSize:"0.73rem", fontWeight:500 },
  hoursClosed:  { background:"rgba(240,80,80,0.1)", color:"#e05555", border:"1px solid rgba(240,80,80,0.2)", padding:"2px 8px", borderRadius:20, fontSize:"0.73rem", fontWeight:500 },
  hoursUnknown: { background:"rgba(74,90,122,0.12)", color:"#4a5a7a", border:"1px solid rgba(74,90,122,0.2)", padding:"2px 8px", borderRadius:20, fontSize:"0.73rem", fontWeight:500 },

  urlList: { display:"flex", flexWrap:"wrap", gap:"0.4rem", marginTop:"0.3rem" },
  urlChip: { display:"inline-block", background:"rgba(79,142,247,0.08)", color:"#4f8ef7", border:"1px solid rgba(79,142,247,0.15)", padding:"2px 8px", borderRadius:6, fontSize:"0.73rem", textDecoration:"none" },

  coordChip: { display:"inline-block", fontFamily:"monospace", fontSize:"0.73rem", color:"#4a5a7a", background:"#080c14", border:"1px solid #1c2540", borderRadius:5, padding:"3px 9px", marginBottom:"0.75rem" },
  mapWrap: { flex:1, minHeight:300, borderRadius:8, overflow:"hidden", border:"1px solid #1c2540" },
  mapEmpty: { minHeight:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0.6rem", border:"1px dashed #1c2540", borderRadius:8 },
  gmapsBtn: { display:"inline-flex", alignItems:"center", gap:5, marginTop:"0.75rem", fontSize:"0.82rem", color:"#4f8ef7", textDecoration:"none", background:"rgba(79,142,247,0.08)", border:"1px solid rgba(79,142,247,0.18)", padding:"5px 12px", borderRadius:7 },

  emptyState: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", textAlign:"center", padding:"2rem" },
  emptyIcon: { fontSize:"3rem", marginBottom:"1rem" },
};