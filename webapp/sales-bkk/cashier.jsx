/* ──────────────────────────────────────────────────────────────
 * Cashier — Review queue + truck review (line-by-line settlement)
 * ────────────────────────────────────────────────────────────── */

// ─────────────────────────────────────────────────────────────
// Cashier — Review queue (list of submitted/under-review trucks)
// ─────────────────────────────────────────────────────────────
function CashierQueue({ billings, filters, setFilters, density, palette, onOpenTruck }) {
  // build trucks-with-totals from current billings state
  const trucks = TRUCKS.map(t => {
    const bs = billings.filter(b => b.truck === t.no);
    const order = ["draft","rework","rejected","submitted","review","settled","closed"];
    const statuses = bs.map(b => b.status);
    let truckStatus = "closed";
    for (const s of order) if (statuses.includes(s)) { truckStatus = s; break; }
    const sum = bs.reduce((s, b) => ({
      qty: s.qty + b.qty, total: s.total + b.total,
      credit: s.credit + (b.payment === "credit" ? b.total : 0),
      cash:   s.cash   + (b.payment === "cash"   ? b.total : 0),
      bank:   s.bank   + (b.payment === "bank"   ? b.total : 0),
      count:  s.count + 1,
      submitted: s.submitted + ((b.status === "submitted" || b.status === "review") ? 1 : 0),
    }), { qty: 0, total: 0, credit: 0, cash: 0, bank: 0, count: 0, submitted: 0 });
    return { ...t, ...sum, status: truckStatus };
  });
  // queue = trucks that have something to review (submitted or under review)
  const queue = trucks.filter(t => t.submitted > 0);
  const reviewed = trucks.filter(t => t.submitted === 0 && t.count > 0);

  const totals = billings.reduce((s, b) => {
    if (b.status !== "submitted" && b.status !== "review") return s;
    s.total += b.total; s.qty += b.qty;
    s[b.payment] += b.total;
    s.count++;
    return s;
  }, { qty: 0, total: 0, credit: 0, cash: 0, bank: 0, count: 0 });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageTitle
        title="Cashier review queue"
        subtitle={`${TODAY} · ${queue.length} trucks awaiting review · ${totals.count} billings · ${fmtTHB(totals.total)}`}
        actions={<>
          <Btn variant="secondary" icon="download" density={density}>Export</Btn>
          <Btn variant="secondary" icon="refresh" density={density}>Refresh</Btn>
        </>}
      />

      <div style={{ padding: "16px 24px 0", display: "flex", gap: 12 }}>
        <KPITile label="Awaiting review" value={queue.length} sub={`${totals.count} billings`} icon="alert" accent="var(--warn)"/>
        <KPITile label="Pending total" value={fmtTHB(totals.total)} sub={`${totals.qty} cases`} accent="var(--blue)" icon="cash"/>
        <KPITile label="Credit"  value={fmtTHB(totals.credit)} sub={pct2(totals.credit, totals.total)} icon="file" accent="#0064D9"/>
        <KPITile label="Cash to clear"   value={fmtTHB(totals.cash)}   sub={pct2(totals.cash, totals.total)} icon="cash" accent="#30914C"/>
        <KPITile label="Bank to clear"   value={fmtTHB(totals.bank)}   sub={pct2(totals.bank, totals.total)} icon="package" accent="#7B4FAB"/>
      </div>

      <div style={{ padding: "16px 24px 8px" }}>
        <FilterBarMini filters={filters} onChange={setFilters} density={density}/>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "0 24px 24px" }}>
        <SectionHeader title="To review" count={queue.length} tone="warn"/>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {queue.length === 0 && (
            <div style={{ padding: 32, textAlign: "center", color: "var(--text2)",
                          background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)" }}>
              <Icon name="check" size={36} color="var(--pos)" style={{ marginBottom: 8 }}/>
              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>All caught up!</div>
              <div style={{ fontSize: 13, marginTop: 2 }}>No trucks waiting for review.</div>
            </div>
          )}
          {queue.map(t => <TruckQueueCard key={t.no} truck={t} billings={billings.filter(b => b.truck === t.no)}
                                           palette={palette} onOpen={() => onOpenTruck(t.no)}/>)}
        </div>

        <SectionHeader title="Recently processed" count={reviewed.length}/>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {reviewed.map(t => <TruckQueueCard key={t.no} truck={t} billings={billings.filter(b => b.truck === t.no)}
                                              palette={palette} onOpen={() => onOpenTruck(t.no)} done/>)}
        </div>
      </div>
    </div>
  );
}

const SectionHeader = ({ title, count, tone }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
    <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</h3>
    <span style={{
      minWidth: 22, padding: "0 6px", height: 18, borderRadius: 9,
      background: tone === "warn" ? "var(--warn)" : "var(--text2)", color: "#fff",
      fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center",
    }}>{count}</span>
  </div>
);

