/* ──────────────────────────────────────────────────────────────
 * Sales Admin — Truck detail & Submit-to-Cashier flow
 * Shows one truck's deliveries grouped by customer → ship-to →
 * delivery → billing(s). Sales admin can:
 *   - Review drafts and rework items
 *   - Edit a draft billing (mocked: inline editor)
 *   - Submit selected drafts to cashier
 * ────────────────────────────────────────────────────────────── */

function AdminTruckDetail({ truckNo, billings, onBack, onSubmit, onEdit, density, palette }) {
  const truck = TRUCKS.find(t => t.no === truckNo);
  const route = ROUTES.find(r => r.code === truck?.route);
  const truckBills = billings.filter(b => b.truck === truckNo);
  const customers = groupByCustomer(truckBills);

  // selection — for "Submit to cashier"
  const [selected, setSelected] = React.useState(new Set());
  const submittable = truckBills.filter(b => b.status === "draft" || b.status === "rework");
  const allSubmittableSelected = submittable.length > 0 && submittable.every(b => selected.has(b.billing));

  const toggleSel = (billing) => {
    const n = new Set(selected);
    n.has(billing) ? n.delete(billing) : n.add(billing);
    setSelected(n);
  };

  const totals = truckBills.reduce((s, b) => ({
    qty: s.qty + b.qty, total: s.total + b.total,
    credit: s.credit + (b.payment === "credit" ? b.total : 0),
    cash:   s.cash   + (b.payment === "cash"   ? b.total : 0),
    bank:   s.bank   + (b.payment === "bank"   ? b.total : 0),
  }), { qty: 0, total: 0, credit: 0, cash: 0, bank: 0 });

  const [showSubmitDialog, setShowSubmitDialog] = React.useState(false);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageTitle
        breadcrumbs={[
          { label: "Daily report", onClick: onBack },
          { label: `Truck ${truckNo}` },
        ]}
        title={<>
          <span style={{ marginRight: 12 }}>{truckNo}</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text2)" }}>Plate {truck?.plate} · {truck?.driverEn} ({truck?.driver}) · {route?.name}</span>
        </>}
        subtitle={<TruckMeta truck={truck} route={route}/>}
        actions={<>
          <Btn variant="secondary" icon="download" density={density}>Print run sheet</Btn>
          <Btn variant="primary" icon="send" density={density}
               disabled={selected.size === 0}
               onClick={() => setShowSubmitDialog(true)}>
            Submit {selected.size > 0 ? selected.size : ""} to cashier
          </Btn>
        </>}
      />

      {/* Truck summary cards */}
      <div style={{ padding: "16px 24px 0", display: "flex", gap: 12 }}>
        <KPITile label="Deliveries" value={new Set(truckBills.map(b => b.delivery)).size} sub={`${truckBills.length} billings`} icon="truck"/>
        <KPITile label="Total cases" value={`${totals.qty.toLocaleString()} CS`} sub={`${customers.length} customers`} icon="package"/>
        <KPITile label="Credit"    value={fmtTHB(totals.credit)} accent="#0064D9" icon="file"/>
        <KPITile label="Cash"      value={fmtTHB(totals.cash)}   accent="#30914C" icon="cash"/>
        <KPITile label="Bank"      value={fmtTHB(totals.bank)}   accent="#7B4FAB" icon="package"/>
        <KPITile label="Grand total" value={fmtTHB(totals.total)} sub={`incl. VAT 7%`} accent="var(--blue)"/>
      </div>

      {/* Bulk-select bar */}
      {submittable.length > 0 && (
        <div style={{
          margin: "16px 24px 0", padding: "10px 14px",
          background: selected.size > 0 ? "#EDF6FF" : "var(--bg)", border: "1px solid " + (selected.size > 0 ? "#80C8F0" : "var(--border2)"),
          borderRadius: 8, display: "flex", alignItems: "center", gap: 12,
        }}>
          <input type="checkbox" checked={allSubmittableSelected}
                 onChange={() => setSelected(allSubmittableSelected ? new Set() : new Set(submittable.map(b => b.billing)))}
                 style={{ width: 16, height: 16 }}/>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {selected.size > 0
              ? <>Selected <b>{selected.size}</b> of {submittable.length} submittable billings · {fmtTHB(truckBills.filter(b => selected.has(b.billing)).reduce((s, b) => s + b.total, 0))}</>
              : <>Select drafts &amp; rework items to submit to the cashier for review.</>}
          </span>
          {selected.size > 0 && (
            <button onClick={() => setSelected(new Set())} style={{
              marginLeft: "auto", background: "transparent", border: 0, color: "var(--blue-h)",
              fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Clear</button>
          )}
        </div>
      )}

      <div style={{ flex: 1, overflow: "auto", padding: "16px 24px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {customers.map(c => (
            <CustomerSection key={c.code} cust={c} density={density} palette={palette}
                             selected={selected} toggleSel={toggleSel}
                             role="admin" onEdit={onEdit}/>
          ))}
        </div>
      </div>

      {showSubmitDialog && (
        <SubmitDialog
          billings={truckBills.filter(b => selected.has(b.billing))}
          onCancel={() => setShowSubmitDialog(false)}
          onConfirm={(note) => {
            onSubmit([...selected], note);
            setSelected(new Set());
            setShowSubmitDialog(false);
          }}
        />
      )}
    </div>
  );
}

