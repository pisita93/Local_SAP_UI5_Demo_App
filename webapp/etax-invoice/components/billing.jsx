// Create Billing dialog — multi-step flow shown when user creates billing doc(s) from worklist

const CreateBillingDialog = ({ deliveries, onClose, onComplete }) => {
  const [step, setStep] = React.useState(1); // 1 review, 2 sending, 3 complete (success or fail)
  const [selectedDeliveryIdx, setSelectedDeliveryIdx] = React.useState(0);
  const [progress, setProgress] = React.useState(0);
  const [activityFeed, setActivityFeed] = React.useState([]);
  const [simulateFailure, setSimulateFailure] = React.useState(false);
  const [outcome, setOutcome] = React.useState(null); // null | 'success' | 'failure'
  const [failureInfo, setFailureInfo] = React.useState(null);

  const totalAmount0 = deliveries.reduce((a, b) => a + b.total, 0);
  const totalPages0 = deliveries.reduce((a, b) => a + computeCopyPlan(b).totalPages, 0);
  const billingDocFor = (i) => "9100021" + (470 + i).toString().padStart(3, "0");
  const billingDocList = deliveries.map((_, i) => billingDocFor(i));
  const keyPreview = billingDocList.length === 1 ? billingDocList[0] : `${billingDocList[0]} … ${billingDocList[billingDocList.length - 1]} (${billingDocList.length})`;

  // Animate the "send to iNet" step
  React.useEffect(() => {
    if (step !== 2) return;
    setProgress(0);
    setActivityFeed([]);
    setOutcome(null);
    setFailureInfo(null);

    const successEvents = [
      { delay: 200, title: "Billing document(s) posted in SAP", detail: `Doc no. ${keyPreview} — used as iNet reference key`, icon: "success" },
      { delay: 700, title: "Generating XML payload", detail: `${deliveries.length} document(s) · Thai E-Tax Invoice schema v3.0`, icon: "info" },
      { delay: 1100, title: "XML validation passed", detail: "All required fields present · Schema OK", icon: "success" },
      { delay: 1500, title: "Generating PDF (Tax Invoice + Receipt + Delivery Note)", detail: `${deliveries.length * 3} master pages`, icon: "info" },
      { delay: 2000, title: "Submitting to iNet API", detail: `POST https://api.inet.co.th/etax/v3/sign · ref=${billingDocList[0]}`, icon: "info" },
      { delay: 2600, title: "iNet acknowledged submission", detail: `Reference: ${keyPreview}`, icon: "success" },
      { delay: 3100, title: "Awaiting digital signature", detail: "Average turnaround: 30-90 sec", icon: "pending" },
      { delay: 4000, title: "Certified PDF received", detail: `Digital signature verified · keyed by billing doc ${billingDocList[0]}`, icon: "success", final: "success" },
    ];

    const failureEvents = [
      { delay: 200, title: "Billing document(s) posted in SAP", detail: `Doc no. ${keyPreview} — used as iNet reference key`, icon: "success" },
      { delay: 700, title: "Generating XML payload", detail: `${deliveries.length} document(s) · Thai E-Tax Invoice schema v3.0`, icon: "info" },
      { delay: 1100, title: "XML validation passed", detail: "All required fields present · Schema OK", icon: "success" },
      { delay: 1500, title: "Generating PDF (Tax Invoice + Receipt + Delivery Note)", detail: `${deliveries.length * 3} master pages`, icon: "info" },
      { delay: 2000, title: "Submitting to iNet API", detail: `POST https://api.inet.co.th/etax/v3/sign · ref=${billingDocList[0]}`, icon: "info" },
      { delay: 2700, title: "iNet acknowledged submission", detail: `Reference: ${keyPreview}`, icon: "success" },
      { delay: 3300, title: "Awaiting digital signature", detail: "Validation in progress at iNet", icon: "pending" },
      {
        delay: 4400,
        title: "iNet rejected submission",
        detail: `Code TXR-014 · Tax ID branch mismatch on ref=${billingDocList[0]}`,
        icon: "error",
        final: "failure",
        failureInfo: {
          code: "TXR-014",
          message: "Tax ID branch mismatch",
          messageTh: "รหัสสาขาของผู้เสียภาษีไม่ตรงกับข้อมูลทะเบียน",
          httpStatus: 422,
          ref: billingDocList[0],
          field: "Buyer.TaxBranchCode",
          received: "00000",
          expected: "00001",
          remediation: "Update Sold-to branch code in master data, then resubmit. Billing document remains posted in SAP and can be retried without recreation."
        }
      },
    ];

    const events = simulateFailure ? failureEvents : successEvents;
    let cancelled = false;
    events.forEach((ev, i) => {
      setTimeout(() => {
        if (cancelled) return;
        setActivityFeed(prev => [...prev, { ...ev, time: new Date().toLocaleTimeString("en-GB") }]);
        setProgress(((i + 1) / events.length) * 100);
        if (ev.final) {
          if (ev.failureInfo) setFailureInfo(ev.failureInfo);
          setTimeout(() => {
            if (cancelled) return;
            setOutcome(ev.final);
            setStep(3);
          }, 700);
        }
      }, ev.delay);
    });
    return () => { cancelled = true; };
  }, [step, deliveries.length, simulateFailure]);

  const totalAmount = totalAmount0;
  const totalPages = totalPages0;
  const current = deliveries[selectedDeliveryIdx];

  return (
    <div className="dialog-overlay">
      <div className="dialog dialog-xl">
        <div className="dialog-header">
          <div>
            <div className="dialog-title">Create billing documents · สร้างเอกสารเรียกเก็บ</div>
            <div className="dialog-subtitle">{deliveries.length} {deliveries.length === 1 ? "delivery" : "deliveries"} · Total {fmtTHB(totalAmount)} · ~{totalPages} pages</div>
          </div>
          <button className="shell-btn" onClick={onClose}><Icon name="x" size={18} /></button>
        </div>

        <div style={{ padding: "10px 20px", background: "var(--bg-shell)", borderBottom: "1px solid var(--border2)" }}>
          <div className="steps">
            <div className={"step " + (step >= 1 ? (step === 1 ? "active" : "done") : "")}>
              <div className="step-num">{step > 1 ? "✓" : "1"}</div>
              <div className="step-label">Review</div>
            </div>
            <div className="step-line"></div>
            <div className={"step " + (step >= 2 ? (step === 2 ? "active" : "done") : "")}>
              <div className="step-num">{step > 2 ? "✓" : "2"}</div>
              <div className="step-label">Send to iNet</div>
            </div>
            <div className="step-line"></div>
            <div className={"step " + (step >= 3 ? "active" : "")}>
              <div className="step-num">3</div>
              <div className="step-label">Print &amp; complete</div>
            </div>
          </div>
        </div>

        <div className="dialog-body no-pad">
          {step === 1 && (
            <div className="split-2" style={{ height: "100%" }}>
              <div className="left">
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                  Deliveries to bill
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {deliveries.map((d, i) => {
                    const plan = computeCopyPlan(d);
                    const active = i === selectedDeliveryIdx;
                    return (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDeliveryIdx(i)}
                        style={{
                          padding: "10px 12px",
                          background: active ? "var(--bg)" : "rgba(255,255,255,0.5)",
                          border: active ? "1px solid var(--blue)" : "1px solid var(--border2)",
                          borderRadius: "var(--r-sm)",
                          cursor: "pointer",
                          boxShadow: active ? "0 0 0 2px rgba(0,112,242,0.15)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontWeight: 700, color: "var(--blue-h)", fontSize: 13 }}>{d.delivery}</div>
                          <span className="copy-pill" style={{ height: 20, fontSize: 11 }}>
                            <Icon name="printer" size={10} /> {plan.totalPages}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{d.soldToName}</div>
                        <div style={{ fontSize: 11, color: "var(--text2)" }}>→ {d.shipToName}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{fmtTHB(d.total)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="right">
                <div style={{ padding: "16px 20px", overflowY: "auto", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>Delivery {current.delivery}</div>
                      <div style={{ fontSize: 12, color: "var(--text2)" }}>PO {current.poNumber} · PGI {fmtEnDate(current.pgiDate)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>Will create billing doc</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--blue-h)" }}>{billingDocFor(selectedDeliveryIdx)}</div>
                    </div>
                  </div>

                  {/* Copy summary card */}
                  <CopySummaryCard delivery={current} />

                  {/* Customer + items collapsed view */}
                  <div className="form-section" style={{ marginTop: 12 }}>
                    <div className="form-section-header">Customer details</div>
                    <div className="form-grid">
                      <div className="field"><div className="field-label">Sold-to / ลูกค้า</div><div style={{ fontSize: 13, fontWeight: 600 }}>{current.soldToName}</div><div style={{ fontSize: 11, color: "var(--text2)" }}>{current.soldToNameTh}</div></div>
                      <div className="field"><div className="field-label">Ship-to / สถานที่ส่ง</div><div style={{ fontSize: 13, fontWeight: 600 }}>{current.shipToName}</div><div style={{ fontSize: 11, color: "var(--text2)" }}>{current.shipTo}</div></div>
                      <div className="field"><div className="field-label">Tax ID</div><div className="mono" style={{ fontSize: 13 }}>{current.soldToTaxId}</div></div>
                      <div className="field"><div className="field-label">Payment terms</div><div style={{ fontSize: 13 }}>{current.soldToPaymentTerms}</div></div>
                    </div>
                  </div>

                  <div className="form-section">
                    <div className="form-section-header">
                      Line items <span style={{ fontWeight: 400, color: "var(--text2)" }}>({current.items.length})</span>
                    </div>
                    <table className="sap-table">
                      <thead>
                        <tr>
                          <th>#</th><th>Code</th><th>Description</th>
                          <th className="num">Qty</th><th>UoM</th>
                          <th className="num">Unit price</th><th className="num">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {current.items.map(it => (
                          <tr key={it.line}>
                            <td>{it.line}</td>
                            <td className="mono" style={{ fontSize: 12 }}>{it.code}</td>
                            <td>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{it.descEn}</div>
                              <div style={{ fontSize: 11, color: "var(--text2)" }}>{it.desc}</div>
                            </td>
                            <td className="num tabular">{fmtInt(it.qty)}</td>
                            <td>{it.uom}</td>
                            <td className="num tabular">{fmtNum(it.unitPrice)}</td>
                            <td className="num tabular" style={{ fontWeight: 700 }}>{fmtNum(it.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border2)", display: "grid", gridTemplateColumns: "1fr auto", gap: 8, fontSize: 13 }}>
                      <div></div>
                      <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "2px 24px", textAlign: "right" }}>
                        <span className="muted">Subtotal</span><span className="tabular">{fmtNum(current.subtotal)}</span>
                        <span className="muted">VAT 7%</span><span className="tabular">{fmtNum(current.vat)}</span>
                        <span style={{ fontWeight: 700 }}>Grand total (THB)</span>
                        <span className="tabular" style={{ fontWeight: 700, fontSize: 16 }}>{fmtNum(current.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ padding: "32px 40px", maxWidth: 720, margin: "0 auto" }}>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Submitting to iNet…</div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 4 }}>
                  Generating XML, signing, awaiting certified PDF
                </div>
              </div>
              <div className="progress" style={{ marginBottom: 20 }}>
                <div className="progress-bar" style={{ width: progress + "%" }}></div>
              </div>
              <div style={{ background: "var(--bg-shell)", borderRadius: "var(--r-md)", padding: "8px 16px" }}>
                <div className="activity-log">
                  {activityFeed.map((a, i) => (
                    <div key={i} className="activity-item">
                      <div className={"activity-icon " + a.icon}>
                        {a.icon === "success" && <Icon name="check" size={14} />}
                        {a.icon === "info" && <Icon name="send" size={12} />}
                        {a.icon === "pending" && <div className="spinner" style={{ borderTopColor: "var(--text3)", borderColor: "rgba(125,140,154,0.3)" }}></div>}
                        {a.icon === "error" && <Icon name="alert_triangle" size={13} />}
                      </div>
                      <div className="activity-body">
                        <div className="activity-title" style={a.icon === "error" ? { color: "var(--neg)" } : null}>{a.title}</div>
                        <div className="activity-detail">{a.detail}</div>
                        <div className="activity-time">{a.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && outcome === "success" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
              <div style={{ background: "linear-gradient(180deg, #C2FCEE 0%, #FFFFFF 100%)", padding: "16px 20px", borderBottom: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--pos)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="check" size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>Certified by iNet · ส่งให้ไอเน็ตสำเร็จ</div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>
                      Billing doc <strong style={{ color: "var(--text)" }}>{billingDocFor(selectedDeliveryIdx)}</strong> · 
                      iNet ref <span className="mono">{billingDocFor(selectedDeliveryIdx)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary"><Icon name="download" size={14} /> XML</button>
                  <button className="btn btn-secondary"><Icon name="download" size={14} /> PDF</button>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <PrintPreview delivery={current} billingDoc={billingDocFor(selectedDeliveryIdx)} certified={true} />
              </div>
            </div>
          )}

          {step === 3 && outcome === "failure" && (
            <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, background: "#FDF6F6" }}>
              <div style={{ background: "linear-gradient(180deg, #F8D7D7 0%, #FDF6F6 100%)", padding: "16px 20px", borderBottom: "1px solid #E5B4B4", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--neg)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="x" size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "var(--neg)" }}>Rejected by iNet · ส่งให้ไอเน็ตไม่สำเร็จ</div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>
                      Billing doc <strong style={{ color: "var(--text)" }}>{billingDocFor(selectedDeliveryIdx)}</strong> remains posted in SAP · 
                      iNet ref <span className="mono">{billingDocFor(selectedDeliveryIdx)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-secondary"><Icon name="download" size={14} /> XML</button>
                  <span className="pill pill-error" style={{ height: 28, fontSize: 12 }}>HTTP {failureInfo?.httpStatus || 422}</span>
                </div>
              </div>

              <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 20, display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "#fff", border: "1px solid var(--neg)", borderLeft: "4px solid var(--neg)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Icon name="alert_triangle" size={16} stroke="#AA0808" />
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--neg)" }}>Error code {failureInfo?.code}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{failureInfo?.message}</div>
                    <div style={{ fontSize: 12, color: "var(--text2)" }}>{failureInfo?.messageTh}</div>
                    <div style={{ marginTop: 10, padding: "10px 12px", background: "var(--bg-shell)", borderRadius: "var(--r-sm)", fontSize: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span className="muted">Field</span><span className="mono">{failureInfo?.field}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span className="muted">Received</span><span className="mono">{failureInfo?.received}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span className="muted">Expected</span><span className="mono">{failureInfo?.expected}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}><span className="muted">iNet ref</span><span className="mono">{failureInfo?.ref}</span></div>
                    </div>
                  </div>

                  <div style={{ background: "#fff", border: "1px solid var(--border2)", borderRadius: "var(--r-md)", padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>How to resolve · วิธีแก้ไข</div>
                    <div style={{ fontSize: 13, lineHeight: 1.55 }}>{failureInfo?.remediation}</div>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 12.5, color: "var(--text2)", lineHeight: 1.6 }}>
                      <li>Open <strong>Master Data → Sold-to settings</strong> for {current.soldToName}</li>
                      <li>Update the branch code to match the certificate registered with iNet</li>
                      <li>Return here and click <strong>Retry submission</strong> — same billing doc will be reused</li>
                    </ul>
                  </div>
                </div>

                <div style={{ background: "#fff", border: "1px solid var(--border2)", borderRadius: "var(--r-md)", padding: "14px 16px", display: "flex", flexDirection: "column", minHeight: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>iNet timeline</div>
                  <div className="activity-log" style={{ overflowY: "auto" }}>
                    {activityFeed.map((a, i) => (
                      <div key={i} className="activity-item">
                        <div className={"activity-icon " + a.icon}>
                          {a.icon === "success" && <Icon name="check" size={14} />}
                          {a.icon === "info" && <Icon name="send" size={12} />}
                          {a.icon === "pending" && <Icon name="refresh" size={12} />}
                          {a.icon === "error" && <Icon name="alert_triangle" size={13} />}
                        </div>
                        <div className="activity-body">
                          <div className="activity-title" style={a.icon === "error" ? { color: "var(--neg)" } : null}>{a.title}</div>
                          <div className="activity-detail">{a.detail}</div>
                          <div className="activity-time">{a.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <div style={{ fontSize: 12, color: "var(--text2)", display: "flex", alignItems: "center", gap: 16 }}>
            {step === 1 && <>
              <span>Step 1 of 3 · Review {deliveries.length} {deliveries.length === 1 ? "delivery" : "deliveries"} before submitting</span>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 11, color: "var(--text3)" }}>
                <input type="checkbox" checked={simulateFailure} onChange={e => setSimulateFailure(e.target.checked)} style={{ accentColor: "var(--neg)" }} />
                Simulate iNet rejection (demo)
              </label>
            </>}
            {step === 2 && <>Step 2 of 3 · Do not close this window</>}
            {step === 3 && outcome === "success" && <>Step 3 of 3 · Print physical copies and close</>}
            {step === 3 && outcome === "failure" && <>Step 3 of 3 · Submission failed · Resolve and retry</>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {step === 1 && <>
              <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                <Icon name="send" size={14} /> Submit {deliveries.length} to iNet
              </button>
            </>}
            {step === 2 && <button className="btn btn-secondary" disabled>Submitting…</button>}
            {step === 3 && outcome === "success" && <>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
              <button className="btn btn-primary" onClick={() => onComplete && onComplete(deliveries)}>
                <Icon name="printer" size={14} /> Print all & close
              </button>
            </>}
            {step === 3 && outcome === "failure" && <>
              <button className="btn btn-tertiary" onClick={() => onComplete && onComplete(deliveries, "failure")}>Close & mark as rejected</button>
              <button className="btn btn-secondary"><Icon name="download" size={14} /> Download error log</button>
              <button className="btn btn-primary" onClick={() => { setSimulateFailure(false); setStep(2); }}>
                <Icon name="refresh" size={14} /> Retry submission
              </button>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
};

const CopySummaryCard = ({ delivery }) => {
  const plan = computeCopyPlan(delivery);
  return (
    <div style={{ background: "linear-gradient(180deg, #EDF6FF 0%, #FFFFFF 100%)", border: "1px solid #BCD8F4", borderRadius: "var(--r-md)", padding: "14px 16px", marginBottom: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--blue-h)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Print plan · จำนวนสำเนา</div>
          <div className="copy-summary" style={{ marginTop: 4, fontSize: 13 }}>
            This delivery will print <strong>{plan.totalPages} pages</strong> total
          </div>
        </div>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#fff", border: "2px solid var(--blue)", color: "var(--blue-h)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, flexShrink: 0 }}>
          {plan.totalPages}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed var(--border2)" }}>
          <span>
            <strong>{plan.masterSets} master {plan.masterSets === 1 ? "set" : "sets"}</strong> × 3 docs (Tax Invoice + Receipt + Delivery Note)
            <span className="reason-chip" style={{ marginLeft: 6 }}>SOLD-TO RULE</span>
          </span>
          <strong>{plan.totalMasterDocs} pages</strong>
        </div>
        {plan.extraDeliveryNote ? (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px dashed var(--border2)" }}>
            <span>
              + <strong>1 extra Delivery Note</strong> (no price)
              <span className="reason-chip" style={{ marginLeft: 6, background: "#FFF3B8", color: "#8A5A00", borderColor: "#F0D56A" }}>SHIP-TO RULE</span>
            </span>
            <strong>1 page</strong>
          </div>
        ) : null}
        {plan.includePo ? (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span>
              + <strong>Customer PO</strong> attached to set
              <span className="reason-chip" style={{ marginLeft: 6, background: "#DDC4F0", color: "#4A1F75", borderColor: "#C5A6E0" }}>SOLD-TO RULE</span>
            </span>
            <strong>1 page</strong>
          </div>
        ) : null}
      </div>
    </div>
  );
};

Object.assign(window, { CreateBillingDialog, CopySummaryCard });
