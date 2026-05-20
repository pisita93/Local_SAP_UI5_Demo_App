/* ──────────────────────────────────────────────────────────────
 * Sales Admin — Main daily report
 * Three layout variations:
 *   v1: Tree table (default)         — expandable customer/ship-to rows
 *   v2: KPI dashboard + flat table   — top KPIs + customer-grouped rows
 *   v3: Customer cards               — card grid with payment-mix bars
 * All three respect: density, status palette, current filters.
 * ────────────────────────────────────────────────────────────── */

function AdminReport({ billings, filters, setFilters, density, palette, onOpenTruck, onSubmitDrafts, view, setView }) {
  const filtered = filterBillings(billings, filters);
  const customers = groupByCustomer(filtered);

  // top-of-page totals for the filtered set
  const totals = filtered.reduce((s, b) => {
    s.qty += b.qty; s.total += b.total;
    s[b.payment] += b.total;
    if (b.status === "draft") s.drafts++;
    if (b.status === "rework") s.rework++;
    return s;
  }, { qty: 0, credit: 0, cash: 0, bank: 0, total: 0, drafts: 0, rework: 0 });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageTitle
        title="Daily delivery & billing report"
        subtitle={`${TODAY} · ${filtered.length} billings across ${customers.length} customers · ${new Set(filtered.map(b => b.truck)).size} trucks`}
        actions={<>
          <ViewSwitcher value={view} onChange={setView}/>
          <Btn variant="secondary" icon="download" density={density}>Export</Btn>
          <Btn variant="primary" icon="send" density={density}
               disabled={totals.drafts === 0}
               onClick={() => onSubmitDrafts(filtered.filter(b => b.status === "draft"))}>
            Submit drafts ({totals.drafts})
          </Btn>
        </>}
      />
      <FilterBar filters={filters} onChange={setFilters} density={density}
                 onReset={() => setFilters({ date: TODAY, truck: "", route: "", customer: "", payment: "", status: "" })}/>
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {view === "tree"  && <TreeView      customers={customers} totals={totals} density={density} palette={palette} onOpenTruck={onOpenTruck}/>}
        {view === "kpi"   && <KPIFlatView   customers={customers} totals={totals} filtered={filtered} density={density} palette={palette} onOpenTruck={onOpenTruck}/>}
        {view === "cards" && <CardsView     customers={customers} totals={totals} density={density} palette={palette} onOpenTruck={onOpenTruck}/>}
      </div>
    </div>
  );
}

