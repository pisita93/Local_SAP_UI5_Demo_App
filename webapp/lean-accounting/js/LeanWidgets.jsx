// LeanWidgets.jsx — Box Score, trend lines, analytic slicer, BCG matrix.
const { useMemo } = React;

const ST_LABEL = { good: "On / above target", watch: "Near target", bad: "Below target" };
function streamVisible(focus, id) { return focus === "both" || focus === id; }

/* ============ BOX SCORE ============ */
// variant: "classic" | "tiles" | "mini"
function BoxScore({ data, statusOn, focus, variant }) {
  const { streams, sections, kpis } = data;
  const showUht = streamVisible(focus, "uht");
  const showGlass = streamVisible(focus, "glass");

  const cell = (row, sid, cellData) => {
    const stCls = statusOn ? " st-" + cellData.status : "";
    if (variant === "mini") {
      const ratio = Math.max(0, Math.min(1.18, row.better === "low"
        ? cellData.target / cellData.n
        : cellData.n / cellData.target));
      return (
        <td key={sid} className={"bs-cell" + stCls} style={{ background: statusOn ? undefined : "transparent" }}>
          <div className="bs-mini">
            <div className="bs-mini-track">
              <div className={"bs-mini-fill st-" + cellData.status} style={{ width: (Math.min(ratio, 1) * 100) + "%" }} />
              <div className="bs-mini-tgt" style={{ left: (Math.min(1 / Math.max(ratio, .001), 1) * 100) + "%" }} />
            </div>
            <span>{cellData.label}</span>
          </div>
        </td>
      );
    }
    return (
      <td key={sid} className={"bs-cell" + stCls}>
        {statusOn && <span className={"pip st-" + cellData.status} />}
        {cellData.label}
      </td>
    );
  };

  const colCount = 1 + (showUht ? 1 : 0) + (showGlass ? 1 : 0) + 1;

  return (
    <div>
      {variant === "tiles" && (
        <div className="kpi-row" style={{ marginBottom: 18 }}>
          {kpis.map((k, i) => <KpiTile key={i} d={k} />)}
        </div>
      )}
      <div className="bs-wrap">
        <table className={"boxscore" + (statusOn ? " bs-status" : "")}>
          <thead>
            <tr>
              <th className="bs-corner">Metric</th>
              {showUht && <th className="bs-stream"><div className="nm">{streams[0].name}</div><div className="sb">{streams[0].sub}</div></th>}
              {showGlass && <th className="bs-stream"><div className="nm">{streams[1].name}</div><div className="sb">{streams[1].sub}</div></th>}
              <th className="bs-target">Target</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((sec, si) => (
              <React.Fragment key={si}>
                <tr className="bs-section"><td colSpan={colCount}>{sec.name}</td></tr>
                {sec.rows.map((row, ri) => (
                  <tr key={ri} className="bs-row">
                    <td className="bs-metric">{row.metric}<span className="u">{row.unit}</span></td>
                    {showUht && cell(row, "uht", row.uht)}
                    {showGlass && cell(row, "glass", row.glass)}
                    <td className="bs-target-cell">{row.targetLabel}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {statusOn && (
        <div className="bs-legend">
          {["good", "watch", "bad"].map(s => (
            <div key={s} className="it"><span className={"pip st-" + s} /> {ST_LABEL[s]}</div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ TREND (metric time sequence) ============ */
function TrendChart({ metric, weeks, focus, palette }) {
  const showUht = streamVisible(focus, "uht");
  const showGlass = streamVisible(focus, "glass");
  const W = 640, H = 170, padX = 8, padY = 14;
  const all = [].concat(showUht ? metric.uht : [], showGlass ? metric.glass : [],
    showUht ? [metric.uhtTarget] : [], showGlass ? [metric.glassTarget] : []);
  let min = Math.min(...all), max = Math.max(...all);
  const pad = (max - min) * 0.18 || 1; min -= pad; max += pad;
  const span = max - min;
  const X = i => padX + (i / (weeks.length - 1)) * (W - 2 * padX);
  const Y = v => H - padY - ((v - min) / span) * (H - 2 * padY);
  const path = arr => arr.map((v, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");

  const uhtCol = palette === "colorful" ? "var(--sap-cat-1)" : "var(--sap-ibcs-actual)";
  const glassCol = palette === "colorful" ? "var(--sap-cat-2)" : "var(--sap-ibcs-actual-2)";

  return (
    <div className="tchart">
      <div className="tchart-head">
        <div className="tchart-title">{metric.name}<span className="u">{metric.unit}</span></div>
      </div>
      <div className="tchart-plot">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          {[0.25, 0.5, 0.75].map(g => (
            <line key={g} x1={padX} x2={W - padX} y1={padY + g * (H - 2 * padY)} y2={padY + g * (H - 2 * padY)} stroke="var(--sap-divider)" strokeWidth="1" />
          ))}
          {showUht && <line x1={padX} x2={W - padX} y1={Y(metric.uhtTarget)} y2={Y(metric.uhtTarget)} stroke={uhtCol} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.55" />}
          {showGlass && <line x1={padX} x2={W - padX} y1={Y(metric.glassTarget)} y2={Y(metric.glassTarget)} stroke={glassCol} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.55" />}
          {showUht && <path d={path(metric.uht)} fill="none" stroke={uhtCol} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
          {showGlass && <path d={path(metric.glass)} fill="none" stroke={glassCol} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
          {showUht && metric.uht.map((v, i) => <circle key={"u" + i} cx={X(i)} cy={Y(v)} r="3" fill="#fff" stroke={uhtCol} strokeWidth="2" />)}
          {showGlass && metric.glass.map((v, i) => <circle key={"g" + i} cx={X(i)} cy={Y(v)} r="3" fill="#fff" stroke={glassCol} strokeWidth="2" />)}
        </svg>
      </div>
      <div className="tchart-x">{weeks.map(w => <span key={w}>{w}</span>)}</div>
      <div className="t-legend">
        {showUht && <div className="it"><span className="ln" style={{ borderTopColor: uhtCol }} /> VS-UHT actual</div>}
        {showGlass && <div className="it"><span className="ln" style={{ borderTopColor: glassCol }} /> VS-GLASS actual</div>}
        <div className="it"><span className="ln dash" style={{ borderTopColor: "var(--sap-text-muted)" }} /> Target</div>
      </div>
    </div>
  );
}

/* ============ ANALYTIC SLICER ============ */
const DIM_ICONS = {
  "Value stream": "git-branch", "Brand": "tag", "Product type": "package",
  "Recipe family": "flask-conical", "Pack / variant": "box", "Market": "globe", "Sales channel": "store"
};
function AnalyticSlicer({ slices, dim, onDim, palette }) {
  const dims = Object.keys(slices);
  const slice = slices[dim];
  const maxRev = Math.max(...slice.rows.map(r => r.rev));
  const maxMat = Math.max(...slice.rows.map(r => r.mat));
  const revCol = palette === "colorful" ? "var(--sap-cat-1)" : "var(--sap-ibcs-actual)";
  const matCol = palette === "colorful" ? "var(--sap-cat-2)" : "var(--sap-ibcs-actual-2)";

  return (
    <div className="slicer-layout">
      <div className="slicer-rail">
        <div className="hd">Dimension</div>
        {dims.map(d => (
          <button key={d} className={"slicer-chip" + (d === dim ? " on" : "")} onClick={() => onDim(d)}>
            <span className="ic"><Icon name={DIM_ICONS[d] || "layers"} /></span>{d}
          </button>
        ))}
      </div>
      <div>
        <p className="slicer-explain"><b>{dim}.</b> {slice.explain}</p>
        <table className="drill">
          <thead>
            <tr>
              <th>{dim}</th>
              <th className="barcell">Revenue (THB m)</th>
              <th className="barcell">Material cost (THB m)</th>
              <th>Return on sales</th>
              <th>Signal</th>
            </tr>
          </thead>
          <tbody>
            {slice.rows.map((r, i) => (
              <tr key={i}>
                <td>{r.name}</td>
                <td className="barcell">
                  <div className="bar-track"><div className="bar-fill" style={{ width: (r.rev / maxRev * 100) + "%", background: revCol }} /></div>
                  <span style={{ fontSize: 11, color: "var(--sap-text-secondary)" }}>{r.rev.toFixed(1)}</span>
                </td>
                <td className="barcell">
                  <div className="bar-track"><div className="bar-fill" style={{ width: (r.mat / maxMat * 100) + "%", background: matCol }} /></div>
                  <span style={{ fontSize: 11, color: "var(--sap-text-secondary)" }}>{r.mat.toFixed(1)}</span>
                </td>
                <td style={{ fontWeight: 700, color: "var(--sap-text-heading)" }}>{r.ros.toFixed(1)}%</td>
                <td><span className={"sig " + r.signal}>{r.signal === "ok" ? "Healthy" : r.signal === "warn" ? "Watch" : "Action"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="slicer-impact"><b>Master-data impact.</b> {slice.impact}</p>
      </div>
    </div>
  );
}

/* ============ BCG PORTFOLIO MATRIX ============ */
function BCGMatrix({ bcg, sel, onSel, quad, onQuad }) {
  const brands = bcg.brands;
  const selBrand = brands.find(b => b.name === sel) || brands[0];
  const quads = ["All", "Stars", "Cash Cows", "Question Marks", "Dogs"];
  const sizeOf = s => 26 + Math.sqrt(s) * 4.6;

  return (
    <div className="bcg-layout">
      <div className="bcg-plot-wrap">
        <div className="bcg-axisY">
          <div className="bcg-ylabel">Market growth →</div>
          <div className="bcg-plot">
            <div className="bcg-mid-v" /><div className="bcg-mid-h" />
            <div className="bcg-quad-label" style={{ top: 10, left: 12 }}>Question Marks</div>
            <div className="bcg-quad-label" style={{ top: 10, right: 12 }}>Stars</div>
            <div className="bcg-quad-label" style={{ bottom: 10, left: 12 }}>Dogs</div>
            <div className="bcg-quad-label" style={{ bottom: 10, right: 12 }}>Cash Cows</div>
            {brands.map(b => {
              const d = sizeOf(b.size);
              const dim = quad !== "All" && b.quadrant !== quad;
              return (
                <div key={b.name}
                  className={"bcg-bubble " + b.profit + (b.name === sel ? " sel" : "")}
                  style={{ left: b.x + "%", bottom: b.y + "%", width: d, height: d, opacity: dim ? 0.2 : 1 }}
                  onClick={() => onSel(b.name)} title={b.name}>
                  <span className="lbl">{b.name}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="bcg-xlabel">Relative market share →</div>
        <div className="bcg-legend">
          <div className="it"><span className="sw" style={{ background: "var(--sap-positive)" }} /> Healthy margin</div>
          <div className="it"><span className="sw" style={{ background: "var(--sap-critical)" }} /> Moderate margin</div>
          <div className="it"><span className="sw" style={{ background: "var(--sap-negative)" }} /> Thin margin</div>
          <div className="it" style={{ color: "var(--sap-text-muted)" }}>Bubble size = active products</div>
        </div>
      </div>

      <div className="bcg-side">
        <div className="bcg-quadtabs">
          {quads.map(q => (
            <button key={q} className={"bcg-qtab" + (q === quad ? " on" : "")} onClick={() => onQuad(q)}>{q}</button>
          ))}
        </div>
        <p className="slicer-explain" style={{ margin: 0 }}>{bcg.quadrantInfo[quad]}</p>
        <div className="bcg-detail">
          <div className="nm">{selBrand.name}</div>
          <div className="qd">{selBrand.quadrant}</div>
          <span className={"bcg-profit " + selBrand.profit}>
            <Icon name={selBrand.profit === "healthy" ? "trending-up" : selBrand.profit === "moderate" ? "minus" : "trending-down"} />
            {selBrand.profit === "healthy" ? "Healthy margin" : selBrand.profit === "moderate" ? "Moderate margin" : "Thin margin"}
          </span>
          <div className="stats">
            <div className="stat"><div className="k">Active products</div><div className="v">{selBrand.products}</div></div>
            <div className="stat"><div className="k">Revenue</div><div className="v">{selBrand.rev.toFixed(1)}<span style={{ fontSize: 11, fontWeight: 400 }}> m</span></div></div>
            <div className="stat"><div className="k">Return on sales</div><div className="v">{selBrand.ros.toFixed(1)}%</div></div>
            <div className="stat"><div className="k">Position</div><div className="v" style={{ fontSize: 14 }}>{selBrand.quadrant}</div></div>
          </div>
          <p className="note">{selBrand.note}</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BoxScore, TrendChart, AnalyticSlicer, BCGMatrix });
