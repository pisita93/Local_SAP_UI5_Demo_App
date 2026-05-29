// Charts.jsx — KPI tiles, widget shell, and visualizations

function KpiTile({ d }) {
  const c = d.dir === "pos" ? "var(--sap-positive)" : d.dir === "neg" ? "var(--sap-negative)" : "var(--sap-neutral)";
  return (
    <div className="kpi">
      <div className="t">{d.t}</div>
      <div className="s">{d.s}</div>
      <div><span className="num">{d.num}</span> <span className="delta" style={{ color: c }}>({d.delta})</span></div>
      <div className="pl">vs. Plan <b style={{ color: c }}>{d.pl}</b></div>
      {d.spark && <div className="spark"><Sparkline data={d.spark} color={c} /></div>}
    </div>
  );
}

function Widget({ title, subtitle, children }) {
  return (
    <div className="widget">
      <div className="widget-head">
        <div>
          <div className="wt">{title}</div>
          {subtitle && <div className="ws">{subtitle}</div>}
        </div>
        <div className="acts">
          <span className="ic" title="Expand"><Icon name="maximize-2" /></span>
          <span className="ic" title="More"><Icon name="more-horizontal" /></span>
        </div>
      </div>
      <div className="widget-body">{children}</div>
    </div>
  );
}

// IBCS bar-with-variance: actual bar + dotted plan reference + signed variance
function BarVarianceChart({ cfg }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {cfg.rows.map((r, i) => {
        const diff = r.actual - r.plan;
        const pct = Math.round((diff / r.plan) * 100);
        const pos = diff >= 0;
        return (
          <div key={i} className="bvc-row">
            <div className="bvc-lab">{r.lab}</div>
            <div className="bvc-track">
              <div className="bvc-actual" style={{ width: (r.actual / cfg.max * 100) + "%", background: r.color }} />
              <div className="bvc-ref" style={{ left: (r.plan / cfg.max * 100) + "%" }} />
            </div>
            <div className="bvc-var" style={{ color: pos ? "var(--sap-positive)" : "var(--sap-negative)" }}>
              {pos ? "+" : "−"}{Math.abs(pct)}%
            </div>
          </div>
        );
      })}
      <div className="legend">
        <div className="legend-item"><span className="legend-sw" style={{ background: "var(--sap-ibcs-actual)" }} /> Actual</div>
        <div className="legend-item"><span style={{ borderLeft: "1.5px dashed var(--sap-ibcs-reference)", height: 12, display: "inline-block" }} /> Plan (reference)</div>
      </div>
    </div>
  );
}

function ColumnChart({ cfg }) {
  return (
    <div>
      <div className="colc">
        {cfg.cols.map((c, i) => (
          <div key={i} className="colc-col">
            <div className="colc-val">{c.v}</div>
            <div className="colc-bars">
              {c.pv != null && (
                <div className="ibcs-prior-year" style={{
                  position: "absolute", left: "18%", bottom: 0, width: "64%",
                  height: (c.pv / cfg.max * 100) + "%", borderRadius: "2px 2px 0 0", opacity: .5
                }} />
              )}
              <div className="colc-bar" style={{ height: (c.v / cfg.max * 100) + "%", width: "42%", position: "relative" }} />
            </div>
            <div className="colc-x">{c.x}</div>
          </div>
        ))}
      </div>
      {cfg.cols.some(c => c.pv != null) && (
        <div className="legend">
          <div className="legend-item"><span className="legend-sw" style={{ background: "var(--sap-ibcs-actual)" }} /> Actual</div>
          <div className="legend-item"><span className="legend-sw ibcs-prior-year" style={{ opacity: .55 }} /> Previous year</div>
        </div>
      )}
    </div>
  );
}

function DonutChart({ cfg }) {
  const total = cfg.segments.reduce((s, x) => s + x.value, 0);
  const r = 52, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg width="128" height="128" viewBox="0 0 128 128">
        <g transform="rotate(-90 64 64)">
          {cfg.segments.map((s, i) => {
            const frac = s.value / total;
            const dash = frac * circ;
            const el = (
              <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color}
                strokeWidth="22" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} />
            );
            offset += dash;
            return el;
          })}
        </g>
      </svg>
      <div className="legend" style={{ marginTop: 0, flexDirection: "column", gap: 8 }}>
        {cfg.segments.map((s, i) => (
          <div key={i} className="legend-item"><span className="legend-sw" style={{ background: s.color }} /> {s.label} <b style={{ marginLeft: 4, color: "var(--sap-text-heading)" }}>{s.value}%</b></div>
        ))}
      </div>
    </div>
  );
}

function DataTable({ cfg }) {
  return (
    <table className="dt">
      <thead>
        <tr>{cfg.cols.map((c, i) => <th key={i} className={i >= 2 ? "num" : ""}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {cfg.rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => {
              if (typeof cell === "object") return <td key={ci} className={"num " + cell.c}>{cell.v}</td>;
              return <td key={ci} className={ci >= 2 ? "num" : ""}>{cell}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FilterBar({ filters, onFilterClick }) {
  return (
    <div className="filterbar">
      {filters.map((f, i) => (
        <div key={i} className="fb-item" onClick={(e) => onFilterClick(i, e)}>
          <div className="l">{f.label}</div>
          <div className="v">{f.value} <Icon name="chevron-down" cls="ic-14" /></div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { KpiTile, Widget, BarVarianceChart, ColumnChart, DonutChart, DataTable, FilterBar });
