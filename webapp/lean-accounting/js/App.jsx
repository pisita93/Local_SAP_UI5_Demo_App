// App.jsx — assembles the LEAN Accounting SAC story.

const LEAN_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "ibcs",
  "statusColors": true,
  "vsFocus": "both",
  "boxVariant": "tiles"
}/*EDITMODE-END*/;

// ---- filter transform helpers --------------------------------------------
// Period rescales monetary figures by month-count; rates/%/ros/counts are
// period-invariant and stay as-is. Plant filters Box Score columns + plant
// table. Market re-slices the Analytic page.
const PERIOD_FACTOR = { "May 2026": 1, "Apr 2026": 0.96, "Q2 2026": 3, "FY 2026": 12, "FY 2025": 11.2 };
function periodFactor(v) { return PERIOD_FACTOR[v] != null ? PERIOD_FACTOR[v] : 1; }
const fmtNum = n => Number.isInteger(n) ? String(n) : String(Math.round(n * 10) / 10);
const KPI_SCALE = ["Net Revenue", "Value-Stream Profit", "Company Op. Profit"];

function scaleBoxScore(bs, pf, plant) {
  const scaleRow = row => {
    if (row.unit !== "THB m") return row;
    const su = { ...row.uht }, st = { ...row.togo };
    su.n = +(su.n * pf).toFixed(1); su.target = +(su.target * pf).toFixed(1); su.label = fmtNum(su.n);
    st.n = +(st.n * pf).toFixed(1); st.target = +(st.target * pf).toFixed(1); st.label = fmtNum(st.n);
    return { ...row, uht: su, togo: st, targetLabel: fmtNum(su.target) + " · " + fmtNum(st.target) };
  };
  const sections = bs.sections.map(sec => ({ ...sec, rows: sec.rows.map(scaleRow) }));
  const kpis = bs.kpis.map(k => {
    if (KPI_SCALE.includes(k.t)) {
      const base = parseFloat(k.num);
      if (!isNaN(base)) return { ...k, num: fmtNum(+(base * pf).toFixed(1)) };
    }
    return k;
  });
  const bridge = bs.bridge.map(b => ({ ...b, value: +(b.value * pf).toFixed(1) }));
  const scaleMP = arr => arr.map(r => ({ ...r, rev: +(r.rev * pf).toFixed(1), profit: +(r.profit * pf).toFixed(1) }));
  const market = scaleMP(bs.market);
  const marketTotal = { ...bs.marketTotal, rev: +(bs.marketTotal.rev * pf).toFixed(1), profit: +(bs.marketTotal.profit * pf).toFixed(1) };
  // VS by plant — scale every revenue/profit by period; filter plants when a plant is selected
  const scaleGroup = g => {
    let rows = scaleMP(g.rows);
    let total = { ...g.total, rev: +(g.total.rev * pf).toFixed(1), profit: +(g.total.profit * pf).toFixed(1) };
    if (plant === "Rangsit" || plant === "Nong Kae") {
      rows = rows.filter(r => r.name.indexOf(plant) === 0);
      const rev = rows.reduce((s, r) => s + r.rev, 0), profit = rows.reduce((s, r) => s + r.profit, 0);
      total = { rev: +rev.toFixed(1), profit: +profit.toFixed(1), ros: rev ? +(profit / rev * 100).toFixed(1) : 0 };
    }
    return { ...g, rows, total };
  };
  const vbp = bs.vsByPlant;
  let groups = vbp.groups.map(scaleGroup).filter(g => g.rows.length > 0);
  const gRev = groups.reduce((s, g) => s + g.total.rev, 0), gProfit = groups.reduce((s, g) => s + g.total.profit, 0);
  const vsByPlant = { groups, grandTotal: { rev: +gRev.toFixed(1), profit: +gProfit.toFixed(1), ros: gRev ? +(gProfit / gRev * 100).toFixed(1) : 0 } };
  return { ...bs, sections, kpis, bridge, market, marketTotal, vsByPlant };
}