const ViewSwitcher = ({ value, onChange }) => (
  <div style={{
    display: "inline-flex", padding: 2, borderRadius: 6, background: "var(--bg-shell)",
    border: "1px solid var(--border2)",
  }}>
    {[
      { v: "tree",  label: "Tree",  icon: "list"  },
      { v: "kpi",   label: "KPI",   icon: "chart" },
      { v: "cards", label: "Cards", icon: "grid"  },
    ].map(o => (
      <button key={o.v} onClick={() => onChange(o.v)} style={{
        height: 24, padding: "0 10px", borderRadius: 4, border: 0,
        background: value === o.v ? "var(--bg)" : "transparent",
        color: value === o.v ? "var(--text)" : "var(--text2)",
        fontWeight: value === o.v ? 700 : 500, fontSize: 12, cursor: "pointer",
        boxShadow: value === o.v ? "0 1px 2px rgba(0,0,0,.1)" : "none",
        fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
      }}>
        <Icon name={o.icon} size={11}/> {o.label}
      </button>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────
// VARIATION 1 — Tree table (master/detail)
// ─────────────────────────────────────────────────────────────
function TreeView({ customers, totals, density, palette, onOpenTruck }) {
  const [expanded, setExpanded] = React.useState(() => new Set(customers.slice(0, 2).map(c => c.code)));
  const toggle = (k) => {
    const n = new Set(expanded);
    n.has(k) ? n.delete(k) : n.add(k);
    setExpanded(n);
  };
  const rowH = density === "compact" ? 32 : 44;
  const cellPad = density === "compact" ? "0 10px" : "0 14px";

  return (
    <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: COLS, alignItems: "center",
                    background: "#FAFBFC", borderBottom: "2px solid var(--border2)",
                    fontSize: 11, fontWeight: 700, color: "var(--text2)",
                    textTransform: "uppercase", letterSpacing: ".04em", height: 36 }}>
        <div style={{ padding: cellPad }}>Customer / ship-to / billing</div>
        <div style={{ padding: cellPad, textAlign: "right" }}>Qty</div>
        <div style={{ padding: cellPad, textAlign: "right" }}>Credit</div>
        <div style={{ padding: cellPad, textAlign: "right" }}>Cash</div>
        <div style={{ padding: cellPad, textAlign: "right" }}>Bank transfer</div>
        <div style={{ padding: cellPad, textAlign: "right" }}>Total</div>
        <div style={{ padding: cellPad }}>Status</div>
      </div>
      {customers.length === 0 && <EmptyState/>}
      {customers.map(c => (
        <React.Fragment key={c.code}>
          <div onClick={() => toggle(c.code)} style={{
            display: "grid", gridTemplateColumns: COLS, alignItems: "center",
            height: rowH, borderBottom: "1px solid var(--border2)",
            cursor: "pointer", background: expanded.has(c.code) ? "#FBFCFE" : "var(--bg)",
            transition: "background .15s",
          }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-shell)"}
             onMouseOut={e => e.currentTarget.style.background = expanded.has(c.code) ? "#FBFCFE" : "var(--bg)"}>
            <div style={{ padding: cellPad, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <Icon name={expanded.has(c.code) ? "chevDown" : "chevRight"} size={14} color="var(--text2)"/>
              <CustomerCell cust={c}/>
            </div>
            <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
              {c.sums.qty.toLocaleString()} <span style={{ color: "var(--text3)", fontSize: 11 }}>CS</span>
            </div>
            {["credit","cash","bank"].map(p => (
              <div key={p} style={{ padding: cellPad, textAlign: "right",
                                    fontVariantNumeric: "tabular-nums",
                                    color: c.sums[p] > 0 ? "var(--text)" : "var(--text3)" }}>
                {c.sums[p] > 0 ? fmtTHB(c.sums[p]) : "–"}
              </div>
            ))}
            <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 700,
                          fontFamily: "'72 Duplex','72'" }}>{fmtTHB(c.sums.total)}</div>
            <div style={{ padding: cellPad }}>
              <BillingStatusMix billings={c.billings} palette={palette}/>
            </div>
          </div>
          {expanded.has(c.code) && Object.values(c.shipTos).map(st => (
            <ShipToRows key={st.stId} shipTo={st} density={density} palette={palette} cellPad={cellPad} rowH={rowH} onOpenTruck={onOpenTruck}/>
          ))}
        </React.Fragment>
      ))}
      {/* Totals row */}
      {customers.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: COLS, alignItems: "center",
                      height: rowH, background: "#F0F4F9", fontWeight: 700, fontFamily: "'72 Duplex','72'" }}>
          <div style={{ padding: cellPad, fontSize: 13 }}>TOTAL · {customers.length} customers</div>
          <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{totals.qty.toLocaleString()} CS</div>
          <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#0064D9" }}>{fmtTHB(totals.credit)}</div>
          <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#25713A" }}>{fmtTHB(totals.cash)}</div>
          <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#5C2E8E" }}>{fmtTHB(totals.bank)}</div>
          <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtTHB(totals.total)}</div>
          <div style={{ padding: cellPad }}></div>
        </div>
      )}
    </div>
  );
}
const COLS = "minmax(360px, 2.5fr) 120px 150px 150px 170px 170px 160px";

const CustomerCell = ({ cust }) => (
  <div style={{ minWidth: 0, flex: 1 }}>
    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
      <span style={{ fontSize: 12, fontFamily: "'72 Duplex','72'", color: "var(--text2)", fontWeight: 600 }}>{cust.code}</span>
      <span style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{cust.en}</span>
      <span style={{ fontSize: 11, padding: "0 6px", height: 16, borderRadius: 3,
                     background: "var(--bg-shell)", color: "var(--text2)", display: "inline-flex", alignItems: "center", fontWeight: 600 }}>
        {cust.channel}
      </span>
    </div>
    <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 480 }}>{cust.name}</div>
  </div>
);

const BillingStatusMix = ({ billings, palette }) => {
  // group by status
  const groups = {};
  billings.forEach(b => { groups[b.status] = (groups[b.status] || 0) + 1; });
  const entries = Object.entries(groups);
  if (entries.length === 1) {
    return <StatusTag status={entries[0][0]} palette={palette} size="sm"/>;
  }
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {entries.map(([k, n]) => (
        <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <StatusTag status={k} palette={palette} size="sm"/>
          <span style={{ fontSize: 11, color: "var(--text2)", fontWeight: 700 }}>×{n}</span>
        </span>
      ))}
    </div>
  );
};