const pct2 = (n, total) => total ? ((n / total) * 100).toFixed(0) + "% of pending" : "—";

function FilterBarMini({ filters, onChange, density }) {
  const set = (k, v) => onChange({ ...filters, [k]: v });
  const h = density === "compact" ? 28 : 30;
  const fld = {
    height: h, padding: "0 8px", borderRadius: 6, border: "1px solid var(--border)",
    background: "var(--bg)", fontSize: 12, fontFamily: "inherit", color: "var(--text)",
  };
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <Icon name="filter" size={14} color="var(--text2)"/>
      <select value={filters.route} onChange={e => set("route", e.target.value)} style={fld}>
        <option value="">All routes</option>
        {ROUTES.map(r => <option key={r.code} value={r.code}>{r.code} · {r.name}</option>)}
      </select>
      <select value={filters.payment} onChange={e => set("payment", e.target.value)} style={fld}>
        <option value="">All payment types</option>
        {PAYMENT_TYPES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
      </select>
      <select value={filters.truck} onChange={e => set("truck", e.target.value)} style={fld}>
        <option value="">All trucks</option>
        {TRUCKS.map(t => <option key={t.no} value={t.no}>{t.no} · {t.driverEn}</option>)}
      </select>
    </div>
  );
}

// ── Truck card in cashier queue ───────────────────────────────
function TruckQueueCard({ truck, billings, palette, onOpen, done }) {
  const route = ROUTES.find(r => r.code === truck.route);
  const submittedBills = billings.filter(b => b.status === "submitted" || b.status === "review");
  const totalSubmitted = submittedBills.reduce((s, b) => s + b.total, 0);
  const ageMin = parseInt(truck.depart) * 60 + Math.floor(Math.random() * 200); // mock
  const allClosed = billings.every(b => b.status === "closed");
  return (
    <div onClick={onOpen} style={{
      background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)",
      padding: "14px 16px", cursor: "pointer",
      borderLeft: done ? "3px solid var(--pos)" : "3px solid var(--warn)",
      display: "grid", gridTemplateColumns: "auto 1fr auto auto auto auto auto",
      gap: 20, alignItems: "center",
      transition: "transform .12s, box-shadow .12s",
    }} onMouseOver={e => e.currentTarget.style.boxShadow = "var(--sh1)"}
       onMouseOut={e => e.currentTarget.style.boxShadow = "var(--sh0)"}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
        <Icon name="truck" size={22} color={done ? "var(--pos)" : "var(--warn)"}/>
        <span style={{ fontSize: 10, color: "var(--text2)", fontWeight: 700 }}>{truck.plate}</span>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontFamily: "'72 Duplex','72'", fontWeight: 700, fontSize: 16 }}>{truck.no}</span>
          <span style={{ fontSize: 12, color: "var(--text2)" }}>{route?.code} · {route?.name}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
          Driver <b style={{ color: "var(--text)" }}>{truck.driverEn}</b> ({truck.driver}) · Returned {truck.returnT}
        </div>
      </div>
      <Metric label="Billings" value={`${truck.count}`} sub={done ? "" : `${submittedBills.length} new`}/>
      <Metric label="Cases" value={`${truck.qty.toLocaleString()} CS`}/>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
        <span style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>Pending</span>
        <span style={{ fontFamily: "'72 Duplex','72'", fontWeight: 700, fontSize: 17 }}>{fmtTHB(done ? truck.total : totalSubmitted)}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, minWidth: 100 }}>
        <PaymentMixInline credit={truck.credit} cash={truck.cash} bank={truck.bank}/>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
        <BillingStatusMix billings={billings} palette={palette}/>
        <Btn variant={done ? "ghost" : "primary"} density="compact" icon="chevRight"
             onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          {done ? "Open" : "Start review"}
        </Btn>
      </div>
    </div>
  );
}

const Metric = ({ label, value, sub }) => (
  <div>
    <div style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'72 Duplex','72'", marginTop: 2 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: "var(--warn)", fontWeight: 700, marginTop: 1 }}>{sub}</div>}
  </div>
);

const PaymentMixInline = ({ credit, cash, bank }) => {
  const tot = credit + cash + bank || 1;
  return (
    <>
      <div style={{ height: 6, borderRadius: 3, overflow: "hidden", display: "flex", background: "var(--bg-shell)" }}>
        {credit > 0 && <div style={{ width: `${(credit/tot)*100}%`, background: "#0064D9" }}/>}
        {cash > 0   && <div style={{ width: `${(cash/tot)*100}%`,   background: "#30914C" }}/>}
        {bank > 0   && <div style={{ width: `${(bank/tot)*100}%`,   background: "#7B4FAB" }}/>}
      </div>
      <div style={{ fontSize: 10, color: "var(--text2)", display: "flex", gap: 6 }}>
        {credit > 0 && <span style={{ color: "#0064D9", fontWeight: 700 }}>C {Math.round((credit/tot)*100)}%</span>}
        {cash > 0   && <span style={{ color: "#25713A", fontWeight: 700 }}>$ {Math.round((cash/tot)*100)}%</span>}
        {bank > 0   && <span style={{ color: "#5C2E8E", fontWeight: 700 }}>B {Math.round((bank/tot)*100)}%</span>}
      </div>
    </>
  );
};