function windowTrend(trend, period) {
  const n = period === "Last 8 weeks" ? 8 : 13;   // 13 weeks / quarter
  if (n <= trend.weeks.length) {
    return { ...trend, weeks: trend.weeks.slice(-n), metrics: trend.metrics.map(m => ({ ...m, uht: m.uht.slice(-n), togo: m.togo.slice(-n) })) };
  }
  const lead = n - trend.weeks.length;
  const weeks = Array.from({ length: n }, (_, i) => "W" + (i + 1));
  const genLead = arr => {
    const out = [];
    for (let i = lead; i > 0; i--) out.push(+(arr[0] - 0.3 * i + (i % 2 ? 0.2 : -0.1)).toFixed(1));
    return out.concat(arr);
  };
  return { ...trend, weeks, metrics: trend.metrics.map(m => ({ ...m, uht: genLead(m.uht), togo: genLead(m.togo) })) };
}

function sliceAnalytic(slices, channelDrill, channelDrillToGo, pf, market) {
  const mf = market === "Domestic" ? 182 / 260 : market === "Export" ? 78 / 260 : 1;
  const out = {};
  Object.entries(slices).forEach(([k, v]) => {
    if (k === "Market") {
      let rows = market !== "(All)" ? v.rows.filter(r => r.name === market) : v.rows;
      out[k] = { ...v, rows: rows.map(r => ({ ...r, rev: +(r.rev * pf).toFixed(1) })) };
    } else {
      out[k] = { ...v, rows: v.rows.map(r => ({ ...r, rev: +(r.rev * pf * mf).toFixed(1) })) };
    }
  });
  const scaleChannel = drill => {
    let rows = drill.rows;
    if (market === "Export") rows = rows.filter(r => r.name === "Export");
    else if (market === "Domestic") rows = rows.filter(r => r.name !== "Export");
    rows = rows.map(r => ({ ...r, rev: +(r.rev * pf).toFixed(1), mat: +(r.mat * pf).toFixed(1) }));
    const total = { rev: +rows.reduce((s, r) => s + r.rev, 0).toFixed(1), mat: +rows.reduce((s, r) => s + r.mat, 0).toFixed(1) };
    return { ...drill, rows, total };
  };
  return { slices: out, channelDrill: scaleChannel(channelDrill), channelDrillToGo: scaleChannel(channelDrillToGo) };
}

function portfolioForPeriod(bcg, period) {
  if (period !== "FY 2025") return bcg;
  const brands = bcg.brands.map(b => ({
    ...b, y: Math.max(8, b.y - 7), size: Math.max(2, Math.round(b.size * 0.9)),
    products: Math.max(1, Math.round(b.products * 0.9)), rev: +(b.rev * 0.9).toFixed(1)
  }));
  return {
    ...bcg, brands,
    counts: { star: 27, cow: 44, qm: 12, dog: 10, total: 93 },
    quadrantInfo: { ...bcg.quadrantInfo, "All": "FY 2025 snapshot · 93 SKUs: 27 Stars, 44 Cash Cows, 12 Question Marks, 10 Dogs. The portfolio was earlier in its shift toward Stars — growth positions are lower than FY 2026." }
  };
}