const TruckMeta = ({ truck, route }) => truck ? (
  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text2)", marginTop: 6 }}>
    <Meta icon="route"    label="Route"   value={`${route?.code} · ${route?.name}`}/>
    <Meta icon="calendar" label="Depart"  value={truck.depart}/>
    <Meta icon="calendar" label="Return"  value={truck.returnT}/>
  </div>
) : null;

const Meta = ({ icon, label, value }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
    <Icon name={icon} size={12}/> <span style={{ fontWeight: 600 }}>{label}:</span> {value}
  </span>
);

// ── Customer section — used by both admin detail and cashier review ──
function CustomerSection({ cust, density, palette, selected, toggleSel, onApprove, onReject, onEdit, role }) {
  const [open, setOpen] = React.useState(true);
  return (
    <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{
        padding: "12px 16px", borderBottom: open ? "1px solid var(--border2)" : "none",
        display: "flex", alignItems: "center", gap: 12, cursor: "pointer", background: "#FAFBFC",
      }}>
        <Icon name={open ? "chevDown" : "chevRight"} size={14} color="var(--text2)"/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
            <span style={{ fontFamily: "'72 Duplex','72'", color: "var(--text2)", fontWeight: 600, fontSize: 12 }}>{cust.code}</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{cust.en}</span>
            <span style={{ fontSize: 11, padding: "0 6px", height: 16, borderRadius: 3,
                           background: "var(--bg-shell)", color: "var(--text2)", display: "inline-flex", alignItems: "center", fontWeight: 600 }}>
              {cust.channel}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 1 }}>{cust.name}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12 }}>
          <span style={{ color: "var(--text2)" }}>{cust.billings.length} billings · {cust.sums.qty} CS</span>
          <span style={{ fontFamily: "'72 Duplex','72'", fontWeight: 700, fontSize: 15 }}>{fmtTHB(cust.sums.total)}</span>
          <BillingStatusMix billings={cust.billings} palette={palette}/>
        </div>
      </div>
      {open && Object.values(cust.shipTos).map(st => (
        <div key={st.stId} style={{ borderBottom: "1px solid var(--border3)" }}>
          <div style={{ padding: "8px 16px 8px 36px", display: "flex", alignItems: "center", gap: 10,
                        background: "#F7F9FC", fontSize: 12 }}>
            <Icon name="pin" size={12} color="var(--text2)"/>
            <span style={{ fontFamily: "'72 Duplex','72'", color: "var(--text2)", fontWeight: 600 }}>{st.stId}</span>
            <span style={{ fontWeight: 700 }}>{st.name}</span>
            <span style={{ color: "var(--text3)", fontSize: 11, marginLeft: 8 }}>{st.addr}</span>
          </div>
          {st.billings.map(b => (
            <BillingRow key={b.billing} billing={b} density={density} palette={palette}
                        role={role} selected={selected?.has(b.billing)}
                        onToggleSel={() => toggleSel?.(b.billing)}
                        onApprove={onApprove} onReject={onReject} onEdit={onEdit}/>
          ))}
        </div>
      ))}
    </div>
  );
}

