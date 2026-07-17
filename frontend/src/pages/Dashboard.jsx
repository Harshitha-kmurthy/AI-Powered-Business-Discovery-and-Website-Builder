import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

/* ─── tiny icon components ─────────────────────────────────────── */
const IconSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
const IconDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const IconArrow = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
const IconMap = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-7.2-7-12a7 7 0 1 1 14 0c0 4.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>;
const IconGlobe = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;

export default function Dashboard() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState("");
  const [location, setLocation] = useState("");
  const [max, setMax] = useState("15");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [filter, setFilter] = useState("");

  const onKey = e => { if (e.key === "Enter") doSearch(); };

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
    } catch (err) {
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

  return (
    <div style={S.page}>
      {/* ── Header ── */}
      <header style={S.header}>
        <div style={S.headerInner}>
          <div style={S.logo}>
            <div style={S.logoMark}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-5.8-8-12a8 8 0 0 1 16 0c0 6.2-8 12-8 12z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <span style={S.logoText}>Map<span style={{ color: "#4f8ef7" }}>Scrape</span></span>
          </div>
          <span style={S.headerBadge}>Playwright · Google Maps</span>
        </div>
      </header>

      <main style={S.main}>
        {/* ── Hero ── */}
        <div style={S.hero}>
          <div style={S.heroEyebrow}>Business Intelligence Tool</div>
          <h1 style={S.heroTitle}>
            Find businesses on{" "}
            <span style={S.heroGrad}>Google Maps</span>
          </h1>
          <p style={S.heroSub}>Enter a business type and city to extract contact info, ratings, coordinates, images and more.</p>
        </div>

        {/* ── Search card ── */}
        <div style={S.searchCard}>
          <div style={S.formGrid}>
            <div style={S.field}>
              <label style={S.label}>Business type</label>
              <input style={S.input} placeholder="gym, hospital, restaurant…" value={business}
                onChange={e => setBusiness(e.target.value)} onKeyDown={onKey} />
            </div>
            <div style={S.field}>
              <label style={S.label}>City / location</label>
              <input style={S.input} placeholder="Mysuru, Bengaluru, Mumbai…" value={location}
                onChange={e => setLocation(e.target.value)} onKeyDown={onKey} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Max results</label>
              <select style={S.select} value={max} onChange={e => setMax(e.target.value)}>
                {["5", "10", "15", "20", "25"].map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div style={{ ...S.field, justifyContent: "flex-start" }}>
              <label style={S.label}>&nbsp;</label>
              <button
                style={loading
                  ? { ...S.btnPrimary, opacity: 0.55, cursor: "not-allowed", height: 42, boxSizing: "border-box" }
                  : { ...S.btnPrimary, height: 42, boxSizing: "border-box" }}
                onClick={doSearch}
                disabled={loading}
              >
                {loading ? <><span style={S.spinner} />&nbsp;Searching…</> : <><IconSearch />&nbsp;&nbsp;Search</>}
              </button>
            </div>
          </div>

          {status && (
            <div style={{ ...S.statusBar, ...(status.type === "error" ? S.statusError : status.type === "success" ? S.statusSuccess : S.statusInfo) }}>
              {loading && <span style={S.spinner} />}
              {status.msg}
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        {data.length > 0 && (
          <div style={S.statsRow}>
            {[
              ["🏢", data.length, "businesses"],
              ["📞", withPhone, "with phone"],
              ["🌐", withWebsite, "with website"],
              ["🖼️", withImages, "with images"],
              ["⭐", avgRating, "avg rating"],
            ].map(([icon, val, label]) => (
              <div key={label} style={S.statChip}>
                <span style={S.statIcon}>{icon}</span>
                <span style={S.statVal}>{val}</span>
                <span style={S.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Table ── */}
        {data.length > 0 && (
          <div>
            <div style={S.toolbar}>
              <span style={S.toolbarTitle}>"{business}" in {location}</span>
              <div style={S.toolbarRight}>
                <input style={S.filterInput} placeholder="Filter results…" value={filter}
                  onChange={e => setFilter(e.target.value)} />
                <button style={S.btnGhost} onClick={exportCSV}>
                  <IconDownload />&nbsp; Export CSV
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
                    <tr><td colSpan={11} style={{ textAlign: "center", padding: "3rem", color: "#4a5568" }}>
                      No results match your filter.
                    </td></tr>
                  ) : filtered.map((r, i) => (
                    <tr key={i} style={S.tr}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(79,142,247,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>

                      <td style={{ ...S.td, ...S.tdNum }}>{i + 1}</td>

                      {/* Name — clickable */}
                      <td style={{ ...S.td, ...S.tdName }}>
                        <span style={S.nameLink} onClick={() => openDetails(r)}>{r.name || "—"}</span>
                      </td>

                      <td style={S.td}>
                        {r.category
                          ? <span style={S.catBadge}>{r.category}</span>
                          : <span style={S.empty}>—</span>}
                      </td>

                      <td style={S.td}>
                        {r.rating
                          ? <div style={S.ratingCell}>
                            <span style={S.star}>★</span>
                            <span style={S.ratingNum}>{r.rating}</span>
                          </div>
                          : <span style={S.empty}>—</span>}
                      </td>

                      <td style={S.td}>
                        {r.reviews
                          ? <span style={S.reviewCount}>{r.reviews}</span>
                          : <span style={S.empty}>—</span>}
                      </td>

                      <td style={S.td}>
                        {r.phone
                          ? <a href={`tel:${r.phone}`} style={S.phoneLink}>{r.phone}</a>
                          : <span style={S.empty}>—</span>}
                      </td>

                      <td style={{ ...S.td, ...S.addrCell }}>
                        {r.address || <span style={S.empty}>—</span>}
                      </td>

                      <td style={S.td}>
                        {r.website
                          ? (() => { try { return <a href={r.website} target="_blank" rel="noopener" style={S.webLink}>{new URL(r.website).hostname}</a>; } catch { return <a href={r.website} target="_blank" rel="noopener" style={S.webLink}>Visit</a>; } })()
                          : <span style={S.empty}>—</span>}
                      </td>

                      <td style={S.td}>
                        {r.hours
                          ? <span style={r.hours.toLowerCase().includes("open") ? S.hoursOpen : r.hours.toLowerCase().includes("close") ? S.hoursClosed : S.hoursUnknown}>
                            {r.hours}
                          </span>
                          : <span style={S.empty}>—</span>}
                      </td>

                      <td style={S.td}>
                        {(r.map || r.location_link)
                          ? <a href={r.map || r.location_link} target="_blank" rel="noopener" style={S.mapBadge}>
                            <IconMap /> View
                          </a>
                          : <span style={S.empty}>—</span>}
                      </td>

                      {/* Build Website */}
                      <td style={S.td}>
                        <button
                          style={S.buildBtn}
                          onClick={() => navigate("/website-builder", { state: { business: r } })}
                        >
                          <IconGlobe />&nbsp;Build&nbsp;<IconArrow />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filter && (
              <p style={{ marginTop: "0.6rem", fontSize: "0.8rem", color: "#4a5568" }}>
                Showing {filtered.length} of {data.length} results
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ─── Styles object ────────────────────────────────────────────── */
const S = {
  page: { minHeight: "100vh", background: "#080c14", fontFamily: "'Inter',sans-serif", color: "#dde3ee" },

  header: { background: "#0d1120", borderBottom: "1px solid #1c2540", padding: "0 2rem", position: "sticky", top: 0, zIndex: 100 },
  headerInner: { maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", height: 58 },
  logo: { display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.02em" },
  logoMark: { width: 30, height: 30, background: "linear-gradient(135deg,#4f8ef7,#38d9a9)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { color: "#dde3ee" },
  headerBadge: { marginLeft: "auto", fontSize: "0.7rem", color: "#38d9a9", background: "rgba(56,217,169,0.08)", border: "1px solid rgba(56,217,169,0.2)", padding: "3px 10px", borderRadius: 20, fontWeight: 500 },

  main: { maxWidth: 1400, margin: "0 auto", padding: "2.5rem 2rem 4rem" },

  hero: { textAlign: "center", marginBottom: "2.25rem" },
  heroEyebrow: { fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "#4f8ef7", marginBottom: "0.6rem" },
  heroTitle: { fontSize: "clamp(1.7rem,3.5vw,2.5rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.15, margin: "0 0 0.55rem", color: "#eef1f8" },
  heroGrad: { background: "linear-gradient(90deg,#4f8ef7,#38d9a9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  heroSub: { color: "#5a6888", fontSize: "0.95rem", maxWidth: 540, margin: "0 auto" },

  searchCard: { background: "#0d1120", border: "1px solid #1c2540", borderRadius: 14, padding: "1.75rem 2rem", marginBottom: "1.5rem" },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto auto",
    gap: "1rem",
    alignItems: "start",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    minHeight: 64,
  },
  label: {
    fontSize: "0.7rem",
    fontWeight: 600,
    color: "#4a5a7a",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "0.4rem",
    lineHeight: 1,
    height: 12,
  },
  input: {
    background: "#080c14",
    border: "1.5px solid #1c2540",
    borderRadius: 8,
    padding: "0.65rem 0.9rem",
    color: "#dde3ee",
    fontFamily: "Inter,sans-serif",
    fontSize: "0.9rem",
    outline: "none",
    height: 42,
    boxSizing: "border-box",
    width: "100%",
  },
  select: {
    background: "#080c14",
    border: "1.5px solid #1c2540",
    borderRadius: 8,
    padding: "0.65rem 0.9rem",
    color: "#dde3ee",
    fontFamily: "Inter,sans-serif",
    fontSize: "0.9rem",
    outline: "none",
    height: 42,
    boxSizing: "border-box",
  },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.65rem 1.3rem", borderRadius: 8, background: "linear-gradient(135deg,#4f8ef7,#3370d4)", color: "#fff", fontFamily: "Inter,sans-serif", fontSize: "0.88rem", fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.5rem 0.9rem", borderRadius: 7, background: "transparent", border: "1.5px solid #1c2540", color: "#5a6888", fontFamily: "Inter,sans-serif", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" },

  spinner: { display: "inline-block", width: 13, height: 13, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" },

  statusBar: { display: "flex", alignItems: "center", gap: "0.65rem", marginTop: "1rem", padding: "0.7rem 1rem", borderRadius: 8, fontSize: "0.86rem" },
  statusInfo: { background: "rgba(79,142,247,0.07)", border: "1px solid rgba(79,142,247,0.18)", color: "#4f8ef7" },
  statusError: { background: "rgba(240,80,80,0.07)", border: "1px solid rgba(240,80,80,0.2)", color: "#e05555" },
  statusSuccess: { background: "rgba(56,217,169,0.07)", border: "1px solid rgba(56,217,169,0.18)", color: "#38d9a9" },

  statsRow: { display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.25rem" },
  statChip: { background: "#0d1120", border: "1px solid #1c2540", borderRadius: 8, padding: "0.4rem 0.85rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" },
  statIcon: { fontSize: "0.9rem" },
  statVal: { color: "#dde3ee", fontWeight: 600 },
  statLabel: { color: "#4a5a7a" },

  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.7rem", marginBottom: "0.75rem" },
  toolbarTitle: { fontWeight: 600, fontSize: "0.92rem", color: "#8a9ab8" },
  toolbarRight: { display: "flex", gap: "0.5rem", alignItems: "center" },
  filterInput: { background: "#0d1120", border: "1.5px solid #1c2540", borderRadius: 7, padding: "0.45rem 0.8rem", color: "#dde3ee", fontFamily: "Inter,sans-serif", fontSize: "0.82rem", outline: "none", width: 190 },

  tableWrap: { border: "1px solid #1c2540", borderRadius: 12, overflowX: "auto", background: "#0d1120" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" },
  th: { background: "#080c14", color: "#3d4e6a", fontWeight: 600, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0.8rem 0.9rem", textAlign: "left", borderBottom: "1px solid #1c2540", whiteSpace: "nowrap" },
  tr: { borderBottom: "1px solid #111827", transition: "background 0.1s" },
  td: { padding: "0.75rem 0.9rem", verticalAlign: "middle", color: "#bdc8dc" },
  tdNum: { color: "#2d3a52", fontSize: "0.75rem", fontWeight: 600, width: 36, textAlign: "center" },
  tdName: { minWidth: 150, maxWidth: 200 },

  nameLink: { color: "#4f8ef7", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none", transition: "color 0.15s" },
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
  buildBtn: { display: "inline-flex", alignItems: "center", padding: "0.38rem 0.8rem", background: "linear-gradient(135deg,#38d9a9,#22a884)", color: "#062c22", border: "none", borderRadius: 6, fontSize: "0.77rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: "0.01em" },
  empty: { color: "#2d3a52", fontSize: "0.77rem" },
};

// inject keyframe for spinner
if (typeof document !== "undefined" && !document.getElementById("ms-spin")) {
  const st = document.createElement("style");
  st.id = "ms-spin";
  st.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
  document.head.appendChild(st);
}