// LeanWidgets.jsx — Box Score, trend lines, analytic slicer, BCG matrix.
const { useMemo } = React;

const ST_LABEL = { good: "On / above target", watch: "Near target", bad: "Below target" };
function streamVisible(focus, id) { return focus === "both" || focus === id; }

/* ============ BOX SCORE ============ */
// variant: "classic" | "tiles" | "mini"
function BoxScore({ data, statusOn, focus, variant }) {
  const { streams, sections, kpis } = data;
  const showUht = streamVisible(focus, "uht");
  const showTogo = streamVisible(focus, "togo");

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

  const colCount = 1 + (showUht ? 1 : 0) + (showTogo ? 1 : 0) + 1;

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
              {showTogo && <th className="bs-stream"><div className="nm">{streams[1].name}</div><div className="sb">{streams[1].sub}</div></th>}
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
                    {showTogo && cell(row, "togo", row.togo)}
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
  const showTogo = streamVisible(focus, "togo");
  const W = 640, H = 170, padX = 8, padY = 14;
  const all = [].concat(showUht ? metric.uht : [], showTogo ? metric.togo : [],
    showUht ? [metric.uhtTarget] : [], showTogo ? [metric.togoTarget] : []);
  let min = Math.min(...all), max = Math.max(...all);
  const pad = (max - min) * 0.18 || 1; min -= pad; max += pad;
  const span = max - min;
  const X = i => padX + (i / (weeks.length - 1)) * (W - 2 * padX);
  const Y = v => H - padY - ((v - min) / span) * (H - 2 * padY);
  const path = arr => arr.map((v, i) => `${i === 0 ? "M" : "L"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");

  const uhtCol = palette === "colorful" ? "var(--sap-cat-1)" : "var(--sap-ibcs-actual)";
  const togoCol = palette === "colorful" ? "var(--sap-cat-2)" : "var(--sap-ibcs-actual-2)";

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
          {showTogo && <line x1={padX} x2={W - padX} y1={Y(metric.togoTarget)} y2={Y(metric.togoTarget)} stroke={togoCol} strokeWidth="1.5" strokeDasharray="5 4" opacity="0.55" />}
          {showUht && <path d={path(metric.uht)} fill="none" stroke={uhtCol} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
          {showTogo && <path d={path(metric.togo)} fill="none" stroke={togoCol} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}
          {showUht && metric.uht.map((v, i) => <circle key={"u" + i} cx={X(i)} cy={Y(v)} r="3" fill="#fff" stroke={uhtCol} strokeWidth="2" />)}
          {showTogo && metric.togo.map((v, i) => <circle key={"g" + i} cx={X(i)} cy={Y(v)} r="3" fill="#fff" stroke={togoCol} strokeWidth="2" />)}
        </svg>
      </div>
      <div className="tchart-x">{weeks.map(w => <span key={w}>{w}</span>)}</div>
      <div className="t-legend">
        {showUht && <div className="it"><span className="ln" style={{ borderTopColor: uhtCol }} /> VS-UHT actual</div>}
        {showTogo && <div className="it"><span className="ln" style={{ borderTopColor: togoCol }} /> VS-ToGo actual</div>}
        <div className="it"><span className="ln dash" style={{ borderTopColor: "var(--sap-text-muted)" }} /> Target</div>
      </div>
    </div>
  );
}

/* ============ ANALYTIC SLICER ============ */
const DIM_ICONS = {
  "Value stream": "git-branch", "Brand": "tag", "Market": "globe",
  "Plant": "factory", "Pack size": "box", "Sugar level": "candy", "Flavour group": "flask-conical"
};
function AnalyticSlicer({ slices, dim, onDim, palette }) {
  const dims = Object.keys(slices);
  const slice = slices[dim];
  const maxRev = Math.max(...slice.rows.map(r => r.rev));
  const maxSku = Math.max(...slice.rows.map(r => r.skus));
  const revCol = palette === "colorful" ? "var(--sap-cat-1)" : "var(--sap-ibcs-actual)";

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
              <th>SKUs</th>
              <th className="barcell">BCG mix (S · C · Q · D)</th>
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
                <td style={{ fontWeight: 700, color: "var(--sap-text-heading)" }}>{r.skus}</td>
                <td className="barcell">
                  <div className="bcgmix">
                    {r.star > 0 && <span className="seg star" style={{ flex: r.star }} title={r.star + " Stars"}>{r.star}</span>}
                    {r.cow > 0 && <span className="seg cow" style={{ flex: r.cow }} title={r.cow + " Cash Cows"}>{r.cow}</span>}
                    {r.qm > 0 && <span className="seg qm" style={{ flex: r.qm }} title={r.qm + " Question Marks"}>{r.qm}</span>}
                    {r.dog > 0 && <span className="seg dog" style={{ flex: r.dog }} title={r.dog + " Dogs"}>{r.dog}</span>}
                  </div>
                </td>
                <td style={{ fontWeight: 700, color: "var(--sap-text-heading)" }}>{r.ros.toFixed(1)}%</td>
                <td><span className={"sig " + r.signal}>{r.signal === "ok" ? "Healthy" : r.signal === "warn" ? "Watch" : "Action"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="bcgmix-legend">
          <span className="it"><span className="sw star" /> Star</span>
          <span className="it"><span className="sw cow" /> Cash Cow</span>
          <span className="it"><span className="sw qm" /> Question Mark</span>
          <span className="it"><span className="sw dog" /> Dog</span>
        </div>
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
          <div className="it" style={{ color: "var(--sap-text-muted)" }}>Bubble size = active SKUs</div>
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
            <div className="stat"><div className="k">Active SKUs</div><div className="v">{selBrand.products}</div></div>
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

/* ============ METRIC DRILL-DOWN (operational / capacity) ============ */
function MetricDrill({ m, palette }) {
  const [modeIdx, setModeIdx] = React.useState(0);
  const mode = m.modes[modeIdx];
  const barCol = palette === "colorful" ? "var(--sap-cat-1)" : "var(--sap-ibcs-actual)";
  const sigOf = st => st === "good" ? "ok" : st === "watch" ? "warn" : "bad";
  return (
    <Widget title={m.metric + " — drill-down"}
            subtitle={"Box Score actual broken down " + mode.label.toLowerCase() + ", per value stream"}>
      {m.modes.length > 1 && (
        <div className="drill-modes">
          {m.modes.map((md, i) => (
            <button key={i} className={"drill-mode" + (i === modeIdx ? " on" : "")} onClick={() => setModeIdx(i)}>{md.label}</button>
          ))}
        </div>
      )}
      <table className="drill mdrill">
        <thead>
          <tr>
            <th>{mode.label.replace(/^By /, "")}</th>
            <th className="barcell">{mode.additive ? "Contribution" : "Level"}</th>
            <th>Value</th>
            <th>{mode.additive ? "Share of stream" : "vs target"}</th>
          </tr>
        </thead>
        <tbody>
          {mode.streams.map((s, si) => {
            const max = mode.additive ? s.total : 100;
            return (
              <React.Fragment key={si}>
                <tr className="mdrill-group">
                  <td>{s.name}<span className="by">{mode.label.toLowerCase()}</span></td>
                  <td className="barcell" />
                  <td style={{ fontWeight: 800, color: "var(--sap-text-heading)" }}>{s.label}</td>
                  <td><span className={"sig " + sigOf(s.status)}>tgt {m.better === "low" ? "<" : ""}{s.target}{m.suffix}</span></td>
                </tr>
                {s.rows.map((r, ri) => {
                  const pp = +(r.n - s.target).toFixed(1);
                  return (
                    <tr key={ri}>
                      <td className="sub">{r.name}</td>
                      <td className="barcell">
                        <div className="bar-track"><div className="bar-fill" style={{ width: (r.n / max * 100) + "%", background: barCol }} /></div>
                      </td>
                      <td>{r.label}</td>
                      <td>
                        {mode.additive
                          ? <span className="share">{Math.round(r.n / s.total * 100)}%</span>
                          : <span className={"pp " + (pp >= 0 ? "pos" : "neg")}>{pp >= 0 ? "+" : ""}{pp} pp</span>}
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </Widget>
  );
}

Object.assign(window, { BoxScore, TrendChart, AnalyticSlicer, BCGMatrix, MetricDrill });

/* ============ CAPACITY UTILISATION (stacked %) ============ */
function CapacityUtil({ data, palette }) {
  const segs = [
    { key: "productive",    label: "Productive",            color: "var(--sap-ibcs-actual)" },
    { key: "nonproductive", label: "Non-productive (waste)", color: "var(--sap-critical)" },
    { key: "available",     label: "Available (free)",      color: "var(--sap-cat-1)" }
  ];
  return (
    <div className="caputil">
      {data.rows.map((r, i) => (
        <div key={i} className={"caputil-row" + (r.name.indexOf("total") >= 0 ? " total" : "")}>
          <div className="caputil-head">
            <span className="nm">{r.name}</span>
            <span className="vals">{r.productive} / {r.nonproductive} / {r.available}</span>
          </div>
          <div className="caputil-bar">
            {segs.map(s => (
              <div key={s.key} className="seg" style={{ width: r[s.key] + "%", background: s.color }}>
                {r[s.key] >= 9 ? r[s.key] : ""}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="caputil-legend">
        {segs.map(s => <span key={s.key} className="it"><span className="sw" style={{ background: s.color }} />{s.label}</span>)}
      </div>
      <div className="caputil-lever"><b>Lean lever:</b> {data.lever}</div>
    </div>
  );
}

Object.assign(window, { CapacityUtil });

/* ============ COMPANY BRIDGE (waterfall) ============ */
function CompanyBridge({ bridge, palette }) {
  // the total bar is derived from its components so it always ties to the box score
  const computedTotal = +bridge.filter(b => b.type !== "total").reduce((s, b) => s + b.value, 0).toFixed(1);
  // running base for floating bars
  let run = 0;
  const bars = bridge.map(b => {
    if (b.type === "total") return { ...b, value: computedTotal, base: 0, top: computedTotal };
    const base = b.value >= 0 ? run : run + b.value;
    const seg = { ...b, base, top: base + Math.abs(b.value) };
    run += b.value;
    return seg;
  });
  // scale from the highest cumulative segment top (includes the running peak)
  const max = Math.max(...bars.map(b => b.top));
  const H = 220, padTop = 14;
  const y = v => padTop + (1 - v / (max * 1.12)) * (H - padTop - 4);
  const colW = 100 / bars.length;
  const fill = b => b.type === "total" ? "var(--sap-ibcs-actual)" : b.type === "neg" ? "var(--sap-negative)" : "var(--sap-positive)";

  return (
    <div className="bridge">
      <div className="bridge-plot" style={{ height: H }}>
        {[0.25, 0.5, 0.75, 1].map(g => (
          <div key={g} className="bridge-grid" style={{ bottom: (g * (H - padTop - 4)) + 4 }} />
        ))}
        {bars.map((b, i) => (
          <div key={i} className="bridge-col" style={{ left: (i * colW) + "%", width: colW + "%" }}>
            <div className="bridge-bar" style={{
              top: y(b.top), height: Math.max(2, y(b.base) - y(b.top)), background: fill(b)
            }}>
              <span className="bridge-val">{b.value > 0 ? "+" : ""}{b.value}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="bridge-x">
        {bars.map((b, i) => <span key={i} style={{ width: colW + "%" }}>{b.label}</span>)}
      </div>
      <p className="bridge-note">
        <b>Sustaining costs</b> are company-wide costs not tied to a single value stream — corporate, R&amp;D, IT/Finance and idle-facility occupancy. In Lean Accounting they are subtracted once at company level rather than allocated into the streams, so each stream's profit stays "clean".
      </p>
    </div>
  );
}

/* ============ DOMESTIC vs EXPORT ============ */
function MarketSplit({ market, total }) {
  const maxRev = Math.max(...market.map(m => m.rev));
  return (
    <table className="drill split">
      <thead>
        <tr><th>Market</th><th className="barcell">Revenue</th><th>VS Profit</th><th>ROS %</th><th>Share</th><th>YoY Vol.</th></tr>
      </thead>
      <tbody>
        {market.map((m, i) => (
          <tr key={i}>
            <td>{m.name}</td>
            <td className="barcell">
              <div className="bar-track"><div className="bar-fill" style={{ width: (m.rev / maxRev * 100) + "%", background: "var(--sap-ibcs-actual)" }} /></div>
              <span style={{ fontSize: 11, color: "var(--sap-text-secondary)" }}>{m.rev}</span>
            </td>
            <td>{m.profit}</td>
            <td style={{ fontWeight: 700, color: "var(--sap-text-heading)" }}>{m.ros}%</td>
            <td>{m.share}%</td>
            <td><span className={"yoy " + m.dir}>{m.yoy}</span></td>
          </tr>
        ))}
        <tr className="total-row">
          <td>Total</td>
          <td className="barcell"><span style={{ fontWeight: 700 }}>{total.rev}</span></td>
          <td style={{ fontWeight: 700 }}>{total.profit}</td>
          <td style={{ fontWeight: 700 }}>{total.ros}%</td>
          <td>100%</td><td></td>
        </tr>
      </tbody>
    </table>
  );
}

/* ============ VS BY PLANT (each value stream → its plants) ============ */
function PlantSplit({ data }) {
  const allRev = data.groups.flatMap(g => g.rows.map(r => r.rev)).concat(data.groups.map(g => g.total.rev));
  const maxRev = Math.max(...allRev);
  return (
    <table className="drill split">
      <thead>
        <tr><th>Value stream / Plant</th><th className="barcell">Revenue</th><th>VS Profit</th><th>ROS %</th><th>Productive %</th><th>OTIF %</th></tr>
      </thead>
      <tbody>
        {data.groups.map((g, gi) => (
          <React.Fragment key={gi}>
            <tr className="vs-group-row">
              <td>{g.stream}</td>
              <td className="barcell">
                <div className="bar-track"><div className="bar-fill" style={{ width: (g.total.rev / maxRev * 100) + "%", background: "var(--sap-ibcs-actual)" }} /></div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--sap-text-heading)" }}>{g.total.rev}</span>
              </td>
              <td style={{ fontWeight: 700 }}>{g.total.profit}</td>
              <td style={{ fontWeight: 700, color: "var(--sap-text-heading)" }}>{g.total.ros}%</td>
              <td></td><td></td>
            </tr>
            {g.rows.map((p, i) => (
              <tr key={i}>
                <td className="sub">{p.name}</td>
                <td className="barcell">
                  <div className="bar-track"><div className="bar-fill" style={{ width: (p.rev / maxRev * 100) + "%", background: "var(--sap-ibcs-actual-2)" }} /></div>
                  <span style={{ fontSize: 11, color: "var(--sap-text-secondary)" }}>{p.rev}</span>
                </td>
                <td>{p.profit}</td>
                <td style={{ fontWeight: 700, color: "var(--sap-text-heading)" }}>{p.ros}%</td>
                <td>{p.productive}%</td>
                <td>{p.otif}%</td>
              </tr>
            ))}
          </React.Fragment>
        ))}
        <tr className="total-row">
          <td>Company total</td>
          <td className="barcell"><span style={{ fontWeight: 700 }}>{data.grandTotal.rev}</span></td>
          <td style={{ fontWeight: 700 }}>{data.grandTotal.profit}</td>
          <td style={{ fontWeight: 700 }}>{data.grandTotal.ros}%</td>
          <td></td><td></td>
        </tr>
      </tbody>
    </table>
  );
}

/* ============ VS-UHT BY CHANNEL (margin after material) ============ */
function ChannelDrill({ drill, palette }) {
  const maxRev = Math.max(...drill.rows.map(r => r.rev));
  const revCol = palette === "colorful" ? "var(--sap-cat-1)" : "var(--sap-ibcs-actual)";
  return (
    <table className="drill">
      <thead>
        <tr><th>Channel</th><th className="barcell">Revenue (THB m)</th><th>Material</th><th>Margin after material</th><th>Signal</th></tr>
      </thead>
      <tbody>
        {drill.rows.map((r, i) => (
          <tr key={i}>
            <td>{r.name}</td>
            <td className="barcell">
              <div className="bar-track"><div className="bar-fill" style={{ width: (r.rev / maxRev * 100) + "%", background: revCol }} /></div>
              <span style={{ fontSize: 11, color: "var(--sap-text-secondary)" }}>{r.rev}</span>
            </td>
            <td>{r.mat}</td>
            <td style={{ fontWeight: 700, color: "var(--sap-text-heading)" }}>{r.margin.toFixed(1)}%</td>
            <td><span className={"sig " + r.signal}>{r.signal === "ok" ? "Healthy" : r.signal === "warn" ? "Watch" : "Action"}</span></td>
          </tr>
        ))}
        <tr className="total-row">
          <td>Total {drill.title.split(" ")[0]}</td>
          <td className="barcell"><span style={{ fontWeight: 700 }}>{drill.total.rev}</span></td>
          <td style={{ fontWeight: 700 }}>{drill.total.mat}</td>
          <td style={{ fontWeight: 700 }}>{((drill.total.rev - drill.total.mat) / drill.total.rev * 100).toFixed(1)}%</td>
          <td></td>
        </tr>
      </tbody>
    </table>
  );
}

Object.assign(window, { BoxScore, TrendChart, AnalyticSlicer, BCGMatrix, MetricDrill, CompanyBridge, MarketSplit, PlantSplit, ChannelDrill });
