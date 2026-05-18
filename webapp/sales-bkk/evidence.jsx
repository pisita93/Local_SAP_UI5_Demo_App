/* ──────────────────────────────────────────────────────────────
 * Evidence viewer + Print summary
 *   - Credit billings: POD (Proof of Delivery) — signed delivery
 *   - Cash billings:   Cash receipt + counted amount
 *   - Bank billings:   Transfer slip with reference & timestamp
 * Plus: print-friendly truck summary that bundles all evidence
 * ────────────────────────────────────────────────────────────── */

// ── Deterministic mock evidence per billing ───────────────────
function evidenceFor(b) {
  // deterministic pseudo-random from billing number
  const seed = b.billing.split("").reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rnd = (n) => {
    const x = Math.sin(seed + n) * 10000;
    return x - Math.floor(x);
  };
  const st = SHIP_TO[b.shipTo];
  const cust = CUSTOMERS[st.code];
  const receivers = ["คุณสมศักดิ์", "คุณนภัสร", "คุณวีระชัย", "คุณปิยะ", "คุณดวงพร", "คุณนุชนาฏ"];
  const receiver = receivers[Math.floor(rnd(1) * receivers.length)];
  const hour = 7 + Math.floor(rnd(2) * 8);
  const min = Math.floor(rnd(3) * 60);
  const time = `${String(hour).padStart(2,"0")}:${String(min).padStart(2,"0")}`;

  if (b.payment === "credit") {
    return {
      kind: "POD",
      title: "Proof of delivery",
      docNo: `POD-${b.billing.split("-")[1]}`,
      receivedBy: receiver,
      receivedAt: `16 May 2026 · ${time}`,
      signedBy: receiver,
      photos: [
        { label: "POD slip", placeholder: "pod" },
        { label: "Goods at door", placeholder: "goods" },
      ],
      notes: rnd(4) > 0.7 ? "ลูกค้าตรวจรับครบตามใบส่งของ" : "",
    };
  }
  if (b.payment === "cash") {
    const receiptNo = `R-${b.shipTo.split("-")[1]}-${Math.floor(rnd(5)*900+100)}`;
    const counted = b.total + (rnd(6) > 0.85 ? -420 : 0); // some mismatches
    return {
      kind: "CASH",
      title: "Cash receipt",
      docNo: receiptNo,
      paidBy: receiver,
      paidAt: `16 May 2026 · ${time}`,
      cashCounted: counted,
      expected: b.total,
      bills: distributeCash(counted),
      photos: [
        { label: "Receipt", placeholder: "receipt" },
        { label: "Cash counted", placeholder: "cash" },
      ],
      notes: counted !== b.total ? `Short by ฿${(b.total-counted).toFixed(2)} — driver to reconcile` : "",
    };
  }
  // bank transfer
  const banks = [
    { name: "Kasikornbank",       short: "KBANK", color: "#138F2D" },
    { name: "Bangkok Bank",       short: "BBL",   color: "#1C4FA1" },
    { name: "Siam Commercial Bank", short: "SCB", color: "#4E2A84" },
    { name: "Krungthai Bank",     short: "KTB",   color: "#1BA6DE" },
  ];
  const bank = banks[Math.floor(rnd(7) * banks.length)];
  return {
    kind: "BANK",
    title: "Bank transfer slip",
    docNo: `TXN-${Math.floor(rnd(8)*9e11+1e11)}`,
    bank,
    transferredBy: cust.en,
    transferredAt: `16 May 2026 · ${time}`,
    amount: b.total,
    reference: `INV ${b.billing}`,
    photos: [{ label: "Transfer slip", placeholder: "slip" }],
    notes: "",
  };
}

function distributeCash(amount) {
  const denom = [1000, 500, 100, 50, 20, 10, 5, 1];
  let left = Math.round(amount);
  const out = [];
  for (const d of denom) {
    const n = Math.floor(left / d);
    if (n > 0) { out.push({ d, n }); left -= n * d; }
    if (out.length > 4) break;
  }
  return out;
}

