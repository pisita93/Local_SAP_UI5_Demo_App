// App.jsx — assembles the LEAN Accounting SAC story.

const LEAN_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "ibcs",
  "statusColors": true,
  "vsFocus": "both",
  "boxVariant": "tiles"
}/*EDITMODE-END*/;

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
      setTweak("vsFocus", val === "VS-UHT" ? "uht" : val === "VS-GLASS" ? "glass" : "both");
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
            <Widget
              title="Box Score — Operational & Financial"
              subtitle="One page per value stream · Actual vs. target this period">
              <BoxScore data={data.boxScore} statusOn={t.statusColors} focus={t.vsFocus} variant={t.boxVariant} />
            </Widget>
          )}

          {page.id === "trend" && (
            <Widget
              title="Metric Time Sequence"
              subtitle="Weekly actuals against target — last 8 weeks">
              <div className="trend-grid">
                {data.trend.metrics.map((m, i) => (
                  <TrendChart key={i} metric={m} weeks={data.trend.weeks} focus={t.vsFocus} palette={t.palette} />
                ))}
              </div>
            </Widget>
          )}

          {page.id === "analytic" && (
            <Widget
              title="Profitability Drill-down"
              subtitle="Re-slice revenue, material cost and return on sales by any dimension">
              <AnalyticSlicer slices={data.slices} dim={dim} onDim={setDim} palette={t.palette} />
            </Widget>
          )}

          {page.id === "portfolio" && (
            <Widget
              title="Brand Growth-Share Matrix"
              subtitle="Bubble position = growth vs. share · color = margin quality · size = active products">
              <BCGMatrix bcg={data.bcg} sel={bcgSel} onSel={setBcgSel} quad={bcgQuad} onQuad={setBcgQuad} />
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
          options={["both", "uht", "glass"]}
          onChange={(v) => setTweak("vsFocus", v)} />
        <TweakRadio label="Chart palette" value={t.palette}
          options={["ibcs", "colorful"]}
          onChange={(v) => setTweak("palette", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<LeanApp />);