function LeanApp() {
  const data = window.LEAN_DATA;
  const [t, setTweak] = useTweaks(LEAN_TWEAK_DEFAULTS);

  const [pageIndex, setPageIndex] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [panelTab, setPanelTab] = useState("navigation");
  const [pinned, setPinned] = useState(true);
  const [popover, setPopover] = useState(null);

  // analytic + bcg interactive state
  const [dim, setDim] = useState("Value stream");
  const [metricGroup, setMetricGroup] = useState("operational");
  const [bcgSel, setBcgSel] = useState("Vitamilk");
  const [bcgQuad, setBcgQuad] = useState("All");

  // per-page filter values
  const [filterState, setFilterState] = useState(() => {
    const o = {};
    Object.keys(data.filters).forEach(k => { o[k] = data.filters[k].map(f => f.value); });
    return o;
  });

  const page = data.pages[pageIndex];
  const rawFilters = data.filters[page.id] || [];
  const filters = rawFilters.map((f, i) => ({ ...f, value: filterState[page.id][i] }));

  // resolve a filter's current value by label, for any page
  const fval = (pageId, label) => {
    const arr = data.filters[pageId]; const idx = arr.findIndex(f => f.label === label);
    return idx >= 0 ? filterState[pageId][idx] : null;
  };

  // derive transformed views from current filter selections
  const bsPlant = fval("boxscore", "Plant");
  const boxScoreView = scaleBoxScore(data.boxScore, periodFactor(fval("boxscore", "Period")), bsPlant);
  const bsFocus = bsPlant === "Nong Kae" ? "togo" : t.vsFocus;
  const trendView = windowTrend(data.trend, fval("trend", "Period"));
  const analyticView = sliceAnalytic(data.slices, data.channelDrill, data.channelDrillToGo, periodFactor(fval("analytic", "Period")), fval("analytic", "Market"));
  const bcgView = portfolioForPeriod(data.bcg, fval("portfolio", "Period"));

  // keep palette class on the canvas
  const canvasRef = useRef(null);

  const goPage = (i) => {
    const n = (i + data.pages.length) % data.pages.length;
    setPageIndex(n); setPopover(null);
  };
  const togglePanel = (tab) => {
    if (panelOpen && panelTab === tab) setPanelOpen(false);
    else { setPanelOpen(true); setPanelTab(tab); }
    setPopover(null);
  };
  const openFilterPopover = (idx, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({ idx, x: rect.left, y: rect.bottom + 4 });
  };
  const chooseFilter = (val) => {
    setFilterState(prev => {
      const copy = { ...prev, [page.id]: prev[page.id].slice() };
      copy[page.id][popover.idx] = val;
      return copy;
    });
    // Value Stream filter cross-drives the VS focus tweak on box score / trend
    const lbl = rawFilters[popover.idx]?.label;
    if (lbl === "Value Stream") {
      setTweak("vsFocus", val === "VS-UHT" ? "uht" : val === "VS-TOGO" ? "togo" : "both");
    }
    setPopover(null);
  };

  const palClass = t.palette === "colorful" ? "palette-colorful" : "";

  return (
    <div className="sac-app">
      <StoryToolbar
        pageName={page.name} pageIndex={pageIndex} pageCount={data.pages.length}
        onPrev={() => goPage(pageIndex - 1)} onNext={() => goPage(pageIndex + 1)}
        panelTab={panelOpen ? panelTab : null} onTogglePanel={togglePanel}
      />
      <ApplicationBar title={data.appTitle} />
      <div className="sac-body">
        {panelOpen && (
          <SidePanel
            tab={panelTab} onTab={(tb) => setPanelTab(tb)}
            pages={data.pages} currentPage={page.id} onSelectPage={goPage}
            filters={filters} onFilterClick={openFilterPopover}
            pinned={pinned} onPin={() => setPinned(p => !p)} onClose={() => setPanelOpen(false)}
          />
        )}
        <div className={"canvas " + palClass} ref={canvasRef} data-screen-label={page.name}>
          <div className="page-title">{page.title}</div>
          <FilterBar filters={filters} onFilterClick={openFilterPopover} />

          {page.id === "boxscore" && (
            <div className="page-stack">
              <Widget
                title="Box Score — Operational & Financial"
                subtitle="Green Spot Co., Ltd · May 2026 · THB m / month · Actual vs. target per value stream">
                <BoxScore data={boxScoreView} statusOn={t.statusColors} focus={bsFocus} variant={t.boxVariant} />
              </Widget>
              <div className="card-2up">
                <Widget title="Company Bridge" subtitle="Value-stream profit less sustaining costs (THB m / month)">
                  <CompanyBridge bridge={boxScoreView.bridge} palette={t.palette} />
                </Widget>
                <Widget title="Domestic vs Export" subtitle="Orthogonal cut of company total (THB m / month)">
                  <MarketSplit market={boxScoreView.market} total={boxScoreView.marketTotal} />
                </Widget>
              </div>
              <Widget title="VS by Plant" subtitle="Each value stream followed by its plants — revenue, profit & ROS">
                <PlantSplit data={boxScoreView.vsByPlant} />
              </Widget>
            </div>
          )}

          {page.id === "trend" && (
            <Widget
              title="Metric Time Sequence"
              subtitle="Weekly actuals against target — last 8 weeks">
              <div className="trend-grid">
                {trendView.metrics.map((m, i) => (
                  <TrendChart key={i} metric={m} weeks={trendView.weeks} focus={t.vsFocus} palette={t.palette} />
                ))}
              </div>
            </Widget>
          )}

          {page.id === "analytic" && (
            <div className="page-stack">
              <div className="metric-tabs">
                {[["operational", "Operational", "activity"], ["capacity", "Capacity", "gauge"], ["financial", "Financial", "wallet"]].map(([id, label, icon]) => (
                  <button key={id} className={"metric-tab" + (metricGroup === id ? " on" : "")} onClick={() => setMetricGroup(id)}>
                    <Icon name={icon} />{label}
                  </button>
                ))}
              </div>

              {metricGroup === "operational" && (
                <div className="metric-stack">
                  {data.metricDrills.operational.map((m, i) => <MetricDrill key={i} m={m} palette={t.palette} />)}
                </div>
              )}

              {metricGroup === "capacity" && (
                <div className="page-stack">
                  <Widget title="Capacity Utilization" subtitle="Productive · Non-productive · Available — % of available capacity">
                    <CapacityUtil data={data.boxScore.capacityUtil} palette={t.palette} />
                  </Widget>
                  <div className="metric-stack">
                    {data.metricDrills.capacity.map((m, i) => <MetricDrill key={i} m={m} palette={t.palette} />)}
                  </div>
                </div>
              )}

              {metricGroup === "financial" && (
                <div className="page-stack">
                  <Widget
                    title="Financial Drill-Down"
                    subtitle="Re-slice revenue, return on sales and BCG mix by any dimension">
                    <AnalyticSlicer slices={analyticView.slices} dim={dim} onDim={setDim} palette={t.palette} />
                  </Widget>
                  <Widget
                    title={data.channelDrill.title}
                    subtitle={data.channelDrill.note}>
                    <ChannelDrill drill={analyticView.channelDrill} palette={t.palette} />
                  </Widget>
                  <Widget
                    title={data.channelDrillToGo.title}
                    subtitle={data.channelDrillToGo.note}>
                    <ChannelDrill drill={analyticView.channelDrillToGo} palette={t.palette} />
                  </Widget>
                </div>
              )}
            </div>
          )}

          {page.id === "portfolio" && (
            <Widget
              title="Brand Growth-Share Matrix"
              subtitle="Bubble position = growth vs. share · color = margin quality · size = active SKUs">
              <BCGMatrix bcg={bcgView} sel={bcgSel} onSel={setBcgSel} quad={bcgQuad} onQuad={setBcgQuad} />
            </Widget>
          )}
        </div>
      </div>

      {popover && (
        <div className="pop-overlay" onClick={() => setPopover(null)}>
          <div className="popover" style={{ left: popover.x, top: popover.y }} onClick={(e) => e.stopPropagation()}>
            <div className="pop-head">{rawFilters[popover.idx].label}</div>
            {rawFilters[popover.idx].options.map((opt, i) => {
              const on = filterState[page.id][popover.idx] === opt;
              return (
                <div key={i} className="pop-item" onClick={() => chooseFilter(opt)}>
                  <span className={"pop-check" + (on ? " on" : "")}>{on && <Icon name="check" />}</span>{opt}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TweaksPanel>
        <TweakSection label="Box Score" />
        <TweakRadio label="Layout" value={t.boxVariant}
          options={["tiles", "classic", "mini"]}
          onChange={(v) => setTweak("boxVariant", v)} />
        <TweakToggle label="Status colors" value={t.statusColors}
          onChange={(v) => setTweak("statusColors", v)} />
        <TweakSection label="Data" />
        <TweakRadio label="Value stream focus" value={t.vsFocus}
          options={["both", "uht", "togo"]}
          onChange={(v) => setTweak("vsFocus", v)} />
        <TweakRadio label="Chart palette" value={t.palette}
          options={["ibcs", "colorful"]}
          onChange={(v) => setTweak("palette", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<LeanApp />);