// ─────────────────────────────────────────────────────────────
// Cashier — Truck review (line-by-line approve/reject)
// ─────────────────────────────────────────────────────────────
function CashierReview({ truckNo, billings, onBack, onApprove, onReject, onSettleTruck, density, palette }) {
  const truck = TRUCKS.find(t => t.no === truckNo);
  const route = ROUTES.find(r => r.code === truck?.route);
  const truckBills = billings.filter(b => b.truck === truckNo);
  const customers = groupByCustomer(truckBills);

  const reviewBills = truckBills.filter(b => b.status === "submitted" || b.status === "review");
  const allReviewed = reviewBills.length === 0;
  const allSettleable = truckBills.every(b => ["settled","closed","rejected","rework"].includes(b.status));
  const settledCount = truckBills.filter(b => b.status === "settled").length;
  const rejectedCount = truckBills.filter(b => b.status === "rejected" || b.status === "rework").length;

  const [showPrint, setShowPrint] = React.useState(false);

  const totals = truckBills.reduce((s, b) => ({
    qty: s.qty + b.qty, total: s.total + b.total,
    credit: s.credit + (b.payment === "credit" ? b.total : 0),
    cash:   s.cash   + (b.payment === "cash"   ? b.total : 0),
    bank:   s.bank   + (b.payment === "bank"   ? b.total : 0),
  }), { qty: 0, total: 0, credit: 0, cash: 0, bank: 0 });

  // mark "under review" when first opened
  React.useEffect(() => {
    if (reviewBills.some(b => b.status === "submitted")) {
      reviewBills.filter(b => b.status === "submitted").forEach(b => {
        // bump status to "review" without firing toasts — internal mark
        window.__markUnderReview?.(b.billing);
      });
    }
  // eslint-disable-next-line
  }, [truckNo]);

  const [showSettle, setShowSettle] = React.useState(false);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageTitle
        breadcrumbs={[
          { label: "Review queue", onClick: onBack },
          { label: `Truck ${truckNo}` },
        ]}
        title={<>
          <span style={{ marginRight: 12 }}>{truckNo}</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)" }}>Plate {truck?.plate} · {truck?.driverEn} · {route?.name}</span>
        </>}
        subtitle={<TruckMeta truck={truck} route={route}/>}
        actions={<>
          <Btn variant="secondary" icon="file" density={density} onClick={() => setShowPrint(true)}>Print summary</Btn>
          <Btn variant="primary" icon="check" density={density}
               disabled={!allSettleable || settledCount === 0}
               onClick={() => setShowSettle(true)}>
            Confirm &amp; settle ({settledCount})
          </Btn>
        </>}
      />

      {/* Progress strip */}
      <div style={{
        margin: "16px 24px 0", padding: "12px 16px",
        background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)",
        display: "flex", alignItems: "center", gap: 24,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Review progress</span>
            <span style={{ fontSize: 12, color: "var(--text2)" }}>
              {truckBills.length - reviewBills.length} of {truckBills.length} done
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: "var(--bg-shell)", overflow: "hidden", display: "flex" }}>
            <div style={{ width: `${(settledCount / truckBills.length) * 100}%`, background: "var(--pos)" }}/>
            <div style={{ width: `${(rejectedCount / truckBills.length) * 100}%`, background: "var(--neg)" }}/>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 6, fontSize: 12 }}>
            <span style={{ color: "var(--pos-dark)" }}><b>{settledCount}</b> approved</span>
            <span style={{ color: "var(--neg)" }}><b>{rejectedCount}</b> rejected</span>
            <span style={{ color: "var(--text2)" }}><b>{reviewBills.length}</b> pending</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <PaySummary label="Credit" value={totals.credit} color="#0064D9"/>
          <PaySummary label="Cash"   value={totals.cash}   color="#25713A"/>
          <PaySummary label="Bank"   value={totals.bank}   color="#5C2E8E"/>
          <div style={{ width: 1, background: "var(--border2)" }}/>
          <PaySummary label="Total" value={totals.total} big/>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 24px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {customers.map(c => (
            <CustomerSection key={c.code} cust={c} density={density} palette={palette}
                             role="cashier" onApprove={onApprove} onReject={onReject}/>
          ))}
        </div>
        {allReviewed && (
          <div style={{
            marginTop: 16, padding: "16px 20px", background: "#EBFAD3",
            border: "1px solid #DBEEA1", borderRadius: 10,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <Icon name="check" size={20} color="var(--pos-dark)"/>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--pos-dark)" }}>All billings reviewed</div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>
                {settledCount} approved · {rejectedCount} rejected. Click <b>Settle truck</b> to post to SAP.
              </div>
            </div>
            {settledCount > 0 && (
              <Btn variant="primary" icon="check" onClick={() => setShowSettle(true)}>
                Confirm &amp; settle ({settledCount})
              </Btn>
            )}
          </div>
        )}
      </div>

      {showSettle && (
        <SettleDialog
          truckNo={truckNo}
          settled={truckBills.filter(b => b.status === "settled")}
          onCancel={() => setShowSettle(false)}
          onConfirm={() => { onSettleTruck(truckNo); setShowSettle(false); }}
        />
      )}

      {showPrint && (
        <PrintSummary truckNo={truckNo} billings={billings} onClose={() => setShowPrint(false)}/>
      )}
    </div>
  );
}

