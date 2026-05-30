// Charts2.jsx — extended SAC widgets: waterfall, bullet, combination, geo map, cross-table

// --- Waterfall (revenue bridge) ---
function WaterfallChart({ cfg }) {
  const COL = { total: "var(--sap-ibcs-actual)", inc: "var(--sap-positive)", dec: "var(--sap-negative)" };
  // compute running positions
  let run = 0;
  const segs = cfg.steps.map(s => {
    let bottom, top;
    if (s.type === "total") { bottom = 0; top = s.val; run = s.val; }
    else if (s.type === "inc") { bottom = run; top = run + s.val; run = top; }
    else { top = run; bottom = run + s.val; run = bottom; } // dec (val<0)
    return { ...s, bottom, top };
  });
  const max = Math.max(...segs.map(s => s.top)) * 1.12;
  const pct = v => (v / max) * 100;
  return (
    <div>
      <div className="wf">
        {segs.map((s, i) => (
          <div key={i} className="wf-col">
            <div className="wf-plot">
              <div className="wf-val" style={{ bottom: pct(s.top) + "%", marginBottom: 2 }}>
                {s.val > 0 && s.type !== "total" ? "+" : ""}{s.val}
              </div>
              <div className="wf-bar" style={{
                bottom: pct(s.bottom) + "%", height: pct(s.top - s.bottom) + "%",
                background: COL[s.type]
              }} />
              {i < segs.length - 1 && (
                <div className="wf-conn" style={{ bottom: pct(s.top) + "%" }} />
              )}
            </div>
            <div className="wf-x">{s.lab}</div>
          </div>
        ))}
      </div>
      <div className="legend">
        <div className="legend-item"><span className="legend-sw" style={{ background: COL.total }} /> Total</div>
        <div className="legend-item"><span className="legend-sw" style={{ background: COL.inc }} /> Increase</div>
        <div className="legend-item"><span className="legend-sw" style={{ background: COL.dec }} /> Decrease</div>
      </div>
    </div>
  );
}

// --- Bullet chart (actual vs. target with qualitative bands) ---
function BulletChart({ cfg }) {
  const BAND = ["rgba(208,10,10,0.14)", "rgba(231,101,0,0.16)", "rgba(23,130,54,0.16)"];
  return (
    <div>
      {cfg.rows.map((r, i) => {
        const met = r.actual >= r.target;
        return (
          <div key={i} className="bul-row">
            <div className="bul-lab">{r.lab}</div>
            <div className="bul-track">
              {r.bands.map((b, bi) => {
                const start = bi === 0 ? 0 : r.bands[bi - 1];
                return <div key={bi} className="bul-band" style={{
                  left: (start / r.scaleMax * 100) + "%",
                  width: ((b - start) / r.scaleMax * 100) + "%",
                  background: BAND[bi]
                }} />;
              })}
              <div className="bul-measure" style={{ width: (r.actual / r.scaleMax * 100) + "%" }} />
              <div className="bul-target" style={{ left: (r.target / r.scaleMax * 100) + "%" }} />
            </div>
            <div className="bul-val" style={{ color: met ? "var(--sap-positive)" : "var(--sap-negative)" }}>
              {r.actual}%
            </div>
          </div>
        );
      })}
      <div className="legend" style={{ marginTop: 4 }}>
        <div className="legend-item"><span className="legend-sw" style={{ background: "var(--sap-ibcs-actual)" }} /> Actual</div>
        <div className="legend-item"><span style={{ width: 2, height: 13, background: "var(--sap-text-heading)", display: "inline-block" }} /> Target</div>
      </div>
    </div>
  );
}

