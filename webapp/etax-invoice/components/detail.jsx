// Detail dialog — opened when user clicks a row in the worklist (read-only / draft mode)

const DetailDialog = ({ delivery, onClose, onCreate }) => {
  const [tab, setTab] = React.useState("overview");
  const billingDoc = delivery.billingDoc || "—";
  const certified = delivery.inetStatus === "certified";

  return (
    <div className="dialog-overlay">
      <div className="dialog dialog-xl">
        <div className="dialog-header">
          <div>
            <div className="dialog-title">Delivery {delivery.delivery} <span style={{ fontWeight: 400, color: "var(--text2)", fontSize: 14 }}>· {delivery.soldToName}</span></div>
            <div className="dialog-subtitle">PO {delivery.poNumber} · PGI {fmtEnDate(delivery.pgiDate)} · Total {fmtTHB(delivery.total)}</div>
          </div>
          <button className="shell-btn" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border2)", padding: "0 16px", background: "var(--bg)" }}>
          {[
            { id: "overview", label: "Overview" },
            { id: "items", label: `Items (${delivery.items.length})` },
            { id: "preview", label: "Print preview" },
            { id: "activity", label: "iNet activity" },
          ].map(t => (
            <div key={t.id} className={"settings-tab" + (tab === t.id ? " active" : "")} onClick={() => setTab(t.id)}>{t.label}</div>
          ))}
        </div>
        <div className="dialog-body no-pad" style={{ background: tab === "preview" ? "#4A5560" : "var(--bg-shell)" }}>
          {tab === "overview" && (
            <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <CopySummaryCard delivery={delivery} />
                <div className="info-card">
                  <div className="info-card-title">Sold-to / ลูกค้า</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{delivery.soldToName}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>{delivery.soldToNameTh}</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>{delivery.soldToAddress}</div>
                  <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12 }}>
                    <span><span className="muted">Tax ID:</span> <span className="mono">{delivery.soldToTaxId}</span></span>
                    <span><span className="muted">Branch:</span> {delivery.soldToBranch}</span>
                    <span><span className="muted">Terms:</span> {delivery.soldToPaymentTerms}</span>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-title">Ship-to / สถานที่ส่ง</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{delivery.shipToName}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)" }}>{delivery.shipToNameTh}</div>
                  <div style={{ fontSize: 12, marginTop: 6 }}>{delivery.shipToAddress}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="info-card">
                  <div className="info-card-title">Status</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="muted">Delivery status</span>
                      <span style={{ fontWeight: 600 }}>{delivery.status === "ready" ? "Ready to bill" : delivery.status === "sent" ? "Billed" : delivery.status === "error" ? "Error" : "Draft"}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="muted">Billing doc</span>
                      <span style={{ fontWeight: 700, color: "var(--blue-h)" }}>{billingDoc}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="muted">iNet status</span>
                      <span>
                        {delivery.inetStatus === "certified" && <span className="pill pill-success"><span className="pill-dot"></span>Certified</span>}
                        {delivery.inetStatus === "submitted" && <span className="pill pill-pending"><span className="pill-dot"></span>Pending</span>}
                        {delivery.inetStatus === "rejected" && <span className="pill pill-error"><span className="pill-dot"></span>Rejected</span>}
                        {!delivery.inetStatus && <span className="muted">—</span>}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span className="muted">Print count</span>
                      <span>{delivery.printCount || 0} ×</span>
                    </div>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-title">Amount</div>
                  <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "4px 12px", fontSize: 13, justifyContent: "space-between" }}>
                    <span className="muted">Subtotal</span><span className="tabular">{fmtNum(delivery.subtotal)}</span>
                    <span className="muted">VAT 7%</span><span className="tabular">{fmtNum(delivery.vat)}</span>
                    <span style={{ fontWeight: 700, paddingTop: 4, borderTop: "1px solid var(--border2)" }}>Grand total</span>
                    <span style={{ fontSize: 18, fontWeight: 700, paddingTop: 4, borderTop: "1px solid var(--border2)" }}>{fmtTHB(delivery.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {tab === "items" && (
            <div style={{ padding: 20 }}>
              <table className="sap-table" style={{ background: "var(--bg)", borderRadius: "var(--r-md)", overflow: "hidden", boxShadow: "var(--sh0)" }}>
                <thead>
                  <tr><th>#</th><th>Code</th><th>Description</th><th className="num">Qty</th><th>UoM</th><th className="num">Unit price</th><th className="num">Amount</th></tr>
                </thead>
                <tbody>
                  {delivery.items.map(it => (
                    <tr key={it.line}>
                      <td>{it.line}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{it.code}</td>
                      <td><div style={{ fontWeight: 600 }}>{it.descEn}</div><div style={{ fontSize: 11, color: "var(--text2)" }}>{it.desc}</div></td>
                      <td className="num tabular">{fmtInt(it.qty)}</td>
                      <td>{it.uom}</td>
                      <td className="num tabular">{fmtNum(it.unitPrice)}</td>
                      <td className="num tabular" style={{ fontWeight: 700 }}>{fmtNum(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {tab === "preview" && (
            <PrintPreview delivery={delivery} billingDoc={delivery.billingDoc || "(preview)"} certified={certified} />
          )}
          {tab === "activity" && (
            <div style={{ padding: 20, maxWidth: 720 }}>
              <div className="info-card">
                <div className="info-card-title">iNet timeline</div>
                <div className="activity-log">
                  {delivery.status === "sent" && delivery.inetStatus === "certified" ? [
                    { icon: "success", title: "Billing document posted in SAP", detail: `Doc no. ${billingDoc} — used as iNet reference key`, time: "14:21:05" },
                    { icon: "info", title: "XML payload generated", detail: "Schema v3.0 · 4.2 KB", time: "14:21:08" },
                    { icon: "info", title: "Submitted to iNet", detail: `POST /etax/v3/sign · ref=${billingDoc}`, time: "14:21:11" },
                    { icon: "success", title: "Acknowledged", detail: `iNet queued for signing · ref ${billingDoc}`, time: "14:21:14" },
                    { icon: "success", title: "Certified PDF received", detail: `Digital signature verified · keyed by ${billingDoc}`, time: "14:23:02" },
                    { icon: "success", title: "Printed by user SN-014", detail: `${delivery.printCount} copies (5 pages)`, time: "14:25:40" },
                  ].map((a, i) => (
                    <div key={i} className="activity-item">
                      <div className={"activity-icon " + a.icon}>
                        {a.icon === "success" ? <Icon name="check" size={14} /> : <Icon name="send" size={12} />}
                      </div>
                      <div className="activity-body">
                        <div className="activity-title">{a.title}</div>
                        <div className="activity-detail">{a.detail}</div>
                        <div className="activity-time">2026-05-03 · {a.time}</div>
                      </div>
                    </div>
                  )) : delivery.status === "error" ? (
                    <>
                      <div className="activity-item">
                        <div className="activity-icon error"><Icon name="alert_triangle" size={13} /></div>
                        <div className="activity-body">
                          <div className="activity-title" style={{ color: "var(--neg)" }}>iNet rejected submission</div>
                          <div className="activity-detail">Reason: Tax ID branch mismatch · Code TXR-014</div>
                          <div className="activity-time">2026-05-02 · 11:42:17</div>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon info"><Icon name="send" size={12} /></div>
                        <div className="activity-body">
                          <div className="activity-title">Submitted to iNet</div>
                          <div className="activity-detail">POST /etax/v3/sign · ref={delivery.billingDoc || "—"}</div>
                          <div className="activity-time">2026-05-02 · 11:42:01</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ padding: 24, textAlign: "center", fontSize: 13, color: "var(--text2)" }}>
                      No iNet activity yet — this delivery hasn't been submitted.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="dialog-footer">
          <div style={{ fontSize: 12, color: "var(--text2)" }}>{delivery.id} · {delivery.delivery}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            {(delivery.status === "ready" || delivery.status === "draft") && (
              <button className="btn btn-primary" onClick={() => onCreate([delivery])}>
                <Icon name="send" size={14} /> Create billing
              </button>
            )}
            {delivery.status === "sent" && (
              <button className="btn btn-primary"><Icon name="printer" size={14} /> Reprint</button>
            )}
            {delivery.status === "error" && (
              <button className="btn btn-primary"><Icon name="refresh" size={14} /> Retry submission</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { DetailDialog });