const PaySummary = ({ label, value, color, big }) => (
  <div style={{ textAlign: "right", minWidth: 120 }}>
    <div style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: big ? 17 : 14, fontWeight: 700, fontFamily: "'72 Duplex','72'", color: color || "var(--text)", marginTop: 2 }}>
      {fmtTHB(value)}
    </div>
  </div>
);

function SettleDialog({ truckNo, settled, onCancel, onConfirm }) {
  const [posting, setPosting] = React.useState(false);
  const totals = settled.reduce((s, b) => ({
    total: s.total + b.total,
    credit: s.credit + (b.payment === "credit" ? b.total : 0),
    cash:   s.cash   + (b.payment === "cash"   ? b.total : 0),
    bank:   s.bank   + (b.payment === "bank"   ? b.total : 0),
    creditCount: s.creditCount + (b.payment === "credit" ? 1 : 0),
    cashCount:   s.cashCount   + (b.payment === "cash"   ? 1 : 0),
    bankCount:   s.bankCount   + (b.payment === "bank"   ? 1 : 0),
  }), { total: 0, credit: 0, cash: 0, bank: 0, creditCount: 0, cashCount: 0, bankCount: 0 });

  const post = () => {
    setPosting(true);
    setTimeout(() => { onConfirm(); }, 1100);
  };

  return (
    <ModalShell title={`Confirm & settle truck ${truckNo}`} onCancel={posting ? () => {} : onCancel}
                primary={<Btn variant="primary" icon={posting ? "refresh" : "check"} onClick={post} disabled={posting}>
                          {posting ? "Posting to SAP…" : `Confirm & settle (${settled.length})`}
                        </Btn>}
                secondary={!posting && <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="msg-strip msg-info">
          <Icon name="info" size={14} color="var(--blue-h)" style={{ marginTop: 2 }}/>
          <div>
            <div className="msg-strip-title">Two-track posting</div>
            For <b>Credit</b> billings, this <b>confirms POD receipt</b> only — no cash clearing in SAP.
            For <b>Cash</b> and <b>Bank transfer</b> billings, payment clearing is posted to SAP.
            All processed documents move to <b>Closed</b> once SAP responds.
          </div>
        </div>
        <div style={{
          background: "var(--bg-shell)", borderRadius: 8, padding: 14,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
        }}>
          <Summary label="Documents to process" value={settled.length}/>
          <Summary label="Total amount" value={fmtTHB(totals.total)}/>
          <Summary label={`Credit · POD confirm (${totals.creditCount})`}  value={fmtTHB(totals.credit)} color="#0064D9"/>
          <Summary label={`Cash · clear in SAP (${totals.cashCount})`}      value={fmtTHB(totals.cash)} color="#25713A"/>
          <Summary label={`Bank · clear in SAP (${totals.bankCount})`}      value={fmtTHB(totals.bank)} color="#5C2E8E"/>
          <Summary label="Posting user" value="ปริยากร น." color="var(--text2)"/>
        </div>
        {posting && (
          <div style={{
            padding: 14, background: "#EDF6FF", border: "1px solid #80C8F0",
            borderRadius: 8, display: "flex", alignItems: "center", gap: 12,
          }}>
            <Spinner/>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Posting to SAP S/4HANA</div>
              <div style={{ fontSize: 12, color: "var(--text2)" }}>FI document creation · clearing run · DMS attach…</div>
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}

const Spinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2.4" strokeLinecap="round"
       style={{ color: "var(--blue-h)", animation: "sp-rot 1s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.2-8.6"/>
  </svg>
);

Object.assign(window, { CashierQueue, CashierReview });