function ShipToRows({ shipTo, density, palette, cellPad, rowH, onOpenTruck }) {
  // group billings under ship-to by delivery
  const byDel = {};
  shipTo.billings.forEach(b => { (byDel[b.delivery] = byDel[b.delivery] || []).push(b); });
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: COLS, alignItems: "center",
                    minHeight: rowH - 4, background: "#F7F9FC",
                    borderBottom: "1px solid var(--border2)" }}>
        <div style={{ padding: `${density === "compact" ? "4px" : "6px"} ${cellPad.split(" ")[1]}`, paddingLeft: 40,
                      display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="pin" size={11} color="var(--text2)"/>
          <span style={{ fontSize: 12, fontFamily: "'72 Duplex','72'", color: "var(--text2)", fontWeight: 600 }}>{shipTo.stId}</span>
          <span style={{ fontSize: 12, fontWeight: 700 }}>{shipTo.name}</span>
        </div>
        <div style={{ padding: cellPad, textAlign: "right", fontSize: 11, color: "var(--text2)" }}>{shipTo.billings.reduce((s, b) => s + b.qty, 0)} CS</div>
        <div/> <div/> <div/> <div/><div/>
      </div>
      {Object.entries(byDel).map(([dn, bs]) => (
        <React.Fragment key={dn}>
          {bs.map((b, i) => (
            <div key={b.billing} style={{
              display: "grid", gridTemplateColumns: COLS, alignItems: "center",
              minHeight: rowH - 6, padding: density === "compact" ? "4px 0" : "6px 0",
              borderBottom: "1px solid var(--border2)", background: "var(--bg)",
              fontSize: 13, cursor: "pointer",
            }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-shell)"}
               onMouseOut={e => e.currentTarget.style.background = "var(--bg)"}
               onClick={() => onOpenTruck?.(b.truck)}>
              <div style={{ padding: cellPad, paddingLeft: 68, display: "flex", alignItems: "center", gap: 8 }}>
                {i === 0 && <span style={{ fontSize: 11, color: "var(--text2)" }}>Delivery {dn}</span>}
                <span style={{ fontSize: 12, fontFamily: "'72 Duplex','72'", color: "var(--blue-h)", fontWeight: 600 }}>{b.billing}</span>
                <PaymentTag type={b.payment}/>
                <span style={{ fontSize: 11, color: "var(--text3)" }}>· {b.truck}</span>
              </div>
              <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{b.qty} CS</div>
              <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums", color: b.payment === "credit" ? "var(--text)" : "var(--text3)" }}>{b.payment === "credit" ? fmtTHB(b.total) : "–"}</div>
              <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums", color: b.payment === "cash" ? "var(--text)" : "var(--text3)" }}>{b.payment === "cash" ? fmtTHB(b.total) : "–"}</div>
              <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums", color: b.payment === "bank" ? "var(--text)" : "var(--text3)" }}>{b.payment === "bank" ? fmtTHB(b.total) : "–"}</div>
              <div style={{ padding: cellPad, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{fmtTHB(b.total)}</div>
              <div style={{ padding: cellPad }}><StatusTag status={b.status} palette={palette} size="sm"/></div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </>
  );
}

const EmptyState = () => (
  <div style={{ padding: 64, textAlign: "center", color: "var(--text2)" }}>
    <Icon name="search" size={36} color="var(--text3)" style={{ marginBottom: 12 }}/>
    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>No billings match your filters</div>
    <div style={{ fontSize: 13, marginTop: 4 }}>Try clearing one of the filters above.</div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// VARIATION 2 — KPI dashboard + flat customer-grouped table
// ─────────────────────────────────────────────────────────────
function KPIFlatView({ customers, totals, filtered, density, palette, onOpenTruck }) {
  // status mix
  const statusMix = {};
  filtered.forEach(b => statusMix[b.status] = (statusMix[b.status] || 0) + 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* KPI strip */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <KPITile label="Total billings"  value={filtered.length} sub={`${totals.qty.toLocaleString()} cases`} icon="receipt"/>
        <KPITile label="Total amount" value={fmtTHB(totals.total)} sub={`incl. VAT 7%`} icon="cash" accent="var(--blue)"/>
        <KPITile label="Credit"  value={fmtTHB(totals.credit)} sub={pct(totals.credit, totals.total) + " of total"} icon="file" accent="#0064D9"/>
        <KPITile label="Cash"    value={fmtTHB(totals.cash)}   sub={pct(totals.cash, totals.total) + " of total"} icon="cash" accent="#30914C"/>
        <KPITile label="Bank transfer" value={fmtTHB(totals.bank)} sub={pct(totals.bank, totals.total) + " of total"} icon="package" accent="#7B4FAB"/>
        <KPITile label="Drafts / Rework" value={`${totals.drafts} / ${totals.rework}`} sub="awaiting your action" icon="alert" accent="var(--warn)"/>
      </div>

      {/* Status pipeline */}
      <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", padding: 16,
                    display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Today's pipeline</div>
          <div style={{ fontSize: 12, color: "var(--text2)" }}>Across all selected billings</div>
        </div>
        <PipelineBar billings={filtered} palette={palette}/>
      </div>

      {/* Customer-grouped flat table */}
      <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border2)",
                      display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Customer rollup</div>
          <div style={{ fontSize: 12, color: "var(--text2)" }}>{customers.length} customers · sorted by total amount</div>
        </div>
        {customers.length === 0 && <EmptyState/>}
        {customers.sort((a, b) => b.sums.total - a.sums.total).map(c => (
          <CustomerFlatRow key={c.code} cust={c} density={density} palette={palette} onOpenTruck={onOpenTruck}/>
        ))}
      </div>
    </div>
  );
}

const pct = (n, total) => total ? ((n / total) * 100).toFixed(1) + "%" : "0%";

function PipelineBar({ billings, palette }) {
  const order = ["draft","submitted","review","settled","closed","rejected","rework"];
  const groups = order.map(k => ({ k, n: billings.filter(b => b.status === k).length })).filter(g => g.n > 0);
  const tot = groups.reduce((s, g) => s + g.n, 0) || 1;
  return (
    <>
      <div style={{ height: 12, borderRadius: 6, overflow: "hidden", display: "flex", background: "var(--bg-shell)" }}>
        {groups.map(g => {
          const c = (STATUS_PALETTES[palette] || STATUS_PALETTES.fiori)[g.k];
          return <div key={g.k} style={{ width: `${(g.n/tot)*100}%`, background: c.dot, height: "100%" }} title={`${STATUS[g.k].label} · ${g.n}`}/>;
        })}
      </div>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        {groups.map(g => (
          <div key={g.k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <StatusTag status={g.k} palette={palette} size="sm"/>
            <span style={{ fontWeight: 700, color: "var(--text)" }}>{g.n}</span>
            <span style={{ color: "var(--text2)" }}>{pct(g.n, tot)}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function CustomerFlatRow({ cust, density, palette, onOpenTruck }) {
  const [open, setOpen] = React.useState(false);
  const cellPad = density === "compact" ? "10px 12px" : "14px 16px";
  const max = Math.max(cust.sums.credit, cust.sums.cash, cust.sums.bank, 1);
  const trucks = [...new Set(cust.billings.map(b => b.truck))];
  return (
    <>
      <div onClick={() => setOpen(!open)} style={{
        display: "grid", gridTemplateColumns: "32px 2fr 100px 1fr 200px 110px",
        alignItems: "center", padding: cellPad, gap: 12,
        borderBottom: open ? "1px solid var(--border2)" : "1px solid var(--border3)",
        cursor: "pointer", background: open ? "#FBFCFE" : "var(--bg)",
      }} onMouseOver={e => !open && (e.currentTarget.style.background = "var(--bg-shell)")}
         onMouseOut={e => !open && (e.currentTarget.style.background = "var(--bg)")}>
        <Icon name={open ? "chevDown" : "chevRight"} size={16} color="var(--text2)"/>
        <CustomerCell cust={cust}/>
        <div style={{ textAlign: "right", fontSize: 12 }}>
          <div style={{ fontWeight: 700 }}>{cust.billings.length} bills</div>
          <div style={{ color: "var(--text2)" }}>{cust.sums.qty} CS</div>
        </div>
        <div>
          <PaymentMixBar credit={cust.sums.credit} cash={cust.sums.cash} bank={cust.sums.bank} max={max}/>
        </div>
        <div style={{ fontFamily: "'72 Duplex','72'", fontSize: 16, fontWeight: 700, textAlign: "right" }}>
          {fmtTHB(cust.sums.total)}
        </div>
        <div><BillingStatusMix billings={cust.billings} palette={palette}/></div>
      </div>
      {open && (
        <div style={{ background: "#FBFCFE", borderBottom: "1px solid var(--border2)" }}>
          {Object.values(cust.shipTos).map(st => (
            <div key={st.stId} style={{ borderBottom: "1px solid var(--border3)", paddingLeft: 44 }}>
              <div style={{ fontSize: 11, color: "var(--text2)", padding: "8px 16px 4px", fontWeight: 700 }}>
                <Icon name="pin" size={10}/> {st.stId} · {st.name}
              </div>
              {st.billings.map(b => (
                <div key={b.billing} onClick={() => onOpenTruck?.(b.truck)} style={{
                  display: "grid",
                  gridTemplateColumns: "120px 90px 100px 1fr 110px 110px",
                  gap: 12, padding: "8px 16px", fontSize: 13,
                  alignItems: "center", cursor: "pointer",
                }}>
                  <span style={{ fontFamily: "'72 Duplex','72'", color: "var(--blue-h)", fontWeight: 600 }}>{b.billing}</span>
                  <span style={{ color: "var(--text2)" }}>{b.delivery}</span>
                  <PaymentTag type={b.payment}/>
                  <span style={{ color: "var(--text2)", fontSize: 12 }}>{b.qty} CS · {b.truck}</span>
                  <span style={{ textAlign: "right", fontFamily: "'72 Duplex','72'", fontWeight: 600 }}>{fmtTHB(b.total)}</span>
                  <StatusTag status={b.status} palette={palette} size="sm"/>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function PaymentMixBar({ credit, cash, bank, max }) {
  const total = credit + cash + bank || 1;
  return (
    <div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "var(--bg-shell)" }}>
        {credit > 0 && <div style={{ width: `${(credit/total)*100}%`, background: "#0064D9" }} title={`Credit ${fmtTHB(credit)}`}/>}
        {cash > 0   && <div style={{ width: `${(cash/total)*100}%`,   background: "#30914C" }} title={`Cash ${fmtTHB(cash)}`}/>}
        {bank > 0   && <div style={{ width: `${(bank/total)*100}%`,   background: "#7B4FAB" }} title={`Bank ${fmtTHB(bank)}`}/>}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4, fontSize: 11, color: "var(--text2)" }}>
        {credit > 0 && <span><i style={{ ...dotSt, background: "#0064D9" }}/>C {fmtTHB(credit)}</span>}
        {cash > 0   && <span><i style={{ ...dotSt, background: "#30914C" }}/>${" "}{fmtTHB(cash)}</span>}
        {bank > 0   && <span><i style={{ ...dotSt, background: "#7B4FAB" }}/>B {fmtTHB(bank)}</span>}
      </div>
    </div>
  );
}
const dotSt = { display: "inline-block", width: 6, height: 6, borderRadius: "50%", marginRight: 4, marginBottom: 1 };

// ─────────────────────────────────────────────────────────────
// VARIATION 3 — Customer cards
// ─────────────────────────────────────────────────────────────
function CardsView({ customers, totals, density, palette, onOpenTruck }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Compact summary strip */}
      <div style={{ display: "flex", gap: 12 }}>
        <KPITile label="Total amount" value={fmtTHB(totals.total)} sub={`${customers.length} customers · ${totals.qty} cases`} icon="cash" accent="var(--blue)"/>
        <KPITile label="Credit" value={fmtTHB(totals.credit)} sub={pct(totals.credit, totals.total)} icon="file" accent="#0064D9"/>
        <KPITile label="Cash" value={fmtTHB(totals.cash)} sub={pct(totals.cash, totals.total)} icon="cash" accent="#30914C"/>
        <KPITile label="Bank" value={fmtTHB(totals.bank)} sub={pct(totals.bank, totals.total)} icon="package" accent="#7B4FAB"/>
      </div>

      {customers.length === 0 && (
        <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)" }}><EmptyState/></div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 12 }}>
        {customers.sort((a, b) => b.sums.total - a.sums.total).map(c => (
          <CustomerCard key={c.code} cust={c} density={density} palette={palette} onOpenTruck={onOpenTruck}/>
        ))}
      </div>
    </div>
  );
}

function CustomerCard({ cust, density, palette, onOpenTruck }) {
  const trucks = [...new Set(cust.billings.map(b => b.truck))];
  return (
    <div style={{
      background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)",
      padding: 14, display: "flex", flexDirection: "column", gap: 10,
      border: "1px solid var(--border3)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
            <span style={{ fontSize: 11, fontFamily: "'72 Duplex','72'", color: "var(--text2)", fontWeight: 600 }}>{cust.code}</span>
            <span style={{ fontSize: 11, padding: "0 6px", height: 16, borderRadius: 3,
                           background: "var(--bg-shell)", color: "var(--text2)", display: "inline-flex", alignItems: "center", fontWeight: 600 }}>
              {cust.channel}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{cust.en}</div>
          <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cust.name}</div>
        </div>
        <BillingStatusMix billings={cust.billings} palette={palette}/>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "'72 Duplex','72'", letterSpacing: "-0.01em" }}>{fmtTHB(cust.sums.total)}</span>
        <span style={{ fontSize: 12, color: "var(--text2)" }}>· {cust.billings.length} billings · {cust.sums.qty} CS</span>
      </div>

      {/* mix bar */}
      <div>
        <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "var(--bg-shell)" }}>
          {cust.sums.credit > 0 && <div style={{ width: `${(cust.sums.credit/cust.sums.total)*100}%`, background: "#0064D9" }}/>}
          {cust.sums.cash > 0   && <div style={{ width: `${(cust.sums.cash/cust.sums.total)*100}%`,   background: "#30914C" }}/>}
          {cust.sums.bank > 0   && <div style={{ width: `${(cust.sums.bank/cust.sums.total)*100}%`,   background: "#7B4FAB" }}/>}
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 6, fontSize: 11 }}>
          {cust.sums.credit > 0 && <Legend dot="#0064D9" label="Credit" value={fmtTHB(cust.sums.credit)}/>}
          {cust.sums.cash > 0   && <Legend dot="#30914C" label="Cash"   value={fmtTHB(cust.sums.cash)}/>}
          {cust.sums.bank > 0   && <Legend dot="#7B4FAB" label="Bank"   value={fmtTHB(cust.sums.bank)}/>}
        </div>
      </div>

      <div style={{ marginTop: 4, paddingTop: 10, borderTop: "1px solid var(--border3)",
                    display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ fontSize: 11, color: "var(--text2)", display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="truck" size={12}/> {trucks.map(t => <span key={t} onClick={() => onOpenTruck?.(t)} style={{ color: "var(--blue-h)", cursor: "pointer", fontWeight: 600 }}>{t}</span>).reduce((p, c) => p ? [p, ", ", c] : c, null)}
        </div>
        <Btn variant="ghost" density="compact" icon="eye" onClick={() => onOpenTruck?.(trucks[0])}>Open</Btn>
      </div>
    </div>
  );
}

const Legend = ({ dot, label, value }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--text2)" }}>
    <i style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: dot }}/>
    <span style={{ fontWeight: 700, color: "var(--text)" }}>{label}</span>
    <span>{value}</span>
  </span>
);

// ─────────────────────────────────────────────────────────────
// Side-nav status pages — Rework queue / Settled / Closed
// Focused list view for a single billing status. Used from both
// the admin and cashier side-navs.
// ─────────────────────────────────────────────────────────────
const STATUS_PAGE_CONFIG = {
  rework: {
    title:      "Rework queue",
    subtitle:   "Billings returned by the cashier — review the rejection reason, correct, and re-submit.",
    emptyTitle: "No billings in rework right now",
    emptySub:   "When the cashier rejects a billing it lands here for the sales admin to fix and re-submit.",
    iconName:   "alert",
    iconColor:  "var(--warn)",
    detailColHeader: "Rejection reason",
    detailColMin:    "minmax(260px, 1.4fr)",
  },
  settled: {
    title:      "Settled",
    subtitle:   "Billings approved by the cashier — settle the truck to post to SAP.",
    emptyTitle: "No settled billings yet",
    emptySub:   "Once the cashier approves a billing it shows here, ready for truck settlement and SAP posting.",
    iconName:   "check",
    iconColor:  "var(--pos)",
    detailColHeader: "Status",
    detailColMin:    "150px",
  },
  closed: {
    title:      "Closed (posted)",
    subtitle:   "Settled trucks that have been posted to SAP — final, read-only.",
    emptyTitle: "No closed billings yet",
    emptySub:   "After a truck is settled, its billings are posted to SAP and appear here.",
    iconName:   "file",
    iconColor:  "var(--text2)",
    detailColHeader: "Posted",
    detailColMin:    "200px",
  },
};

function StatusFilteredPage({ status, billings, density, palette, onOpenTruck }) {
  const rows = billings.filter(b => b.status === status);
  const rowH    = density === "compact" ? 36 : 44;
  const cellPad = density === "compact" ? "8px 12px" : "10px 12px";

  const cfg = STATUS_PAGE_CONFIG[status] || STATUS_PAGE_CONFIG.settled;

  const totals = rows.reduce((s, b) => {
    s.qty += b.qty; s.total += b.total;
    s[b.payment] = (s[b.payment] || 0) + b.total;
    return s;
  }, { qty: 0, credit: 0, cash: 0, bank: 0, total: 0 });

  const COLS = `140px 110px minmax(280px, 1.6fr) 90px 150px 130px ${cfg.detailColMin}`;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageTitle
        title={cfg.title}
        subtitle={`${TODAY} · ${rows.length} billing${rows.length === 1 ? "" : "s"} · ${totals.qty.toLocaleString()} cases · ${fmtTHB(totals.total)}`}
      />
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        {rows.length === 0 ? (
          <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)",
                        padding: 64, textAlign: "center", color: "var(--text2)" }}>
            <Icon name={cfg.iconName} size={36} color={cfg.iconColor} style={{ marginBottom: 12 }}/>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{cfg.emptyTitle}</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>{cfg.emptySub}</div>
          </div>
        ) : (
          <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: COLS, columnGap: 16,
                          padding: cellPad, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                          letterSpacing: "0.06em", color: "var(--text2)",
                          background: "var(--bg-shell)", borderBottom: "1px solid var(--border2)" }}>
              <div>Billing</div>
              <div>Truck</div>
              <div>Ship-to · Customer</div>
              <div style={{ textAlign: "right" }}>Cases</div>
              <div style={{ textAlign: "right" }}>Total (incl. VAT)</div>
              <div>Payment</div>
              <div>{cfg.detailColHeader}</div>
            </div>
            {rows.map((b, i) => {
              const st = SHIP_TO[b.shipTo];
              const cust = CUSTOMERS[st.code];
              return (
                <div key={b.billing} style={{ display: "grid", gridTemplateColumns: COLS, columnGap: 16,
                          padding: cellPad, alignItems: "center", minHeight: rowH,
                          borderBottom: i < rows.length - 1 ? "1px solid var(--border3)" : "none",
                          fontSize: 13 }}>
                  <div style={{ fontFamily: "var(--mono, monospace)", fontWeight: 600, whiteSpace: "nowrap" }}>{b.billing}</div>
                  <div style={{ whiteSpace: "nowrap" }}>
                    <a onClick={() => onOpenTruck?.(b.truck)}
                       style={{ color: "var(--blue-h)", cursor: "pointer", fontWeight: 600 }}>{b.truck}</a>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden",
                                  textOverflow: "ellipsis" }} title={st.name}>{st.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)", whiteSpace: "nowrap",
                                  overflow: "hidden", textOverflow: "ellipsis" }} title={cust.en}>
                      {b.shipTo} · {cust.en}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{b.qty.toLocaleString()}</div>
                  <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtTHB(b.total)}</div>
                  <div style={{ whiteSpace: "nowrap" }}><PaymentTag type={b.payment}/></div>
                  <div style={{ minWidth: 0 }}>
                    {status === "rework" ? (
                      <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.4 }} title={b.rejectReason || ""}>
                        {b.rejectReason || <span style={{ fontStyle: "italic" }}>No reason captured.</span>}
                      </div>
                    ) : status === "closed" ? (
                      <div style={{ fontSize: 12, color: "var(--text2)", whiteSpace: "nowrap" }}>
                        {b.postedAt ? `Posted ${b.postedAt}` : "Posted to SAP"}
                      </div>
                    ) : (
                      <StatusTag status={b.status} palette={palette} size="sm"/>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Admin / Trucks — list of trucks with rollup totals
// ─────────────────────────────────────────────────────────────
function TrucksListPage({ billings, density, palette, onOpenTruck }) {
  // Recompute rollups from current billings so status reflects mutations.
  const rollups = TRUCKS.map(t => {
    const bs = billings.filter(b => b.truck === t.no);
    const sum = { qty: 0, credit: 0, cash: 0, bank: 0, total: 0 };
    bs.forEach(b => { sum.qty += b.qty; sum.total += b.total; sum[b.payment] += b.total; });
    const order = ["draft","rework","rejected","submitted","review","settled","closed"];
    const statuses = bs.map(b => b.status);
    let truckStatus = bs.length ? "closed" : "draft";
    for (const s of order) if (statuses.includes(s)) { truckStatus = s; break; }
    return { ...t, ...sum, count: bs.length, status: truckStatus };
  }).filter(t => t.count > 0);

  const cellPad = density === "compact" ? "10px 12px" : "12px 12px";
  const COLS = "120px 130px minmax(180px, 1.4fr) 100px 110px 70px 90px 140px 110px";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageTitle
        title="Trucks"
        subtitle={`${TODAY} · ${rollups.length} trucks dispatched · ${rollups.reduce((s, t) => s + t.count, 0)} billings · ${fmtTHB(rollups.reduce((s, t) => s + t.total, 0))}`}
      />
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: COLS, columnGap: 16,
                        padding: cellPad, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.06em", color: "var(--text2)",
                        background: "var(--bg-shell)", borderBottom: "1px solid var(--border2)" }}>
            <div>Truck</div>
            <div>Plate</div>
            <div>Driver</div>
            <div>Route</div>
            <div>Depart / Return</div>
            <div style={{ textAlign: "right" }}>Billings</div>
            <div style={{ textAlign: "right" }}>Cases</div>
            <div style={{ textAlign: "right" }}>Total (incl. VAT)</div>
            <div>Status</div>
          </div>
          {rollups.map((t, i) => (
            <div key={t.no} onClick={() => onOpenTruck?.(t.no)}
                 style={{ display: "grid", gridTemplateColumns: COLS, columnGap: 16,
                          padding: cellPad, alignItems: "center",
                          borderBottom: i < rollups.length - 1 ? "1px solid var(--border3)" : "none",
                          fontSize: 13, cursor: "pointer" }}>
              <div style={{ whiteSpace: "nowrap" }}>
                <a style={{ color: "var(--blue-h)", fontWeight: 700 }}>{t.no}</a>
              </div>
              <div style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{t.plate}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={t.driver}>{t.driver}</div>
                <div style={{ fontSize: 11, color: "var(--text2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={t.driverEn}>{t.driverEn}</div>
              </div>
              <div style={{ whiteSpace: "nowrap" }}>{t.route}</div>
              <div style={{ fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", fontSize: 12, color: "var(--text2)" }}>
                {t.depart} → {t.returnT}
              </div>
              <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{t.count}</div>
              <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{t.qty.toLocaleString()}</div>
              <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtTHB(t.total)}</div>
              <div style={{ whiteSpace: "nowrap" }}><StatusTag status={t.status} palette={palette} size="sm"/></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Admin / Customers — list rollup by customer
// ─────────────────────────────────────────────────────────────
function CustomersListPage({ billings, density, palette, onOpenTruck }) {
  const byCustomer = {};
  billings.forEach(b => {
    const code = SHIP_TO[b.shipTo].code;
    if (!byCustomer[code]) {
      const c = CUSTOMERS[code];
      byCustomer[code] = { code, name: c.name, en: c.en, channel: c.channel, pay: c.pay,
                           count: 0, qty: 0, total: 0, trucks: new Set(), shipTos: new Set(),
                           statusMix: {} };
    }
    const row = byCustomer[code];
    row.count++; row.qty += b.qty; row.total += b.total;
    row.trucks.add(b.truck); row.shipTos.add(b.shipTo);
    row.statusMix[b.status] = (row.statusMix[b.status] || 0) + 1;
  });
  const rows = Object.values(byCustomer).sort((a, b) => b.total - a.total);

  const cellPad = density === "compact" ? "10px 12px" : "12px 12px";
  const COLS = "minmax(280px, 1.8fr) 140px 110px 70px 110px 110px 90px 140px";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageTitle
        title="Customers"
        subtitle={`${TODAY} · ${rows.length} customers active · ${rows.reduce((s, r) => s + r.count, 0)} billings · ${fmtTHB(rows.reduce((s, r) => s + r.total, 0))}`}
      />
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: COLS, columnGap: 16,
                        padding: cellPad, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: "0.06em", color: "var(--text2)",
                        background: "var(--bg-shell)", borderBottom: "1px solid var(--border2)" }}>
            <div>Customer</div>
            <div>Channel</div>
            <div>Payment</div>
            <div style={{ textAlign: "right" }}>Bills</div>
            <div style={{ textAlign: "right" }}>Ship-tos</div>
            <div style={{ textAlign: "right" }}>Trucks</div>
            <div style={{ textAlign: "right" }}>Cases</div>
            <div style={{ textAlign: "right" }}>Total (incl. VAT)</div>
          </div>
          {rows.map((r, i) => {
            const firstTruck = [...r.trucks][0];
            return (
              <div key={r.code} onClick={() => onOpenTruck?.(firstTruck)}
                   style={{ display: "grid", gridTemplateColumns: COLS, columnGap: 16,
                            padding: cellPad, alignItems: "center",
                            borderBottom: i < rows.length - 1 ? "1px solid var(--border3)" : "none",
                            fontSize: 13, cursor: "pointer" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.name}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "var(--text2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.en}>
                    {r.code} · {r.en}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={r.channel}>{r.channel}</div>
                <div style={{ whiteSpace: "nowrap" }}><PaymentTag type={r.pay}/></div>
                <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{r.count}</div>
                <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{r.shipTos.size}</div>
                <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{r.trucks.size}</div>
                <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{r.qty.toLocaleString()}</div>
                <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtTHB(r.total)}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Cashier / Reports — small summary placeholder page
// ─────────────────────────────────────────────────────────────
function CashierReportsPage({ billings, density, palette }) {
  const totals = billings.reduce((s, b) => {
    s.qty += b.qty; s.total += b.total;
    s[b.payment] += b.total;
    s.statusMix[b.status] = (s.statusMix[b.status] || 0) + 1;
    return s;
  }, { qty: 0, credit: 0, cash: 0, bank: 0, total: 0, statusMix: {} });

  const statuses = ["submitted", "review", "settled", "closed", "rework", "rejected", "draft"];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageTitle
        title="Reports"
        subtitle={`${TODAY} · cashier desk overview — totals across all routed trucks`}
      />
      <div style={{ flex: 1, overflow: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <KPITile label="Total billings" value={billings.length} sub={`${totals.qty.toLocaleString()} cases`} icon="receipt"/>
          <KPITile label="Total amount" value={fmtTHB(totals.total)} sub="incl. VAT 7%" icon="cash" accent="var(--blue)"/>
          <KPITile label="Credit" value={fmtTHB(totals.credit)} sub={pct(totals.credit, totals.total) + " of total"} icon="file" accent="#0064D9"/>
          <KPITile label="Cash"   value={fmtTHB(totals.cash)}   sub={pct(totals.cash, totals.total) + " of total"} icon="cash" accent="#30914C"/>
          <KPITile label="Bank transfer" value={fmtTHB(totals.bank)} sub={pct(totals.bank, totals.total) + " of total"} icon="package" accent="#7B4FAB"/>
        </div>

        <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Status breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {statuses.filter(s => totals.statusMix[s]).map(s => {
              const count = totals.statusMix[s];
              const ratio = count / billings.length;
              return (
                <div key={s} style={{ display: "grid", gridTemplateColumns: "140px 1fr 60px", alignItems: "center", gap: 12 }}>
                  <StatusTag status={s} palette={palette} size="sm"/>
                  <div style={{ height: 8, background: "var(--bg-shell)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ width: `${ratio * 100}%`, height: "100%", background: "var(--blue)" }}/>
                  </div>
                  <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontSize: 13, fontWeight: 600 }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", padding: 16,
                      fontSize: 12, color: "var(--text2)" }}>
          Full export / scheduled reports are out of scope for this prototype. Use <strong>Daily report</strong> for line-item drill-down and the <strong>Closed (posted)</strong> queue for SAP-posted history.
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AdminReport, StatusFilteredPage, TrucksListPage, CustomersListPage, CashierReportsPage });
