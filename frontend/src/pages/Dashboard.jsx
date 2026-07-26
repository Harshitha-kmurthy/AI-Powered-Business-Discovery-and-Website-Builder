// Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

/* ─── Inline SVG icons ─────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
);
const IconDownload = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
);
const IconArrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);
const IconMap = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></svg>
);
const IconGlobe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
);
const IconSparkle = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" /></svg>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState("");
  const [location, setLocation] = useState("");
  const [max, setMax] = useState("15");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [filter, setFilter] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const onKey = (e) => { if (e.key === "Enter") doSearch(); };

  async function doSearch() {
    if (!business.trim() || !location.trim()) {
      setStatus({ msg: "Enter both a business type and a location.", type: "error" });
      return;
    }
    setLoading(true); setData([]); setFilter("");
    setStatus({ msg: `Scraping "${business}" in "${location}" — hang tight, 30–90 s…`, type: "info" });
    try {
      const res = await API.post("/business/search", {
        business: business.trim(), location: location.trim(), max: parseInt(max),
      });
      const results = res.data.results || [];
      setData(results);
      setStatus(results.length
        ? { msg: `Found ${results.length} businesses in "${location}"`, type: "success" }
        : { msg: "No results. Try a different search term.", type: "error" });
    } catch {
      setStatus({ msg: "Search failed — is the server running?", type: "error" });
    } finally { setLoading(false); }
  }

  function openDetails(item) {
    localStorage.setItem("selectedBusiness", JSON.stringify(item));
    navigate(`/business/${encodeURIComponent(item.name || "unknown")}`);
  }

  function exportCSV() {
    if (!data.length) return;
    const cols = ["name", "category", "rating", "reviews", "phone", "address", "website", "hours", "lat", "lon", "map", "images"];
    const rows = [cols.join(","), ...data.map(r =>
      cols.map(c => {
        const v = r[c];
        const str = Array.isArray(v) ? v.join("|") : (v || "");
        return `"${str.toString().replace(/"/g, '""')}"`;
      }).join(",")
    )];
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" })),
      download: `gmaps_${business}_${Date.now()}.csv`,
    });
    a.click();
  }

  const filtered = filter.trim()
    ? data.filter(r => JSON.stringify(r).toLowerCase().includes(filter.toLowerCase()))
    : data;

  const withPhone = data.filter(x => x.phone).length;
  const withWebsite = data.filter(x => x.website).length;
  const withImages = data.filter(x => x.images && x.images.length > 0).length;
  const ratings = data.filter(x => x.rating).map(x => parseFloat(x.rating));
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes shimmer {
      0% { background-position: -1000px 0; }
      100% { background-position: 1000px 0; }
    }
    @keyframes gradientShift {
      0%, 100% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
    }
    @keyframes float {
      0%, 100% { transform: translate(0,0); }
      50% { transform: translate(30px, -40px); }
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(79,142,247,0.5); }
      50% { box-shadow: 0 0 0 12px rgba(79,142,247,0); }
    }
    @keyframes slideDown { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }
    @keyframes rowIn { from { opacity:0; transform: translateX(-10px); } to { opacity:1; transform: translateX(0); } }

    .ms-page { position: relative; overflow-x: hidden; }
    .ms-orb {
      position: fixed; border-radius: 50%; filter: blur(80px);
      pointer-events: none; opacity: 0.35; z-index: 0;
    }
    .ms-orb-1 { width: 500px; height: 500px; background: #4f8ef7; top: -150px; left: -150px; animation: float 18s ease-in-out infinite; }
    .ms-orb-2 { width: 420px; height: 420px; background: #38d9a9; bottom: -120px; right: -120px; animation: float 22s ease-in-out infinite reverse; }
    .ms-orb-3 { width: 350px; height: 350px; background: #a855f7; top: 40%; left: 60%; opacity: 0.15; animation: float 25s ease-in-out infinite; }

    .ms-logo-mark {
      background-size: 200% 200%;
      animation: gradientShift 6s ease infinite;
      box-shadow: 0 4px 20px rgba(79,142,247,0.4);
    }
    .ms-badge-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #38d9a9;
      display: inline-block; margin-right: 6px; animation: pulse 2s infinite;
    }
    .ms-hero-title .ms-heroGrad {
      background-size: 200% 200%;
      animation: gradientShift 5s ease infinite;
    }
    .ms-input, .ms-select {
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    }
    .ms-input:focus, .ms-select:focus {
      border-color: #4f8ef7 !important;
      box-shadow: 0 0 0 4px rgba(79,142,247,0.15);
    }
    .ms-btn-primary {
      position: relative; overflow: hidden;
      transition: transform 0.15s, box-shadow 0.2s;
      box-shadow: 0 4px 14px rgba(79,142,247,0.35);
    }
    .ms-btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(79,142,247,0.5);
    }
    .ms-btn-primary:active:not(:disabled) { transform: translateY(0); }
    .ms-btn-primary::before {
      content: ""; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
      transition: left 0.6s;
    }
    .ms-btn-primary:hover::before { left: 100%; }
    .ms-btn-ghost { transition: border-color 0.2s, color 0.2s, transform 0.15s; }
    .ms-btn-ghost:hover { border-color: #4f8ef7; color: #4f8ef7; transform: translateY(-1px); }

    .ms-stat-chip {
      transition: transform 0.2s, border-color 0.2s, background 0.2s;
      animation: fadeUp 0.5s ease both;
    }
    .ms-stat-chip:hover { transform: translateY(-3px); border-color: #4f8ef7; }

    .ms-row { animation: rowIn 0.35s ease both; }
    .ms-row:hover { background: rgba(79,142,247,0.06) !important; }
    .ms-name-link { transition: color 0.15s; }
    .ms-name-link:hover { color: #38d9a9 !important; }
    .ms-build-btn {
      transition: transform 0.15s, box-shadow 0.2s;
      box-shadow: 0 3px 10px rgba(56,217,169,0.3);
    }
    .ms-build-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(56,217,169,0.45); }
    .ms-map-badge { transition: background 0.2s, transform 0.15s; }
    .ms-map-badge:hover { background: rgba(79,142,247,0.2) !important; transform: translateY(-1px); }

    .ms-fade-up { animation: fadeUp 0.6s ease both; }
    .ms-fade-in { animation: fadeIn 0.5s ease both; }
    .ms-status { animation: slideDown 0.3s ease both; }

    .ms-loading-bar {
      height: 2px; background: linear-gradient(90deg, transparent, #4f8ef7, transparent);
      background-size: 1000px 100%;
      animation: shimmer 1.6s linear infinite;
      border-radius: 2px; margin-top: 8px;
    }

    @media (max-width: 780px) {
      .ms-form-grid { grid-template-columns: 1fr !important; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={S.page} className="ms-page">
        <div className="ms-orb ms-orb-1" />
        <div className="ms-orb ms-orb-2" />
        <div className="ms-orb ms-orb-3" />

        {/* Header */}
        <header style={S.header}>
          <div style={S.headerInner}>
            <div style={S.logo}>
              <div style={S.logoMark} className="ms-logo-mark">
                <IconGlobe />
              </div>
              <span style={S.logoText}>MapScrape</span>
            </div>
            <div style={S.headerBadge}>
              <span className="ms-badge-dot" />
              Playwright · Google Maps
            </div>
          </div>
        </header>

        <main style={S.main}>
          {/* Hero */}
          <section style={S.hero} className="ms-fade-up">
            <div style={S.heroEyebrow}>
              <IconSparkle /> &nbsp;Business Intelligence Tool
            </div>
            <h1 style={S.heroTitle} className="ms-hero-title">
              Turn Maps into{" "}
              <span style={S.heroGrad} className="ms-heroGrad">Business Opportunities</span>
            </h1>
            <p style={S.heroSub}>
              Enter a business type and city to extract contact info, ratings, coordinates, images and more.
            </p>
          </section>

          {/* Search card */}
          <section style={S.searchCard} className="ms-fade-up" >
            <div style={S.formGrid} className="ms-form-grid">
              <div style={S.field}>
                <label style={S.label}>Business type</label>
                <input style={S.input} className="ms-input" value={business}
                  placeholder="e.g. coffee shop"
                  onChange={e => setBusiness(e.target.value)} onKeyDown={onKey} />
              </div>
              <div style={S.field}>
                <label style={S.label}>City / location</label>
                <input style={S.input} className="ms-input" value={location}
                  placeholder="e.g. San Francisco"
                  onChange={e => setLocation(e.target.value)} onKeyDown={onKey} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Max results</label>
                <select style={S.select} className="ms-select" value={max} onChange={e => setMax(e.target.value)}>
                  {["5", "10", "15", "20", "25"].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div style={{ ...S.field, justifyContent: "flex-end" }}>
                <label style={{ ...S.label, visibility: "hidden" }}>Go</label>
                <button style={S.btnPrimary} className="ms-btn-primary" onClick={doSearch} disabled={loading}>
                  {loading ? <><span style={S.spinner} /> Searching…</> : <><IconSearch /> Search</>}
                </button>
              </div>
            </div>

            {status && (
              <div style={{
                ...S.statusBar,
                ...(status.type === "error" ? S.statusError : status.type === "success" ? S.statusSuccess : S.statusInfo),
              }} className="ms-status">
                {loading && <span style={S.spinner} />}
                <span>{status.msg}</span>
              </div>
            )}
            {loading && <div className="ms-loading-bar" />}
          </section>

          {/* Stats */}
          {data.length > 0 && (
            <div style={S.statsRow}>
              {[
                ["🏢", data.length, "businesses"],
                ["📞", withPhone, "with phone"],
                ["🌐", withWebsite, "with website"],
                ["🖼️", withImages, "with images"],
                ["⭐", avgRating, "avg rating"],
              ].map(([icon, val, label], i) => (
                <div key={label} style={{ ...S.statChip, animationDelay: `${i * 60}ms` }} className="ms-stat-chip">
                  <span style={S.statIcon}>{icon}</span>
                  <span style={S.statVal}>{val}</span>
                  <span style={S.statLabel}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          {data.length > 0 && (
            <section className="ms-fade-up">
              <div style={S.toolbar}>
                <div style={S.toolbarTitle}>
                  "{business}" in {location}
                </div>
                <div style={S.toolbarRight}>
                  <input style={S.filterInput} className="ms-input" placeholder="Filter results…"
                    value={filter} onChange={e => setFilter(e.target.value)} />
                  <button style={S.btnGhost} className="ms-btn-ghost" onClick={exportCSV}>
                    <IconDownload /> Export CSV
                  </button>
                </div>
              </div>

              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      {["#", "Name", "Category", "Rating", "Reviews", "Phone", "Address", "Website", "Hours", "Map", "Website Builder"].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={11} style={{ ...S.td, textAlign: "center", padding: "2rem", color: "#4a5a7a" }}>
                          No results match your filter.
                        </td>
                      </tr>
                    ) : filtered.map((r, i) => (
                      <tr key={i} style={{ ...S.tr, animationDelay: `${i * 30}ms` }} className="ms-row">
                        <td style={{ ...S.td, ...S.tdNum }}>{i + 1}</td>
                        <td style={{ ...S.td, ...S.tdName }}>
                          <span style={S.nameLink} className="ms-name-link" onClick={() => openDetails(r)}>
                            {r.name || "—"}
                          </span>
                        </td>
                        <td style={S.td}>
                          {r.category ? <span style={S.catBadge}>{r.category}</span> : <span style={S.empty}>—</span>}
                        </td>
                        <td style={S.td}>
                          {r.rating ? (
                            <div style={S.ratingCell}>
                              <span style={S.star}>★</span>
                              <span style={S.ratingNum}>{r.rating}</span>
                            </div>
                          ) : <span style={S.empty}>—</span>}
                        </td>
                        <td style={S.td}>
                          {r.reviews ? <span style={S.reviewCount}>{r.reviews}</span> : <span style={S.empty}>—</span>}
                        </td>
                        <td style={S.td}>
                          {r.phone ? <a href={`tel:${r.phone}`} style={S.phoneLink}>{r.phone}</a> : <span style={S.empty}>—</span>}
                        </td>
                        <td style={{ ...S.td, ...S.addrCell }}>
                          {r.address || <span style={S.empty}>—</span>}
                        </td>
                        <td style={S.td}>
                          {r.website
                            ? (() => { try { return <a href={r.website} target="_blank" rel="noreferrer" style={S.webLink}>{new URL(r.website).hostname}</a>; } catch { return <a href={r.website} target="_blank" rel="noreferrer" style={S.webLink}>Visit</a>; } })()
                            : <span style={S.empty}>—</span>}
                        </td>
                        <td style={S.td}>
                          {r.hours
                            ? <span style={/open/i.test(r.hours) ? S.hoursOpen : /clos/i.test(r.hours) ? S.hoursClosed : S.hoursUnknown}>{r.hours}</span>
                            : <span style={S.empty}>—</span>}
                        </td>
                        <td style={S.td}>
                          {(r.map || r.location_link)
                            ? <a href={r.map || r.location_link} target="_blank" rel="noreferrer" style={S.mapBadge} className="ms-map-badge">
                                <IconMap /> View
                              </a>
                            : <span style={S.empty}>—</span>}
                        </td>
                        <td style={S.td}>
                          <button style={S.buildBtn} className="ms-build-btn"
                            onClick={() => navigate("/website-builder", { state: { business: r } })}>
                            Build <IconArrow />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filter && (
                <div style={{ marginTop: "0.6rem", fontSize: "0.78rem", color: "#4a5a7a", textAlign: "right" }}>
                  Showing {filtered.length} of {data.length} results
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </>
  );
}

/* ─── Styles ───────────────────────────────────────────────────── */
const S = {
  page: { minHeight: "100vh", background: "#080c14", fontFamily: "'Inter',sans-serif", color: "#dde3ee" },
  header: { background: "rgba(13,17,32,0.7)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderBottom: "1px solid #1c2540", padding: "0 2rem", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", height: 58 },
  logo: { display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.02em" },
  logoMark: { width: 30, height: 30, background: "linear-gradient(135deg,#4f8ef7,#38d9a9,#a855f7)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" },
  logoText: { color: "#dde3ee" },
  headerBadge: { marginLeft: "auto", fontSize: "0.7rem", color: "#38d9a9", background: "rgba(56,217,169,0.08)", border: "1px solid rgba(56,217,169,0.2)", padding: "3px 10px 3px 8px", borderRadius: 20, fontWeight: 500, display: "inline-flex", alignItems: "center" },

  main: { maxWidth: 1400, margin: "0 auto", padding: "2.5rem 2rem 4rem", position: "relative", zIndex: 1 },

  hero: { textAlign: "center", marginBottom: "2.25rem" },
  heroEyebrow: { fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4f8ef7", marginBottom: "0.75rem", display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 12px", background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.2)", borderRadius: 20 },
  heroTitle: { fontSize: "clamp(1.9rem,4vw,2.9rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, margin: "0 0 0.75rem", color: "#eef1f8" },
  heroGrad: { background: "linear-gradient(90deg,#4f8ef7,#38d9a9,#a855f7,#4f8ef7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroSub: { color: "#5a6888", fontSize: "0.98rem", maxWidth: 560, margin: "0 auto", lineHeight: 1.55 },

  searchCard: { background: "rgba(13,17,32,0.8)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid #1c2540", borderRadius: 16, padding: "1.75rem 2rem", marginBottom: "1.5rem", boxShadow: "0 20px 60px -20px rgba(0,0,0,0.5)" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr auto auto", gap: "1rem", alignItems: "end" },
  field: { display: "flex", flexDirection: "column", minHeight: 64 },
  label: { fontSize: "0.7rem", fontWeight: 600, color: "#4a5a7a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.4rem", lineHeight: 1, height: 12 },
  input: { background: "#080c14", border: "1.5px solid #1c2540", borderRadius: 8, padding: "0.65rem 0.9rem", color: "#dde3ee", fontFamily: "Inter,sans-serif", fontSize: "0.9rem", outline: "none", height: 42, boxSizing: "border-box", width: "100%" },
  select: { background: "#080c14", border: "1.5px solid #1c2540", borderRadius: 8, padding: "0.65rem 0.9rem", color: "#dde3ee", fontFamily: "Inter,sans-serif", fontSize: "0.9rem", outline: "none", height: 42, boxSizing: "border-box" },
  btnPrimary: { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", padding: "0.65rem 1.4rem", height: 42, borderRadius: 8, background: "linear-gradient(135deg,#4f8ef7,#3370d4)", color: "#fff", fontFamily: "Inter,sans-serif", fontSize: "0.88rem", fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 0.9rem", borderRadius: 7, background: "transparent", border: "1.5px solid #1c2540", color: "#5a6888", fontFamily: "Inter,sans-serif", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },

  spinner: { display: "inline-block", width: 13, height: 13, border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" },

  statusBar: { display: "flex", alignItems: "center", gap: "0.65rem", marginTop: "1rem", padding: "0.7rem 1rem", borderRadius: 8, fontSize: "0.86rem" },
  statusInfo: { background: "rgba(79,142,247,0.07)", border: "1px solid rgba(79,142,247,0.18)", color: "#4f8ef7" },
  statusError: { background: "rgba(240,80,80,0.07)", border: "1px solid rgba(240,80,80,0.2)", color: "#e05555" },
  statusSuccess: { background: "rgba(56,217,169,0.07)", border: "1px solid rgba(56,217,169,0.18)", color: "#38d9a9" },

  statsRow: { display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.25rem" },
  statChip: { background: "rgba(13,17,32,0.8)", border: "1px solid #1c2540", borderRadius: 8, padding: "0.5rem 0.95rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "default" },
  statIcon: { fontSize: "0.95rem" },
  statVal: { color: "#dde3ee", fontWeight: 700 },
  statLabel: { color: "#4a5a7a" },

  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.7rem", marginBottom: "0.75rem" },
  toolbarTitle: { fontWeight: 600, fontSize: "0.92rem", color: "#8a9ab8" },
  toolbarRight: { display: "flex", gap: "0.5rem", alignItems: "center" },
  filterInput: { background: "#0d1120", border: "1.5px solid #1c2540", borderRadius: 7, padding: "0.45rem 0.8rem", color: "#dde3ee", fontFamily: "Inter,sans-serif", fontSize: "0.82rem", outline: "none", width: 190, height: "auto" },

  tableWrap: { border: "1px solid #1c2540", borderRadius: 12, overflowX: "auto", background: "rgba(13,17,32,0.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" },
  th: { background: "#080c14", color: "#3d4e6a", fontWeight: 600, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0.8rem 0.9rem", textAlign: "left", borderBottom: "1px solid #1c2540", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #111827", transition: "background 0.15s" },
  td: { padding: "0.75rem 0.9rem", verticalAlign: "middle", color: "#bdc8dc" },
  tdNum: { color: "#2d3a52", fontSize: "0.75rem", fontWeight: 600, width: 36, textAlign: "center" },
  tdName: { minWidth: 150, maxWidth: 200 },

  nameLink: { color: "#4f8ef7", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" },
  catBadge: { display: "inline-block", background: "rgba(79,142,247,0.1)", color: "#4f8ef7", border: "1px solid rgba(79,142,247,0.2)", padding: "2px 8px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 500, whiteSpace: "nowrap" },
  ratingCell: { display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" },
  star: { color: "#f5a31a", fontSize: "0.82rem" },
  ratingNum: { fontWeight: 600, color: "#dde3ee" },
  reviewCount: { color: "#4a5a7a", fontSize: "0.77rem" },
  phoneLink: { color: "#38d9a9", textDecoration: "none", fontWeight: 500, fontSize: "0.83rem", whiteSpace: "nowrap" },
  addrCell: { minWidth: 150, maxWidth: 210, color: "#4a5a7a", fontSize: "0.8rem", lineHeight: 1.4 },
  webLink: { color: "#4f8ef7", textDecoration: "none", fontSize: "0.8rem" },
  hoursOpen: { background: "rgba(56,217,169,0.1)", color: "#38d9a9", border: "1px solid rgba(56,217,169,0.2)", padding: "2px 8px", borderRadius: 20, fontSize: "0.73rem", fontWeight: 500, whiteSpace: "nowrap" },
  hoursClosed: { background: "rgba(240,80,80,0.1)", color: "#e05555", border: "1px solid rgba(240,80,80,0.2)", padding: "2px 8px", borderRadius: 20, fontSize: "0.73rem", fontWeight: 500, whiteSpace: "nowrap" },
  hoursUnknown: { background: "rgba(74,90,122,0.15)", color: "#4a5a7a", border: "1px solid rgba(74,90,122,0.2)", padding: "2px 8px", borderRadius: 20, fontSize: "0.73rem", fontWeight: 500, whiteSpace: "nowrap" },
  mapBadge: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: "#4f8ef7", textDecoration: "none", background: "rgba(79,142,247,0.08)", border: "1px solid rgba(79,142,247,0.18)", padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap" },
  buildBtn: { display: "inline-flex", alignItems: "center", gap: 4, padding: "0.4rem 0.85rem", background: "linear-gradient(135deg,#38d9a9,#22a884)", color: "#062c22", border: "none", borderRadius: 6, fontSize: "0.77rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.01em" },
  empty: { color: "#2d3a52", fontSize: "0.77rem" },
};