const BillingStatusMix = ({ billings, palette }) => {
  const groups = {};
  billings.forEach(b => { groups[b.status] = (groups[b.status] || 0) + 1; });
  const entries = Object.entries(groups);
  if (entries.length === 1) return <StatusTag status={entries[0][0]} palette={palette} size="sm"/>;
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {entries.map(([k, n]) => (
        <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <StatusTag status={k} palette={palette} size="sm"/>
          <span style={{ fontSize: 11, color: "var(--text2)", fontWeight: 700 }}>×{n}</span>
        </span>
      ))}
    </div>
  );
};

// ── Single billing row with line items expansion ───────────────
function BillingRow({ billing: b, density, palette, role, selected, onToggleSel, onApprove, onReject, onEdit }) {
  const [showLines, setShowLines] = React.useState(false);
  const [showReject, setShowReject] = React.useState(false);
  const canSelectForAdmin = role === "admin" && (b.status === "draft" || b.status === "rework");
  const canActAsCashier = role === "cashier" && (b.status === "submitted" || b.status === "review");

  return (
    <>
      <div style={{
        padding: density === "compact" ? "8px 16px 8px 36px" : "12px 16px 12px 36px",
        display: "grid", gap: 12, alignItems: "center",
        gridTemplateColumns: "20px minmax(0,1fr) 110px 90px 110px 130px auto",
        borderBottom: "1px solid var(--border3)",
        background: selected ? "#EDF6FF" : "var(--bg)",
        transition: "background .15s",
      }}>
        {canSelectForAdmin || canActAsCashier ? (
          <input type="checkbox" checked={!!selected} onChange={onToggleSel}
                 style={{ width: 16, height: 16, cursor: "pointer" }}/>
        ) : <span/>}

        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <button onClick={() => setShowLines(!showLines)} style={{
            background: "transparent", border: 0, padding: 2, cursor: "pointer", display: "flex", color: "var(--text2)",
          }}><Icon name={showLines ? "chevDown" : "chevRight"} size={13}/></button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'72 Duplex','72'", color: "var(--blue-h)", fontWeight: 700, fontSize: 13 }}>{b.billing}</span>
              <span style={{ fontSize: 11, color: "var(--text2)" }}>· Delivery {b.delivery}</span>
              <PaymentTag type={b.payment}/>
            </div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>
              {b.lines.length} item{b.lines.length > 1 ? "s" : ""} · {b.lines.slice(0, 2).map(l => l.en).join(", ")}{b.lines.length > 2 ? "…" : ""}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
          {b.qty} CS
        </div>
        <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text2)", fontSize: 12 }}>
          {fmtTHB(b.net)}
        </div>
        <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--text2)", fontSize: 12 }}>
          +{fmtTHB(b.tax)}
        </div>
        <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", fontFamily: "'72 Duplex','72'", fontWeight: 700, fontSize: 14 }}>
          {fmtTHB(b.total)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <StatusTag status={b.status} palette={palette} size="sm"/>
          <EvidenceButton billing={b} density={density}/>
          {role === "admin" && b.status === "draft" && (
            <Btn variant="ghost" density="compact" icon="edit" onClick={() => onEdit?.(b.billing)}>Edit</Btn>
          )}
          {canActAsCashier && (
            <>
              <Btn variant="reject" density="compact" icon="x" onClick={() => setShowReject(true)}>Reject</Btn>
              <Btn variant="accept" density="compact" icon="check" onClick={() => onApprove?.(b.billing)}>
                {b.payment === "credit" ? "Confirm POD" : "Approve"}
              </Btn>
            </>
          )}
        </div>
      </div>

      {/* Reject reason banner (existing rework / rejected) */}
      {b.rejectReason && (b.status === "rework" || b.status === "rejected") && (
        <div style={{
          margin: "0 16px 0 56px", padding: "8px 12px", marginTop: -1,
          background: "#FFF3EB", borderLeft: "3px solid var(--warn)", fontSize: 12,
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <Icon name="alert" size={14} color="var(--warn)" style={{ marginTop: 1 }}/>
          <div>
            <b>Cashier note:</b> {b.rejectReason}
          </div>
        </div>
      )}

      {/* Inline line items */}
      {showLines && (
        <div style={{ background: "#F7F9FC", padding: "12px 16px 12px 60px", borderBottom: "1px solid var(--border3)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: "var(--text2)", fontWeight: 700, textAlign: "left" }}>
                <th style={{ padding: "4px 8px" }}>Material</th>
                <th style={{ padding: "4px 8px" }}>Description</th>
                <th style={{ padding: "4px 8px", textAlign: "right" }}>Unit price</th>
                <th style={{ padding: "4px 8px", textAlign: "right" }}>Qty</th>
                <th style={{ padding: "4px 8px", textAlign: "right" }}>Net amount</th>
              </tr>
            </thead>
            <tbody>
              {b.lines.map((l, i) => (
                <tr key={i} style={{ borderTop: "1px solid var(--border3)" }}>
                  <td style={{ padding: "6px 8px", fontFamily: "'72 Duplex','72'", color: "var(--text2)" }}>{l.sku}</td>
                  <td style={{ padding: "6px 8px" }}>
                    <div style={{ fontWeight: 600 }}>{l.en}</div>
                    <div style={{ color: "var(--text2)", fontSize: 11 }}>{l.name}</div>
                  </td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtTHB(l.unitPrice)}</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{l.qty} CS</td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{fmtTHB(l.net)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid var(--border2)" }}>
                <td colSpan="4" style={{ padding: "6px 8px", textAlign: "right", color: "var(--text2)" }}>Net</td>
                <td style={{ padding: "6px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 700 }}>{fmtTHB(b.net)}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ padding: "2px 8px", textAlign: "right", color: "var(--text2)" }}>VAT 7%</td>
                <td style={{ padding: "2px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtTHB(b.tax)}</td>
              </tr>
              <tr>
                <td colSpan="4" style={{ padding: "2px 8px", textAlign: "right", fontWeight: 700, fontSize: 13 }}>Total</td>
                <td style={{ padding: "2px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums", fontFamily: "'72 Duplex','72'", fontWeight: 700, fontSize: 14 }}>{fmtTHB(b.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {showReject && (
        <RejectDialog billing={b} onCancel={() => setShowReject(false)}
                      onConfirm={(reason) => { onReject?.(b.billing, reason); setShowReject(false); }}/>
      )}
    </>
  );
}

// ── Submit dialog (sales admin → cashier) ─────────────────────
function SubmitDialog({ billings, onCancel, onConfirm }) {
  const [note, setNote] = React.useState("");
  const totals = billings.reduce((s, b) => ({
    qty: s.qty + b.qty, total: s.total + b.total,
    credit: s.credit + (b.payment === "credit" ? b.total : 0),
    cash:   s.cash   + (b.payment === "cash"   ? b.total : 0),
    bank:   s.bank   + (b.payment === "bank"   ? b.total : 0),
  }), { qty: 0, total: 0, credit: 0, cash: 0, bank: 0 });
  return (
    <ModalShell title="Submit billings to cashier" onCancel={onCancel}
                primary={<Btn variant="primary" icon="send" onClick={() => onConfirm(note)}>Submit {billings.length} billings</Btn>}
                secondary={<Btn variant="secondary" onClick={onCancel}>Cancel</Btn>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{
          background: "var(--bg-shell)", borderRadius: 8, padding: 14,
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
        }}>
          <Summary label="Billings" value={billings.length}/>
          <Summary label="Total cases" value={`${totals.qty} CS`}/>
          <Summary label="Grand total" value={fmtTHB(totals.total)}/>
          <Summary label="Credit" value={fmtTHB(totals.credit)} color="#0064D9"/>
          <Summary label="Cash"   value={fmtTHB(totals.cash)}   color="#25713A"/>
          <Summary label="Bank"   value={fmtTHB(totals.bank)}   color="#5C2E8E"/>
        </div>
        <div style={{ maxHeight: 200, overflow: "auto", border: "1px solid var(--border2)", borderRadius: 8 }}>
          {billings.slice(0, 12).map(b => (
            <div key={b.billing} style={{
              padding: "8px 12px", borderBottom: "1px solid var(--border3)",
              display: "flex", justifyContent: "space-between", fontSize: 12,
            }}>
              <span><b style={{ fontFamily: "'72 Duplex','72'", color: "var(--blue-h)" }}>{b.billing}</b> · {SHIP_TO[b.shipTo].name}</span>
              <span><PaymentTag type={b.payment}/> <b style={{ marginLeft: 8 }}>{fmtTHB(b.total)}</b></span>
            </div>
          ))}
          {billings.length > 12 && <div style={{ padding: 8, fontSize: 12, color: "var(--text2)", textAlign: "center" }}>… and {billings.length - 12} more</div>}
        </div>
        <div className="field">
          <label className="field-label">Note to cashier (optional)</label>
          <textarea className="input" rows={3} value={note} onChange={e => setNote(e.target.value)}
                    placeholder="E.g. Cash short by ฿200 on BL-880345 — driver pending reconciliation"
                    style={{ height: "auto", padding: "8px 10px", resize: "vertical", fontFamily: "inherit" }}/>
        </div>
        <div className="msg-strip msg-info">
          <Icon name="info" size={14} color="var(--blue-h)"/>
          <div>
            <div className="msg-strip-title">After submit</div>
            Cashier ปริยากร will receive these in <b>Review queue</b>. You can no longer edit the billings until they are returned for rework.
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

const Summary = ({ label, value, color }) => (
  <div>
    <div style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'72 Duplex','72'", color: color || "var(--text)", marginTop: 2 }}>{value}</div>
  </div>
);

// ── Reject dialog (cashier) ───────────────────────────────────
function RejectDialog({ billing, onCancel, onConfirm }) {
  const [reason, setReason] = React.useState("");
  const presets = [
    "Cash amount does not match billing total",
    "Receipt missing or unreadable",
    "Bank transfer slip not attached",
    "Customer signature missing",
  ];
  return (
    <ModalShell title={`Reject billing ${billing.billing}`} onCancel={onCancel}
                primary={<Btn variant="danger" icon="x" onClick={() => onConfirm(reason)} disabled={!reason.trim()}>Reject &amp; send back</Btn>}
                secondary={<Btn variant="secondary" onClick={onCancel}>Cancel</Btn>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: 12, background: "var(--bg-shell)", borderRadius: 8, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span><b>{SHIP_TO[billing.shipTo].name}</b></span>
            <span><PaymentTag type={billing.payment}/> <b style={{ marginLeft: 8, fontFamily: "'72 Duplex','72'" }}>{fmtTHB(billing.total)}</b></span>
          </div>
          <div style={{ color: "var(--text2)", fontSize: 12 }}>Delivery {billing.delivery} · {billing.qty} CS · {billing.truck}</div>
        </div>
        <div>
          <label className="field-label" style={{ display: "block", marginBottom: 6 }}>Reason</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
            {presets.map(p => (
              <button key={p} onClick={() => setReason(p)} style={{
                padding: "4px 10px", borderRadius: 4, border: "1px solid var(--border)",
                background: reason === p ? "#EDF6FF" : "var(--bg)",
                color: reason === p ? "var(--blue-a)" : "var(--text)",
                fontSize: 12, fontFamily: "inherit", cursor: "pointer",
              }}>{p}</button>
            ))}
          </div>
          <textarea className="input" rows={3} value={reason} onChange={e => setReason(e.target.value)}
                    placeholder="Describe what needs to be corrected before resubmission"
                    style={{ height: "auto", padding: "8px 10px", resize: "vertical", fontFamily: "inherit" }}/>
          <div className="field-hint" style={{ marginTop: 4 }}>Sales admin will see this in their Rework queue.</div>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Modal shell ───────────────────────────────────────────────
function ModalShell({ title, onCancel, primary, secondary, children }) {
  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, background: "rgba(34,53,72,.45)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh-pop)",
        width: 560, maxWidth: "90vw", maxHeight: "90vh",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          padding: "14px 16px", borderBottom: "1px solid var(--border2)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{title}</div>
          <button onClick={onCancel} style={{
            background: "transparent", border: 0, padding: 6, cursor: "pointer",
            color: "var(--text2)", display: "flex", borderRadius: 6,
          }}><Icon name="x" size={16}/></button>
        </div>
        <div style={{ padding: 16, overflow: "auto", flex: 1 }}>{children}</div>
        <div style={{
          padding: "12px 16px", borderTop: "1px solid var(--border2)",
          display: "flex", justifyContent: "flex-end", gap: 8,
        }}>
          {secondary}
          {primary}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  AdminTruckDetail, CustomerSection, BillingRow, SubmitDialog, RejectDialog, ModalShell, BillingStatusMix,
});