// --- Combination column + line ---
function CombinationChart({ cfg }) {
  const n = cfg.cols.length;
  // line points in % of the inner plot box
  const linePts = cfg.cols.map((c, i) => {
    const x = ((i + 0.5) / n) * 100;
    const y = 100 - (c.line / cfg.lineMax) * 100;
    return `${x},${y}`;
  }).join(" ");
  return (
    <div>
      <div className="combo">
        <div className="combo-cols">
          {cfg.cols.map((c, i) => (
            <div key={i} className="combo-col">
              <div className={"combo-bar" + (c.forecast ? " ibcs-forecast" : "")} style={{ height: (c.bar / cfg.max * 100) + "%" }} />
            </div>
          ))}
        </div>
        <svg className="combo-line" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points={linePts} fill="none" stroke="var(--sap-cat-1)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        </svg>
        <svg className="combo-line" viewBox="0 0 100 100" preserveAspectRatio="none">
          {cfg.cols.map((c, i) => {
            const x = ((i + 0.5) / n) * 100;
            const y = 100 - (c.line / cfg.lineMax) * 100;
            return <circle key={i} cx={x} cy={y} r="1.1" fill="#fff" stroke="var(--sap-cat-1)" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />;
          })}
        </svg>
      </div>
      <div className="combo-cols" style={{ height: "auto" }}>
        {cfg.cols.map((c, i) => <div key={i} className="combo-x" style={{ flex: 1, textAlign: "center" }}>{c.x}</div>)}
      </div>
      <div className="legend">
        <div className="legend-item"><span className="legend-sw" style={{ background: "var(--sap-ibcs-actual)" }} /> Revenue (actual)</div>
        <div className="legend-item"><span className="legend-sw ibcs-forecast" /> Forecast</div>
        <div className="legend-item"><span style={{ width: 14, height: 2, background: "var(--sap-cat-1)", display: "inline-block" }} /> Margin %</div>
      </div>
    </div>
  );
}

// --- Geo bubble map (equirectangular) ---
function GeoMap({ cfg }) {
  const xy = (lat, lon) => ({ left: ((lon + 180) / 360) * 100, top: ((90 - lat) / 180) * 100 });
  const size = v => 12 + Math.sqrt(v / cfg.max) * 46;
  return (
    <div>
      <div className="geo">
        {cfg.points.map((p, i) => {
          const { left, top } = xy(p.lat, p.lon);
          const d = size(p.v);
          return (
            <React.Fragment key={i}>
              <div className="geo-bubble" style={{ left: left + "%", top: top + "%", width: d, height: d }} />
              <div className="geo-dot" style={{ left: left + "%", top: top + "%" }} />
              <div className="geo-cap" style={{ left: left + "%", top: `calc(${top}% + ${d / 2 + 2}px)` }}>{p.city}</div>
            </React.Fragment>
          );
        })}
      </div>
      <div className="geo-legend">
        {[30, 70, 110].map((v, i) => {
          const d = size(v);
          return (
            <div key={i} className="legend-item">
              <span style={{ width: d / 2, height: d / 2, borderRadius: "50%", background: "rgba(22,142,255,0.32)", border: "1.5px solid var(--sap-cat-1)", display: "inline-block" }} />
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Cross-table / pivot ---
function CrossTable({ cfg }) {
  const renderCells = (cells) => cells.map((c, i) => (
    <React.Fragment key={i}>
      <td className="measure">{c[0]}</td>
      <td className={"delta " + (c[1].startsWith("-") || c[1].startsWith("−") ? "neg" : "pos")}>{c[1]}</td>
    </React.Fragment>
  ));
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="xt">
        <thead>
          <tr>
            <th className="dim" rowSpan="2">Region</th>
            {cfg.groups.map((g, i) => <th key={i} className="grp" colSpan={cfg.measures.length}>{g}</th>)}
          </tr>
          <tr>
            {cfg.groups.map((g, gi) => cfg.measures.map((m, mi) => (
              <th key={gi + "-" + mi} className={mi === 0 ? "measure" : ""}>{m}</th>
            )))}
          </tr>
        </thead>
        <tbody>
          {cfg.rows.map((r, i) => (
            <tr key={i} className={r.indent === 0 ? "lvl0" : ""}>
              <td className="dim" style={{ paddingLeft: 10 + r.indent * 18 }}>{r.dim}</td>
              {renderCells(r.cells)}
            </tr>
          ))}
          {cfg.total && (
            <tr className="total">
              <td className="dim">{cfg.total.dim}</td>
              {renderCells(cfg.total.cells)}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { WaterfallChart, BulletChart, CombinationChart, GeoMap, CrossTable });