// ── SVG paper placeholders for the "evidence photo" ───────────
function EvidencePhoto({ kind, billing, evidence, big }) {
  const w = big ? 320 : 180;
  const h = big ? 220 : 130;
  // a slightly off-white "scanned paper" with rotation + shadow
  const rot = (billing.charCodeAt(billing.length - 1) % 5 - 2) * 0.6;
  return (
    <div style={{
      width: w, height: h, background: "#F4F2EB", borderRadius: 4,
      boxShadow: "0 4px 14px rgba(0,0,0,.18), inset 0 0 0 1px rgba(0,0,0,.08)",
      transform: `rotate(${rot}deg)`,
      position: "relative", overflow: "hidden", flexShrink: 0,
    }}>
      <PaperContent kind={kind} evidence={evidence} big={big}/>
      {/* fake fold / corner */}
      <div style={{ position: "absolute", top: 0, right: 0, width: 16, height: 16,
                    background: "linear-gradient(225deg, transparent 50%, rgba(0,0,0,.06) 50%)" }}/>
    </div>
  );
}

function PaperContent({ kind, evidence, big }) {
  const E = evidence;
  if (kind === "pod") return (
    <div style={{ padding: big ? 14 : 8, fontSize: big ? 10 : 7, color: "#2A2825",
                  fontFamily: "Courier New, monospace", lineHeight: 1.45, height: "100%" }}>
      <div style={{ fontWeight: 700, fontSize: big ? 11 : 8, marginBottom: big ? 4 : 2 }}>PROOF OF DELIVERY</div>
      <div style={{ borderBottom: "1px dashed #999", marginBottom: 4 }}/>
      <div>No. {E.docNo}</div>
      <div>Date: 16 May 2026</div>
      <div>Recv: {E.receivedBy}</div>
      <div style={{ marginTop: big ? 8 : 4, fontSize: big ? 9 : 6 }}>Goods received in good condition.</div>
      <div style={{ marginTop: "auto", position: "absolute", bottom: big ? 14 : 8, left: big ? 14 : 8, right: big ? 14 : 8 }}>
        <Signature seed={E.docNo} w={big ? 100 : 60}/>
        <div style={{ borderTop: "1px solid #555", marginTop: 2, fontSize: big ? 8 : 5, fontWeight: 700 }}>
          {E.signedBy}
        </div>
      </div>
    </div>
  );
  if (kind === "goods") return (
    <div style={{ height: "100%", background: "linear-gradient(180deg, #C8D0DB 0%, #C8D0DB 60%, #8B96A6 60%, #8B96A6 100%)", position: "relative" }}>
      {/* "carton stacks" */}
      <div style={{ position: "absolute", bottom: "20%", left: "10%", right: "10%", height: "55%", display: "flex", gap: 4, alignItems: "flex-end" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            flex: 1, height: `${50 + (i%3)*15}%`, background: "#B5895E",
            border: "1px solid #6E4A2C", boxShadow: "inset 0 -8px 0 rgba(0,0,0,.1)",
          }}>
            <div style={{ background: "#E6E2D7", height: 6, marginTop: 4, width: "60%", marginLeft: "20%" }}/>
            <div style={{ background: "#E6E2D7", height: 3, marginTop: 4, width: "40%", marginLeft: "30%" }}/>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", top: 6, left: 6, fontSize: big ? 9 : 7, color: "rgba(0,0,0,.5)" }}>{evidence.receivedAt}</div>
    </div>
  );
  if (kind === "receipt") return (
    <div style={{ padding: big ? 12 : 7, fontSize: big ? 10 : 7, fontFamily: "Courier New, monospace", color: "#2A2825" }}>
      <div style={{ textAlign: "center", fontWeight: 700, fontSize: big ? 11 : 8 }}>CASH RECEIPT</div>
      <div style={{ textAlign: "center", fontSize: big ? 9 : 6 }}>Sales BKK Co., Ltd.</div>
      <div style={{ borderBottom: "1px dashed #999", margin: "4px 0" }}/>
      <div>No. {E.docNo}</div>
      <div>{E.paidAt}</div>
      <div style={{ borderBottom: "1px dashed #999", margin: "4px 0" }}/>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Subtotal</span><span>฿{(E.expected/1.07).toFixed(2)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>VAT 7%</span><span>฿{(E.expected - E.expected/1.07).toFixed(2)}</span>
      </div>
      <div style={{ borderBottom: "1px dashed #999", margin: "4px 0" }}/>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
        <span>TOTAL</span><span>฿{E.expected.toLocaleString()}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: E.cashCounted !== E.expected ? "#AA0808" : "#2A2825" }}>
        <span>CASH</span><span>฿{E.cashCounted.toLocaleString()}</span>
      </div>
      <div style={{ textAlign: "center", marginTop: 6, fontSize: big ? 8 : 6 }}>** Thank you **</div>
    </div>
  );
  if (kind === "cash") return (
    <div style={{ padding: big ? 10 : 6, height: "100%", background: "#2F4032", color: "#fff" }}>
      <div style={{ fontSize: big ? 10 : 7, fontWeight: 700, marginBottom: 4 }}>Cash counted</div>
      <div style={{ display: "flex", flexDirection: "column", gap: big ? 4 : 2 }}>
        {E.bills && E.bills.slice(0,3).map((b, i) => (
          <div key={i} style={{
            height: big ? 24 : 14, background: ["#9FA859","#6E97A7","#A05E5E","#7E6E9E"][i % 4],
            borderRadius: 2, position: "relative", padding: big ? "4px 8px" : "2px 4px",
            fontSize: big ? 9 : 6, fontWeight: 700, color: "#fff",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>฿{b.d}</span><span>×{b.n}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", bottom: big ? 12 : 6, left: big ? 12 : 6, right: big ? 12 : 6, fontSize: big ? 9 : 6 }}>
        Total: ฿{E.cashCounted.toLocaleString()}
      </div>
    </div>
  );
  if (kind === "slip") return (
    <div style={{ padding: big ? 12 : 7, height: "100%", display: "flex", flexDirection: "column",
                  fontFamily: "Courier New, monospace", color: "#2A2825", fontSize: big ? 10 : 6.5 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 4, padding: big ? "2px 6px" : "1px 3px",
        background: E.bank.color, color: "#fff", borderRadius: 2, fontWeight: 700,
        fontSize: big ? 9 : 6, alignSelf: "flex-start",
      }}>{E.bank.short}</div>
      <div style={{ marginTop: 4, fontWeight: 700, fontSize: big ? 10 : 7 }}>Funds transfer</div>
      <div style={{ marginTop: 3, lineHeight: 1.45 }}>
        <div>TXN: {E.docNo}</div>
        <div>{E.transferredAt}</div>
        <div>Ref: {E.reference}</div>
      </div>
      <div style={{ marginTop: "auto", borderTop: "1px dashed #999", paddingTop: 3, fontWeight: 700, fontSize: big ? 11 : 7 }}>
        ฿{E.amount.toLocaleString()}
      </div>
    </div>
  );
  return null;
}

// playful signature placeholder
function Signature({ seed, w = 80 }) {
  const id = String(seed).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const path = [
    "M 0 12 Q 6 0 10 10 T 22 9 Q 30 4 36 13 T 50 8 Q 60 16 70 5 L 78 12",
    "M 2 14 Q 8 4 14 8 T 28 12 Q 40 0 48 11 Q 58 18 68 6 T 80 12",
    "M 0 10 Q 10 2 18 12 Q 28 18 36 6 T 56 12 Q 68 4 80 14",
  ][id % 3];
  return (
    <svg viewBox="0 0 80 18" width={w} height={w * 0.22} style={{ overflow: "visible" }}>
      <path d={path} fill="none" stroke="#1A2A4A" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Evidence button (small) — opens modal
// ─────────────────────────────────────────────────────────────
function EvidenceButton({ billing, density }) {
  const [open, setOpen] = React.useState(false);
  const e = evidenceFor(billing);
  const label = billing.payment === "credit" ? "POD" : billing.payment === "cash" ? "Receipt" : "Slip";
  return (
    <>
      <button onClick={(ev) => { ev.stopPropagation(); setOpen(true); }} style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        height: density === "compact" ? 22 : 24, padding: "0 8px",
        borderRadius: 4, border: "1px solid var(--border)",
        background: "var(--bg)", color: "var(--text2)",
        fontSize: 11, fontWeight: 600, fontFamily: "inherit", cursor: "pointer",
      }} title={`View ${e.title}`}>
        <Icon name="eye" size={11}/>
        {label}
      </button>
      {open && <EvidenceModal billing={billing} evidence={e} onClose={() => setOpen(false)}/>}
    </>
  );
}

function EvidenceModal({ billing, evidence, onClose }) {
  const b = billing, E = evidence;
  const st = SHIP_TO[b.shipTo];
  const cust = CUSTOMERS[st.code];
  return (
    <ModalShell title={E.title} onCancel={onClose}
                primary={<Btn variant="primary" icon="download" onClick={onClose}>Download</Btn>}
                secondary={<Btn variant="secondary" onClick={onClose}>Close</Btn>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{
          background: "var(--bg-shell)", borderRadius: 8, padding: 12,
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
        }}>
          <KV label="Billing"   value={b.billing}/>
          <KV label="Delivery"  value={b.delivery}/>
          <KV label="Customer"  value={cust.en}/>
          <KV label="Ship-to"   value={st.name}/>
          <KV label="Payment"   value={<PaymentTag type={b.payment}/>}/>
          <KV label="Amount"    value={<b style={{ fontFamily: "'72 Duplex','72'" }}>{fmtTHB(b.total)}</b>}/>
        </div>

        <div style={{
          borderRadius: 8, padding: 16,
          background: "linear-gradient(180deg, #4A5868, #2F3B49)",
          display: "flex", gap: 16, justifyContent: "center", alignItems: "center",
          minHeight: 260,
        }}>
          {E.photos.map((p, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <EvidencePhoto kind={p.placeholder} billing={b.billing} evidence={E} big/>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,.7)", fontWeight: 600 }}>{p.label}</span>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--bg)", border: "1px solid var(--border2)", borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: "var(--text2)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>Document details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <KV label="Document No." value={E.docNo} mono/>
            {E.kind === "POD" && <>
              <KV label="Received by"    value={E.receivedBy}/>
              <KV label="Received at"    value={E.receivedAt}/>
              <KV label="Signature"      value={<span style={{ background: "#F4F2EB", padding: "2px 6px", display: "inline-block", borderRadius: 2 }}><Signature seed={E.docNo} w={80}/></span>}/>
            </>}
            {E.kind === "CASH" && <>
              <KV label="Paid by"        value={E.paidBy}/>
              <KV label="Paid at"        value={E.paidAt}/>
              <KV label="Cash counted"   value={<b style={{ fontFamily: "'72 Duplex','72'", color: E.cashCounted === E.expected ? "var(--pos-dark)" : "var(--neg)" }}>{fmtTHB(E.cashCounted)}</b>}/>
              <KV label="Expected"       value={<span style={{ fontFamily: "'72 Duplex','72'" }}>{fmtTHB(E.expected)}</span>}/>
              {E.cashCounted !== E.expected && <div style={{ gridColumn: "1/-1" }}>
                <div className="msg-strip msg-error">
                  <Icon name="alert" size={14}/>
                  <div><div className="msg-strip-title">Variance detected</div>Cash short by {fmtTHB(E.expected - E.cashCounted)} — return for rework or accept with note.</div>
                </div>
              </div>}
            </>}
            {E.kind === "BANK" && <>
              <KV label="From bank"      value={<span><i style={{ display: "inline-block", width: 8, height: 8, background: E.bank.color, marginRight: 5, borderRadius: 2 }}/>{E.bank.name}</span>}/>
              <KV label="Transferred by" value={E.transferredBy}/>
              <KV label="Transferred at" value={E.transferredAt}/>
              <KV label="Reference"      value={<span style={{ fontFamily: "'72 Duplex','72'" }}>{E.reference}</span>}/>
            </>}
          </div>
          {E.notes && (
            <div style={{ marginTop: 10, padding: 10, background: E.cashCounted !== E.expected ? "#FFDBEF" : "var(--bg-shell)", borderRadius: 6, fontSize: 12 }}>
              <b>Note: </b>{E.notes}
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

const KV = ({ label, value, mono }) => (
  <div>
    <div style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 13, marginTop: 2, fontFamily: mono ? "'72 Duplex','72'" : "inherit", color: "var(--text)" }}>{value}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// PRINT SUMMARY — full-page report with all billings + evidence
// ─────────────────────────────────────────────────────────────
function PrintSummary({ truckNo, billings, onClose }) {
  const truck = TRUCKS.find(t => t.no === truckNo);
  const route = ROUTES.find(r => r.code === truck.route);
  const truckBills = billings.filter(b => b.truck === truckNo);
  const customers = groupByCustomer(truckBills);
  const [opts, setOpts] = React.useState({
    evidence: true, lineItems: true, signature: true,
  });

  const totals = truckBills.reduce((s, b) => ({
    qty: s.qty + b.qty, total: s.total + b.total, net: s.net + b.net, tax: s.tax + b.tax,
    credit: s.credit + (b.payment === "credit" ? b.total : 0),
    cash:   s.cash   + (b.payment === "cash"   ? b.total : 0),
    bank:   s.bank   + (b.payment === "bank"   ? b.total : 0),
  }), { qty: 0, total: 0, net: 0, tax: 0, credit: 0, cash: 0, bank: 0 });

  const doPrint = () => { window.print(); };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(34,53,72,.55)",
      display: "flex", flexDirection: "column", zIndex: 300,
    }} className="print-overlay">
      {/* Print-control bar (hidden in print) */}
      <div className="no-print" style={{
        height: 56, background: "var(--bg)", borderBottom: "1px solid var(--border2)",
        padding: "0 24px", display: "flex", alignItems: "center", gap: 16,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700 }}>Print preview · Truck {truckNo}</span>
        <span style={{ fontSize: 12, color: "var(--text2)" }}>
          {truckBills.length} billings · {fmtTHB(totals.total)}
        </span>
        <div style={{ flex: 1 }}/>
        <label style={lblSt}>
          <input type="checkbox" checked={opts.evidence} onChange={e => setOpts({...opts, evidence: e.target.checked})}/>
          Include evidence
        </label>
        <label style={lblSt}>
          <input type="checkbox" checked={opts.lineItems} onChange={e => setOpts({...opts, lineItems: e.target.checked})}/>
          Line items
        </label>
        <label style={lblSt}>
          <input type="checkbox" checked={opts.signature} onChange={e => setOpts({...opts, signature: e.target.checked})}/>
          Signature block
        </label>
        <Btn variant="secondary" icon="x" onClick={onClose}>Close</Btn>
        <Btn variant="primary" icon="download" onClick={doPrint}>Print / Save PDF</Btn>
      </div>

      {/* Scroll container with paper */}
      <div className="print-scroll" style={{ flex: 1, overflow: "auto", padding: 24, background: "#3C4858" }}>
        <div className="print-paper" style={{
          width: 920, margin: "0 auto", background: "#fff", padding: "32px 40px",
          boxShadow: "0 8px 40px rgba(0,0,0,.3)", color: "#131E29", fontSize: 12, lineHeight: 1.5,
        }}>
          {/* Header */}
          <PrintHeader truckNo={truckNo} truck={truck} route={route}/>

          {/* Summary tiles */}
          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10 }}>
            <PrintKV label="Billings" value={truckBills.length}/>
            <PrintKV label="Cases"    value={`${totals.qty.toLocaleString()} CS`}/>
            <PrintKV label="Net"      value={fmtTHB(totals.net)}/>
            <PrintKV label="VAT 7%"   value={fmtTHB(totals.tax)} sub="VAT 7%"/>
            <PrintKV label="Grand total" value={fmtTHB(totals.total)} highlight/>
            <PrintKV label="Confirmed/Settled" value={
              <span style={{ color: "#25713A" }}>{truckBills.filter(b => b.status === "settled" || b.status === "closed").length}/{truckBills.length}</span>
            }/>
          </div>

          {/* Payment split */}
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <PrintPay label="Credit · POD confirmed" value={totals.credit} color="#0064D9"/>
            <PrintPay label="Cash · cleared"          value={totals.cash}   color="#25713A"/>
            <PrintPay label="Bank transfer · cleared" value={totals.bank}   color="#5C2E8E"/>
          </div>

          {/* Customer tables */}
          <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 24 }}>
            {customers.map(c => (
              <PrintCustomer key={c.code} cust={c} opts={opts}/>
            ))}
          </div>

          {/* Signature block */}
          {opts.signature && (
            <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24,
                          pageBreakInside: "avoid" }}>
              <SignBlock label="Sales admin"  name="ณัฐพล สง่างาม (Natthapon S.)"/>
              <SignBlock label="Cashier"       name="ปริยากร นันทกุล (Priyakorn N.)"/>
              <SignBlock label="Finance manager" name="________________"/>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 30, paddingTop: 12, borderTop: "1px solid #BCC3CA",
                        display: "flex", justifyContent: "space-between", fontSize: 10, color: "#556B82" }}>
            <span>Sales BKK Co., Ltd. · Payment Settlement Report</span>
            <span>Printed on 16 May 2026 · Document {truckNo}-RPT</span>
            <span>Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const lblSt = { display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "var(--text2)", cursor: "pointer" };

function PrintHeader({ truckNo, truck, route }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid #131E29", paddingBottom: 12 }}>
      <div>
        <div style={{ fontSize: 11, color: "#556B82", fontWeight: 700, letterSpacing: ".08em" }}>SALES BKK CO., LTD.</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 4, color: "#131E29" }}>Truck settlement summary</h1>
        <div style={{ fontSize: 12, color: "#556B82", marginTop: 4 }}>
          {truckNo} · Plate {truck?.plate} · {truck?.driverEn} ({truck?.driver}) · {route?.name}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 10, color: "#556B82" }}>Date</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{TODAY}</div>
        <div style={{ fontSize: 10, color: "#556B82", marginTop: 6 }}>Depart {truck?.depart} · Return {truck?.returnT}</div>
      </div>
    </div>
  );
}

const PrintKV = ({ label, value, sub, highlight }) => (
  <div style={{
    border: "1px solid #BCC3CA", borderRadius: 4, padding: "6px 10px",
    background: highlight ? "#EDF6FF" : "transparent",
    borderColor: highlight ? "#80C8F0" : "#BCC3CA",
  }}>
    <div style={{ fontSize: 9, color: "#556B82", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "'72 Duplex','72', monospace", marginTop: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 9, color: "#556B82" }}>{sub}</div>}
  </div>
);

const PrintPay = ({ label, value, color }) => (
  <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: 8 }}>
    <div style={{ fontSize: 10, color: "#556B82", fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "'72 Duplex','72', monospace", color }}>{fmtTHB(value)}</div>
  </div>
);

function PrintCustomer({ cust, opts }) {
  return (
    <div style={{ pageBreakInside: "avoid" }}>
      <div style={{ borderBottom: "1px solid #131E29", paddingBottom: 6, marginBottom: 8,
                    display: "flex", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontFamily: "'72 Duplex','72', monospace", fontSize: 11, color: "#556B82", marginRight: 6 }}>{cust.code}</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{cust.en}</span>
          <span style={{ fontSize: 11, color: "#556B82", marginLeft: 6 }}>· {cust.channel}</span>
          <div style={{ fontSize: 10, color: "#556B82" }}>{cust.name}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#556B82" }}>Customer total</div>
          <div style={{ fontWeight: 700, fontFamily: "'72 Duplex','72', monospace" }}>{fmtTHB(cust.sums.total)}</div>
        </div>
      </div>

      {Object.values(cust.shipTos).map(st => (
        <div key={st.stId} style={{ marginBottom: 10 }}>
          <div style={{ background: "#F5F6F7", padding: "4px 8px", fontSize: 11 }}>
            <b style={{ fontFamily: "'72 Duplex','72', monospace" }}>{st.stId}</b> · {st.name} <span style={{ color: "#556B82" }}>· {st.addr}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, marginTop: 4 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #BCC3CA", color: "#556B82" }}>
                <th style={thSt}>Delivery</th>
                <th style={thSt}>Billing</th>
                <th style={thSt}>Payment</th>
                <th style={{ ...thSt, textAlign: "right" }}>Qty</th>
                <th style={{ ...thSt, textAlign: "right" }}>Net</th>
                <th style={{ ...thSt, textAlign: "right" }}>VAT</th>
                <th style={{ ...thSt, textAlign: "right" }}>Total</th>
                <th style={thSt}>Status</th>
                <th style={thSt}>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {st.billings.map(b => <PrintBillingRow key={b.billing} b={b} opts={opts}/>)}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

const thSt = { padding: "4px 6px", textAlign: "left", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: ".04em" };
const tdSt = { padding: "5px 6px", borderBottom: "1px solid #EAE4EE", verticalAlign: "top" };

function PrintBillingRow({ b, opts }) {
  const e = evidenceFor(b);
  return (
    <>
      <tr>
        <td style={tdSt}><span style={{ fontFamily: "'72 Duplex','72', monospace" }}>{b.delivery}</span></td>
        <td style={tdSt}><span style={{ fontFamily: "'72 Duplex','72', monospace" }}>{b.billing}</span></td>
        <td style={tdSt}><PrintPaymentTag type={b.payment}/></td>
        <td style={{ ...tdSt, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{b.qty} CS</td>
        <td style={{ ...tdSt, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtTHB(b.net)}</td>
        <td style={{ ...tdSt, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtTHB(b.tax)}</td>
        <td style={{ ...tdSt, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{fmtTHB(b.total)}</td>
        <td style={tdSt}><PrintStatusTag status={b.status} payment={b.payment}/></td>
        <td style={tdSt}>
          <span style={{ fontSize: 10, color: "#556B82" }}>{e.kind === "POD" ? "POD " : e.kind === "CASH" ? "Receipt " : "TXN "} <b style={{ fontFamily: "'72 Duplex','72', monospace", color: "#131E29" }}>{e.docNo}</b></span>
        </td>
      </tr>
      {opts.lineItems && (
        <tr>
          <td colSpan={9} style={{ padding: "2px 6px 6px 24px", fontSize: 10, color: "#556B82" }}>
            {b.lines.map((l, i) => (
              <span key={i} style={{ marginRight: 12 }}>
                <span style={{ fontFamily: "'72 Duplex','72', monospace" }}>{l.sku}</span> {l.en} <b>×{l.qty}</b>
              </span>
            ))}
          </td>
        </tr>
      )}
      {opts.evidence && (
        <tr>
          <td colSpan={9} style={{ padding: "4px 6px 12px 24px", borderBottom: "1px solid #BCC3CA" }}>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              {e.photos.map((p, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <EvidencePhoto kind={p.placeholder} billing={b.billing} evidence={e}/>
                  <span style={{ fontSize: 9, color: "#556B82" }}>{p.label} · {e.docNo}</span>
                </div>
              ))}
              <div style={{ flex: 1, fontSize: 10, color: "#556B82", paddingLeft: 8 }}>
                {e.kind === "POD" && <>Received by <b style={{ color: "#131E29" }}>{e.receivedBy}</b> on {e.receivedAt}.</>}
                {e.kind === "CASH" && <>Paid by <b style={{ color: "#131E29" }}>{e.paidBy}</b> on {e.paidAt}. Cash counted <b style={{ color: e.cashCounted === e.expected ? "#25713A" : "#AA0808" }}>{fmtTHB(e.cashCounted)}</b> (expected {fmtTHB(e.expected)}).</>}
                {e.kind === "BANK" && <>Transferred via <b style={{ color: e.bank.color }}>{e.bank.name}</b> on {e.transferredAt}. Reference {e.reference}.</>}
                {e.notes && <div style={{ marginTop: 4, color: e.kind === "CASH" && e.cashCounted !== e.expected ? "#AA0808" : "#556B82" }}><b>Note:</b> {e.notes}</div>}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

const PrintPaymentTag = ({ type }) => {
  const map = { credit: { l: "Credit", c: "#0064D9", b: "#D1EFFF" },
                cash:   { l: "Cash",   c: "#25713A", b: "#C2FCEE" },
                bank:   { l: "Bank",   c: "#5C2E8E", b: "#DDC4F0" } }[type];
  return <span style={{ background: map.b, color: map.c, padding: "1px 6px", fontWeight: 700, fontSize: 10, borderRadius: 2 }}>{map.l}</span>;
};

const PrintStatusTag = ({ status, payment }) => {
  // POD-aware label for credit-settled
  let label = STATUS[status]?.short || status;
  if ((status === "settled") && payment === "credit") label = "POD confirmed";
  if ((status === "closed")  && payment === "credit") label = "POD closed";
  const c = (STATUS_PALETTES.subtle)[status] || {};
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "1px 6px", borderRadius: 2,
                        background: c.bg, color: c.fg, fontSize: 10, fontWeight: 700,
                        border: `1px solid ${c.border || "transparent"}` }}>
    <i style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }}/>
    {label}
  </span>;
};

const SignBlock = ({ label, name }) => (
  <div style={{ borderTop: "1px solid #131E29", paddingTop: 6 }}>
    <div style={{ height: 40 }}/>
    <div style={{ fontSize: 11, fontWeight: 700 }}>{name}</div>
    <div style={{ fontSize: 10, color: "#556B82" }}>{label} · ____ / ____ / ____</div>
  </div>
);

Object.assign(window, { EvidenceButton, EvidenceModal, evidenceFor, PrintSummary, PrintStatusTag });
