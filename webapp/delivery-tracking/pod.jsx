/* global React, AppData, Ico, Cbx, Status, ProductTable */
// POD entry — web full-page form + mobile flow (iOS frame)
const { useState, useMemo, useEffect, useRef, useCallback } = React;

// ───────── Signature pad ─────────
function SignaturePad({ value, onChange, height = 120, dark = false }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef(null);
  const empty = useRef(true);

  useEffect(() => {
    const c = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = c.clientWidth;
    c.width = w * dpr; c.height = height * dpr;
    const ctx = c.getContext('2d'); ctx.scale(dpr, dpr);
    ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = dark ? '#fff' : '#131E29';
    if (value) {
      // re-render from saved dataURL
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, w, height);
      img.src = value;
      empty.current = false;
    }
  }, [height, dark]);

  function pt(e) {
    const r = canvasRef.current.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x, y };
  }
  function start(e) { e.preventDefault(); drawing.current = true; last.current = pt(e); }
  function move(e) {
    if (!drawing.current) return; e.preventDefault();
    const ctx = canvasRef.current.getContext('2d');
    const p = pt(e);
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p; empty.current = false;
  }
  function end() {
    if (!drawing.current) return; drawing.current = false;
    onChange && onChange(canvasRef.current.toDataURL('image/png'));
  }
  function clear() {
    const c = canvasRef.current; const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height); empty.current = true;
    onChange && onChange(null);
  }

  return (
    <div className={`sig-wrap ${dark ? 'dark' : ''}`} style={{height}}>
      <canvas
        ref={canvasRef}
        style={{width:'100%', height:'100%', display:'block', touchAction:'none', cursor:'crosshair'}}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
      />
      <div style={{position:'absolute', left:12, top:12, color: dark ? 'rgba(255,255,255,0.4)' : 'var(--text3)', fontSize:13, pointerEvents:'none', display: value ? 'none' : 'block'}}>
        Sign here to confirm receipt
      </div>
      <button type="button" onClick={clear} style={{position:'absolute', right:8, top:8, padding:'4px 10px', borderRadius:6, border:'1px solid var(--border)', background: dark ? '#1C1C1E' : '#fff', color: dark ? '#fff' : 'var(--text)', fontSize:12, fontWeight:600, cursor:'pointer'}}>Clear</button>
    </div>
  );
}

// ───────── Receipt uploader (camera or file) ─────────
function ReceiptUploader({ value, onChange, dark = false }) {
  return <PhotoCapture
    value={value}
    onChange={onChange}
    label="Capture bank transfer receipt"
    placeholder="Take a photo of the slip, or drop a file"
    dark={dark}
  />;
}

// ───────── Shared form state ─────────
function usePODForm(delivery) {
  const deriveItems = (dl) => dl.items.map(it => ({...it, received: it.qty, rejected: 0, reason:''}));
  const deriveMethod = (dl) => {
    if (dl.paymentTermsCode === 'CASH') return 'cash';
    if (dl.paymentTermsCode === 'BT07' || dl.paymentTermsCode === 'BT15') return 'bank';
    return 'none';
  };
  const [items, setItems] = useState(() => deriveItems(delivery));
  const [method, setMethod] = useState(() => deriveMethod(delivery));
  const [cashAmount, setCashAmount] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [reference, setReference] = useState('');
  const [signature, setSignature] = useState(null);
  const [signerName, setSignerName] = useState('');
  const [notes, setNotes] = useState('');
  const [podPhoto, setPodPhoto] = useState(null); // optional photo evidence (e.g. signed paper, delivered goods)
  const [sigMode, setSigMode] = useState('draw'); // 'draw' | 'photo'

  // Reset all form state when the selected delivery changes (lazy useState initializers run only once)
  useEffect(() => {
    setItems(deriveItems(delivery));
    setMethod(deriveMethod(delivery));
    setCashAmount('');
    setReceipt(null);
    setReference('');
    setSignature(null);
    setSignerName('');
    setNotes('');
    setPodPhoto(null);
    setSigMode('draw');
  }, [delivery.id]);

  const totalRejected = items.reduce((s, it) => s + (it.rejected || 0), 0);
  const hasReject = totalRejected > 0;
  const cashNum = parseFloat(cashAmount) || 0;
  const change = method === 'cash' ? Math.max(0, cashNum - delivery.invoiceAmount) : 0;
  const cashShort = method === 'cash' ? Math.max(0, delivery.invoiceAmount - cashNum) : 0;

  const updateItem = (sku, patch) => setItems(arr => arr.map(it => it.sku === sku ? { ...it, ...patch } : it));

  const valid = useMemo(() => {
    const haveSignature = sigMode === 'draw' ? !!signature : !!podPhoto;
    if (!haveSignature) return { ok:false, reason: sigMode === 'draw' ? 'Customer signature is required.' : 'Photo of signed proof is required.' };
    if (!signerName.trim()) return { ok:false, reason:'Enter the signer name.' };
    if (method === 'cash' && cashNum < delivery.invoiceAmount) return { ok:false, reason:'Cash collected is less than the invoice amount.' };
    if (method === 'bank' && !receipt) return { ok:false, reason:'Attach the bank transfer receipt photo.' };
    if (method === 'bank' && !reference.trim()) return { ok:false, reason:'Enter the bank transfer reference.' };
    if (hasReject && items.some(it => it.rejected > 0 && !it.reason.trim())) return { ok:false, reason:'Provide a reject reason for each rejected line.' };
    return { ok:true };
  }, [signature, podPhoto, sigMode, signerName, method, cashNum, receipt, reference, items, hasReject, delivery.invoiceAmount]);

  function buildPayload() {
    return {
      items, method, cashAmount: cashNum, change, receipt, reference,
      signature: sigMode === 'draw' ? signature : null,
      podPhoto, // always include if user took one
      sigMode,
      signerName, notes,
      status: hasReject ? 'POD Reject' : 'POD',
      podDate: new Date().toISOString().slice(0, 10),
      capturedAt: new Date().toISOString(),
      rejectReason: hasReject ? items.filter(it => it.rejected > 0).map(it => `${it.sku} (${it.rejected}) — ${it.reason}`).join('; ') : null,
    };
  }

  return { items, updateItem, method, setMethod, cashAmount, setCashAmount, cashNum, change, cashShort,
    receipt, setReceipt, reference, setReference, signature, setSignature, signerName, setSignerName,
    notes, setNotes, podPhoto, setPodPhoto, sigMode, setSigMode,
    hasReject, totalRejected, valid, buildPayload };
}

// ───────── Web POD entry ─────────
function PODEntryWeb({ delivery, customers, drivers, groups, onSubmit, onCancel }) {
  const f = usePODForm(delivery);
  const cust = customers[delivery.customer];
  const grp = delivery.group ? groups[delivery.group] : null;
  const driver = grp ? drivers.find(x => x.id === grp.driver) : null;
  const M = AppData.fmtMoney;

  function handleSubmit() {
    if (!f.valid.ok) { window.toast(f.valid.reason, 'error'); return; }
    onSubmit(f.buildPayload());
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <div className="t3 fs12 fw700" style={{textTransform:'uppercase', letterSpacing:'0.06em'}}>Capture proof of delivery</div>
          <div className="page-title">Delivery <span className="num">{delivery.id}</span></div>
          <div className="page-subtitle">{cust.name} · {cust.city} · Truck <span className="num">{delivery.group || '—'}</span></div>
        </div>
        <div className="flex gap8">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={!f.valid.ok}>
            <Ico.Check/> Submit POD
          </button>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 380px', gap:16}}>
        <div>
          {/* Items */}
          <div className="card mb16">
            <div className="card-header">
              <div>
                <span className="card-title">Items received</span>
                <div className="card-subtitle">Adjust quantity if any item is short or rejected. Default is "all received".</div>
              </div>
              {f.hasReject && <span className="tag" style={{background:'var(--neg-bg)', color:'var(--neg)'}}>{f.totalRejected} rejected</span>}
            </div>
            <table className="sap-table">
              <thead>
                <tr>
                  <th style={{width:'14%'}}>Item</th>
                  <th>Description</th>
                  <th style={{width:'9%', textAlign:'right'}}>Shipped</th>
                  <th style={{width:'12%', textAlign:'right'}}>Received</th>
                  <th style={{width:'12%', textAlign:'right'}}>Rejected</th>
                  <th>Reject reason</th>
                </tr>
              </thead>
              <tbody>
                {f.items.map(it => {
                  const p = AppData.products[it.sku];
                  return (
                    <tr key={it.sku} className={it.rejected > 0 ? 'selected' : ''}>
                      <td><span className="num">{p.sku}</span></td>
                      <td>{p.name}</td>
                      <td className="num text-right">{it.qty} {p.uom}</td>
                      <td className="text-right">
                        <input className="input" type="number" min="0" max={it.qty} value={it.received}
                          onChange={e => { const v = Math.max(0, Math.min(it.qty, parseInt(e.target.value)||0)); f.updateItem(it.sku, {received:v, rejected: it.qty - v}); }}
                          style={{textAlign:'right', height:28, padding:'0 8px'}}/>
                      </td>
                      <td className="text-right">
                        <input className="input" type="number" min="0" max={it.qty} value={it.rejected}
                          onChange={e => { const v = Math.max(0, Math.min(it.qty, parseInt(e.target.value)||0)); f.updateItem(it.sku, {rejected:v, received: it.qty - v}); }}
                          style={{textAlign:'right', height:28, padding:'0 8px', color: it.rejected > 0 ? 'var(--neg)' : 'var(--text)'}}/>
                      </td>
                      <td>
                        <input className="input" placeholder={it.rejected > 0 ? "Required" : "—"} value={it.reason}
                          onChange={e => f.updateItem(it.sku, {reason: e.target.value})}
                          disabled={it.rejected === 0}
                          style={{height:28, padding:'0 8px'}}/>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Payment */}
          <div className="card mb16">
            <div className="card-header">
              <div>
                <span className="card-title">Payment</span>
                <div className="card-subtitle">Payment terms on this delivery: <strong>{delivery.paymentTerms}</strong></div>
              </div>
              <div className="fw700 fs16 num">{M(delivery.invoiceAmount)} due</div>
            </div>
            <div className="card-body">
              <div className="flex gap8 mb16">
                {[
                  {v:'none',label:'No payment now', sub:'Invoiced on terms'},
                  {v:'cash',label:'Cash collected', sub:'Driver collects on delivery'},
                  {v:'bank',label:'Bank transfer',  sub:'Customer transferred'},
                  {v:'mixed',label:'Mixed',         sub:'Cash + transfer'},
                ].map(opt => (
                  <button key={opt.v} type="button"
                    onClick={() => f.setMethod(opt.v)}
                    className={`pay-tab ${f.method === opt.v ? 'selected' : ''}`}>
                    <div className="fw700 fs13" style={{color: f.method === opt.v ? 'var(--blue-a)' : 'var(--text)'}}>{opt.label}</div>
                    <div className="t3 fs12 mt4">{opt.sub}</div>
                  </button>
                ))}
              </div>

              {(f.method === 'cash' || f.method === 'mixed') && (
                <div className="mb16">
                  <div className="sec-title">Cash collection</div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12}}>
                    <div className="field">
                      <label className="field-label">Amount received (THB)</label>
                      <input className="input num" type="number" step="0.01" value={f.cashAmount} onChange={e => f.setCashAmount(e.target.value)} placeholder="0.00"/>
                    </div>
                    <div className="field">
                      <label className="field-label">Change to return</label>
                      <input className="input num" value={M(f.change)} readOnly style={{background:'var(--bg-shell)'}}/>
                    </div>
                    <div className="field">
                      <label className="field-label">Short by</label>
                      <input className="input num" value={M(f.cashShort)} readOnly style={{background: f.cashShort > 0 ? '#FFE9E9' : 'var(--bg-shell)', color: f.cashShort > 0 ? 'var(--neg)' : 'var(--text)'}}/>
                    </div>
                  </div>
                  <div className="flex gap6 mt8">
                    {[delivery.invoiceAmount, Math.ceil(delivery.invoiceAmount/100)*100, Math.ceil(delivery.invoiceAmount/500)*500].filter((v,i,a) => a.indexOf(v) === i).map(v => (
                      <button key={v} type="button" className="chip" onClick={() => f.setCashAmount(String(v))}>
                        {M(v)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(f.method === 'bank' || f.method === 'mixed') && (
                <div>
                  <div className="sec-title">Bank transfer</div>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12}}>
                    <div className="field">
                      <label className="field-label">Reference / Transaction ID</label>
                      <input className="input num" value={f.reference} onChange={e => f.setReference(e.target.value)} placeholder="e.g. KBANK-2026-78451"/>
                    </div>
                    <div className="field">
                      <label className="field-label">Transfer amount (THB)</label>
                      <input className="input num" type="number" step="0.01" placeholder={delivery.invoiceAmount.toFixed(2)} defaultValue={delivery.invoiceAmount.toFixed(2)}/>
                    </div>
                  </div>
                  <ReceiptUploader value={f.receipt} onChange={f.setReceipt}/>
                </div>
              )}

              {f.method === 'none' && (
                <div className="msg-strip msg-info">
                  <Ico.Info stroke="#0064D9"/>
                  <div>No payment collected at delivery. Customer will be invoiced per agreed terms — <strong>{delivery.paymentTerms}</strong>.</div>
                </div>
              )}
            </div>
          </div>

          {/* Signature */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Customer signature</span>
              <div className="flex gap6">
                <button type="button" className={`chip ${f.sigMode === 'draw' ? 'active' : ''}`} onClick={() => f.setSigMode('draw')}><Ico.Pen width="12" height="12"/> Sign on screen</button>
                <button type="button" className={`chip ${f.sigMode === 'photo' ? 'active' : ''}`} onClick={() => f.setSigMode('photo')}><Ico.Camera/> Photo of signed paper</button>
              </div>
            </div>
            <div className="card-body">
              <div style={{display:'grid', gridTemplateColumns:'1fr 260px', gap:16}}>
                <div>
                  {f.sigMode === 'draw' ? (
                    <SignaturePad value={f.signature} onChange={f.setSignature} height={140}/>
                  ) : (
                    <PhotoCapture
                      value={f.podPhoto}
                      onChange={f.setPodPhoto}
                      label="Photo of signed POD"
                      placeholder="Take a photo of the customer's signed delivery slip"
                    />
                  )}
                  <div className="t3 fs12 mt8">
                    {f.sigMode === 'draw'
                      ? <>Tap and drag to sign. The signature image is stored with the delivery document.</>
                      : <>Use the camera to capture the customer's signed paper. Image is stored as legal proof.</>}
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Signer name <span style={{color:'var(--neg)'}}>*</span></label>
                  <input className="input" value={f.signerName} onChange={e => f.setSignerName(e.target.value)} placeholder="Full name"/>
                  <label className="field-label mt12">Notes (optional)</label>
                  <textarea className="input" value={f.notes} onChange={e => f.setNotes(e.target.value)} placeholder="Any handover note..." style={{height:'auto', padding:'8px 10px', minHeight:60, resize:'vertical'}}/>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Side: invoice summary */}
        <aside>
          <div className="card mb16" style={{position:'sticky', top:16}}>
            <div className="card-header">
              <span className="card-title">Invoice</span>
              <span className="tag" style={{background:'var(--info-bg)', color:'var(--info)'}}>{delivery.paymentTerms}</span>
            </div>
            <div className="card-body">
              <div className="attr-grid" style={{gridTemplateColumns:'120px 1fr', gap:'8px 12px'}}>
                <div className="attr-label">Invoice no.</div><div className="attr-val num">{delivery.invoiceNo}</div>
                <div className="attr-label">Customer PO</div><div className="attr-val num">{delivery.customerPO || '—'}</div>
                <div className="attr-label">Delivery</div><div className="attr-val num">{delivery.id}</div>
                <div className="attr-label">Sales order</div><div className="attr-val num">{delivery.so}</div>
                <div className="attr-label">Customer</div><div className="attr-val">{cust.name}</div>
                <div className="attr-label">Ship-to</div><div className="attr-val">{cust.shipTo}<div className="t2 fs12 fw400">{cust.city}, {cust.region}</div></div>
                <div className="attr-label">Driver</div><div className="attr-val">{driver ? driver.name : '—'}<div className="t2 fs12 fw400 num">{grp ? grp.plate : ''}</div></div>
              </div>
              <div style={{borderTop:'1px solid var(--border2)', marginTop:14, paddingTop:12}}>
                <div className="flex justify-between fs13"><span className="t2">Subtotal</span><span className="num">{M(delivery.subtotal)}</span></div>
                <div className="flex justify-between fs13 mt4"><span className="t2">VAT 7%</span><span className="num">{M(delivery.tax)}</span></div>
                <div className="flex justify-between mt8" style={{paddingTop:8, borderTop:'1px solid var(--border2)'}}><span className="fw700">Total due</span><span className="fw700 fs16 num">{M(delivery.invoiceAmount)}</span></div>
              </div>

              {/* Live capture summary */}
              <div style={{marginTop:16, padding:12, background:'var(--bg-shell)', borderRadius:8}}>
                <div className="sec-title" style={{marginBottom:6}}>Captured so far</div>
                <div className="flex justify-between fs13 mt4">
                  <span className="t2">Method</span>
                  <span className="fw600">{ {none:'No payment', cash:'Cash', bank:'Bank transfer', mixed:'Mixed'}[f.method] }</span>
                </div>
                {f.method === 'cash' && (
                  <div className="flex justify-between fs13 mt4"><span className="t2">Cash collected</span><span className="num fw600">{M(f.cashNum)}</span></div>
                )}
                {f.method === 'bank' && (
                  <>
                    <div className="flex justify-between fs13 mt4"><span className="t2">Reference</span><span className="num fw600">{f.reference || '—'}</span></div>
                    <div className="flex justify-between fs13 mt4"><span className="t2">Receipt</span><span className="fw600">{f.receipt ? <span style={{color:'var(--pos-dark)'}}><Ico.Check stroke="#25713A" width="12" height="12"/> Attached</span> : '—'}</span></div>
                  </>
                )}
                <div className="flex justify-between fs13 mt4"><span className="t2">Signature</span><span className="fw600">{f.signature ? <span style={{color:'var(--pos-dark)'}}><Ico.Check stroke="#25713A" width="12" height="12"/> Signed</span> : <span style={{color:'var(--text3)'}}>Pending</span>}</span></div>
                <div className="flex justify-between fs13 mt4"><span className="t2">Outcome</span><span className="fw700">{f.hasReject ? <span style={{color:'var(--neg)'}}>POD with reject</span> : <span style={{color:'var(--pos-dark)'}}>POD complete</span>}</span></div>
              </div>

              {!f.valid.ok && (
                <div className="msg-strip msg-warning mt12" style={{fontSize:12}}>
                  <Ico.Info stroke="#B66800"/>
                  <div>{f.valid.reason}</div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ───────── Mobile POD (driver app) ─────────
function MobilePODFlow({ delivery, customers, groups, drivers, onSubmit, onBackToList, onPickDelivery, pendingDeliveries }) {
  const [screen, setScreen] = useState(delivery ? 'detail' : 'list');
  const [d, setD] = useState(delivery);
  const f = usePODForm(d || pendingDeliveries[0]);
  const M = AppData.fmtMoney;

  useEffect(() => { if (delivery) { setScreen('detail'); setD(delivery); } }, [delivery]);

  if (screen === 'list') {
    return <MobileList deliveries={pendingDeliveries} customers={customers} groups={groups} onPick={(dl) => { setD(dl); onPickDelivery(dl); setScreen('detail'); }}/>;
  }

  if (!d) {
    return <MobileEmpty/>;
  }

  if (screen === 'detail') {
    return <MobileDetail delivery={d} cust={customers[d.customer]} group={d.group ? groups[d.group] : null}
      onBack={() => { setScreen('list'); onBackToList && onBackToList(); }}
      onStart={() => setScreen('items')}/>;
  }
  if (screen === 'items') {
    return <MobileItems delivery={d} f={f} onBack={() => setScreen('detail')} onNext={() => setScreen('payment')}/>;
  }
  if (screen === 'payment') {
    return <MobilePayment delivery={d} f={f} onBack={() => setScreen('items')} onNext={() => setScreen('signature')}/>;
  }
  if (screen === 'signature') {
    return <MobileSign delivery={d} f={f} onBack={() => setScreen('payment')} onSubmit={() => {
      if (!f.valid.ok) { window.toast(f.valid.reason, 'error'); return; }
      onSubmit(d, f.buildPayload());
      setScreen('done');
    }}/>;
  }
  if (screen === 'done') {
    return <MobileDone delivery={d} f={f} onBackToList={() => { setScreen('list'); onBackToList && onBackToList(); }}/>;
  }
  return null;
}

// Mobile primitive
const M_BG = '#F2F2F7';
const M_CARD = '#FFFFFF';
const M_BLUE = '#0070F2';
const M_TEXT = '#131E29';
const M_T2 = 'rgba(60,60,67,0.6)';
const M_T3 = 'rgba(60,60,67,0.3)';

function MTop({ title, onBack, action }) {
  return (
    <div style={{padding:'56px 16px 8px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, background:M_BG, position:'sticky', top:0, zIndex:5}}>
      <button onClick={onBack} style={{display:'flex', alignItems:'center', gap:2, background:'transparent', border:'none', color:M_BLUE, fontSize:17, fontWeight:400, cursor:'pointer', padding:'4px 0'}}>
        <Ico.ChevL stroke={M_BLUE} width="22" height="22"/>{onBack && 'Back'}
      </button>
      <div style={{fontSize:17, fontWeight:600, color:M_TEXT}}>{title}</div>
      <div style={{minWidth:44, textAlign:'right'}}>{action}</div>
    </div>
  );
}

function MStat({ status }) {
  const m = AppData.statusMeta[status];
  return <span style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, color: m.dot}}>
    <span style={{width:7, height:7, borderRadius:'50%', background:m.dot}}/>{m.label}
  </span>;
}

function MobileList({ deliveries, customers, groups, onPick }) {
  return (
    <div style={{background:M_BG, minHeight:'100%'}}>
      <div style={{padding:'56px 20px 0', background:M_BG}}>
        <div style={{fontSize:13, fontWeight:600, color:M_T2}}>Driver · Somchai Wongsawat</div>
        <div style={{fontSize:32, fontWeight:700, color:M_TEXT, letterSpacing:'-0.02em', marginTop:2}}>Today's stops</div>
        <div style={{fontSize:14, color:M_T2, marginTop:4}}>{deliveries.length} pending POD across {new Set(deliveries.map(d=>d.group)).size} trucks</div>
      </div>
      <div style={{padding:'16px'}}>
        {deliveries.map((d, i) => {
          const c = customers[d.customer];
          return (
            <div key={d.id} onClick={() => onPick(d)}
              style={{background:M_CARD, borderRadius:12, padding:14, marginBottom:10, boxShadow:'0 1px 2px rgba(0,0,0,0.04)', cursor:'pointer'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8}}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:11, fontWeight:700, color:M_T2, letterSpacing:'0.04em', textTransform:'uppercase'}}>Stop {i+1}</div>
                  <div style={{fontSize:17, fontWeight:700, color:M_TEXT, marginTop:2}}>{c.name}</div>
                  <div style={{fontSize:13, color:M_T2, marginTop:1}}>{c.city} · {c.shipTo}</div>
                </div>
                <Ico.ChevR stroke={M_T3} width="20" height="20"/>
              </div>
              <div style={{display:'flex', gap:14, marginTop:10, paddingTop:10, borderTop:'1px solid rgba(60,60,67,0.1)'}}>
                <div>
                  <div style={{fontSize:11, color:M_T2, fontWeight:600}}>DELIVERY</div>
                  <div style={{fontSize:13, fontWeight:600, color:M_TEXT, fontVariantNumeric:'tabular-nums'}}>{d.id}</div>
                </div>
                <div>
                  <div style={{fontSize:11, color:M_T2, fontWeight:600}}>INVOICE</div>
                  <div style={{fontSize:13, fontWeight:700, color:M_TEXT}}>{AppData.fmtMoney(d.invoiceAmount)}</div>
                </div>
                <div>
                  <div style={{fontSize:11, color:M_T2, fontWeight:600}}>TERMS</div>
                  <div style={{fontSize:13, fontWeight:600, color: d.paymentTerms.startsWith('COD') ? '#E07A00' : M_TEXT}}>{d.paymentTerms.replace('COD — ', 'COD ')}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MobileDetail({ delivery, cust, group, onBack, onStart }) {
  return (
    <div style={{background:M_BG, minHeight:'100%'}}>
      <MTop title="Delivery" onBack={onBack}/>
      <div style={{padding:'8px 16px 100px'}}>
        <div style={{background:M_CARD, borderRadius:12, padding:16}}>
          <div style={{fontSize:11, fontWeight:700, color:M_T2, textTransform:'uppercase', letterSpacing:'0.04em'}}>Stop</div>
          <div style={{fontSize:24, fontWeight:700, color:M_TEXT, marginTop:2}}>{cust.name}</div>
          <div style={{fontSize:14, color:M_T2, marginTop:2}}>{cust.shipTo}<br/>{cust.city}, {cust.region}</div>
          <div style={{display:'flex', gap:8, marginTop:12}}>
            <MStat status={delivery.status}/>
            <span style={{fontSize:12, color:M_T2}}>·</span>
            <span style={{fontSize:12, fontWeight:600, color:M_T2}}>{AppData.fmtDate(delivery.plannedDate)}</span>
          </div>
        </div>

        <div style={{background:M_CARD, borderRadius:12, marginTop:12, padding:14}}>
          <div style={{fontSize:11, fontWeight:700, color:M_T2, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:8}}>Documents</div>
          <Row label="Delivery" value={<span style={{fontVariantNumeric:'tabular-nums'}}>{delivery.id}</span>}/>
          <Row label="Sales order" value={<span style={{fontVariantNumeric:'tabular-nums'}}>{delivery.so}</span>}/>
          <Row label="Customer PO" value={<span style={{fontVariantNumeric:'tabular-nums'}}>{delivery.customerPO || '—'}</span>}/>
          <Row label="Invoice" value={<span style={{fontVariantNumeric:'tabular-nums'}}>{delivery.invoiceNo}</span>}/>
          <Row label="Truck ref." value={<span style={{fontVariantNumeric:'tabular-nums'}}>{delivery.group}</span>} last/>
        </div>

        <div style={{background:M_CARD, borderRadius:12, marginTop:12, padding:14}}>
          <div style={{fontSize:11, fontWeight:700, color:M_T2, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:8}}>Amount due</div>
          <div style={{fontSize:32, fontWeight:700, color:M_TEXT, fontVariantNumeric:'tabular-nums'}}>{AppData.fmtMoney(delivery.invoiceAmount)}</div>
          <div style={{fontSize:13, color: delivery.paymentTerms.startsWith('COD') ? '#E07A00' : M_T2, fontWeight:600, marginTop:2}}>
            {delivery.paymentTerms}
          </div>
        </div>

        <div style={{background:M_CARD, borderRadius:12, marginTop:12, padding:14}}>
          <div style={{fontSize:11, fontWeight:700, color:M_T2, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:8}}>Items · {delivery.items.length}</div>
          {delivery.items.map((it, i) => {
            const p = AppData.products[it.sku];
            return (
              <div key={it.sku} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i === delivery.items.length-1 ? 'none' : '1px solid rgba(60,60,67,0.1)'}}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:14, fontWeight:600, color:M_TEXT}}>{p.name}</div>
                  <div style={{fontSize:12, color:M_T2, fontVariantNumeric:'tabular-nums'}}>{p.sku}</div>
                </div>
                <div style={{fontSize:14, fontWeight:600, color:M_TEXT, fontVariantNumeric:'tabular-nums'}}>{it.qty} {p.uom}</div>
              </div>
            );
          })}
        </div>
      </div>
      <MBottomCTA onClick={onStart}>Start POD capture</MBottomCTA>
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom: last ? 'none' : '1px solid rgba(60,60,67,0.1)'}}>
      <span style={{fontSize:14, color:M_T2}}>{label}</span>
      <span style={{fontSize:14, fontWeight:600, color:M_TEXT}}>{value}</span>
    </div>
  );
}

function MBottomCTA({ onClick, children, disabled, subline }) {
  return (
    <div style={{position:'sticky', bottom:0, padding:'12px 16px 28px', background:'linear-gradient(180deg, rgba(242,242,247,0) 0%, rgba(242,242,247,1) 30%)'}}>
      {subline && <div style={{textAlign:'center', fontSize:12, color:'var(--neg)', marginBottom:6}}>{subline}</div>}
      <button onClick={onClick} disabled={disabled}
        style={{width:'100%', height:50, borderRadius:14, border:'none', background: disabled ? '#C7CED4' : M_BLUE, color:'#fff', fontSize:17, fontWeight:600, cursor: disabled ? 'not-allowed' : 'pointer'}}>
        {children}
      </button>
    </div>
  );
}

function MobileItems({ delivery, f, onBack, onNext }) {
  return (
    <div style={{background:M_BG, minHeight:'100%'}}>
      <MTop title="Items received" onBack={onBack}/>
      <div style={{padding:'8px 16px 100px'}}>
        <div style={{fontSize:13, color:M_T2, padding:'4px 4px 12px'}}>Tap a line to mark short or rejected.</div>
        {f.items.map(it => {
          const p = AppData.products[it.sku];
          const isReject = it.rejected > 0;
          return (
            <div key={it.sku} style={{background:M_CARD, borderRadius:12, padding:14, marginBottom:10, border: isReject ? '1.5px solid var(--neg)' : 'none'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8}}>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:15, fontWeight:700, color:M_TEXT}}>{p.name}</div>
                  <div style={{fontSize:12, color:M_T2, fontVariantNumeric:'tabular-nums'}}>{p.sku} · Shipped {it.qty} {p.uom}</div>
                </div>
                {!isReject && it.received === it.qty && (
                  <span style={{display:'inline-flex', alignItems:'center', gap:4, padding:'4px 10px', borderRadius:14, background:'#E8F8EE', color:'var(--pos-dark)', fontSize:12, fontWeight:700}}>
                    <Ico.Check width="12" height="12" stroke="#25713A"/> All
                  </span>
                )}
              </div>
              <div style={{display:'flex', gap:8, marginTop:12}}>
                <Stepper value={it.received} max={it.qty} label="Received" onChange={v => f.updateItem(it.sku, {received: v, rejected: it.qty - v})}/>
                <Stepper value={it.rejected} max={it.qty} label="Rejected" tone="neg" onChange={v => f.updateItem(it.sku, {rejected: v, received: it.qty - v})}/>
              </div>
              {isReject && (
                <input
                  value={it.reason}
                  onChange={e => f.updateItem(it.sku, {reason: e.target.value})}
                  placeholder="Reject reason (required)"
                  style={{width:'100%', height:40, marginTop:10, borderRadius:8, border:'1px solid rgba(60,60,67,0.18)', background:M_BG, padding:'0 12px', fontSize:14, color:M_TEXT, outline:'none'}}/>
              )}
            </div>
          );
        })}
      </div>
      <MBottomCTA onClick={onNext}>Continue to payment</MBottomCTA>
    </div>
  );
}

function Stepper({ value, max, onChange, label, tone='neutral' }) {
  const accent = tone === 'neg' ? 'var(--neg)' : M_BLUE;
  return (
    <div style={{flex:1, padding:'8px 4px', borderRadius:8, background:M_BG}}>
      <div style={{textAlign:'center', fontSize:11, color:M_T2, fontWeight:600, textTransform:'uppercase'}}>{label}</div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:6}}>
        <button onClick={() => onChange(Math.max(0, value - 1))} style={{width:32, height:32, borderRadius:'50%', border:'none', background:'#fff', color:accent, fontSize:18, fontWeight:700, cursor:'pointer'}}>−</button>
        <span style={{fontSize:20, fontWeight:700, color: value > 0 ? accent : M_TEXT, fontVariantNumeric:'tabular-nums', minWidth:30, textAlign:'center'}}>{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} style={{width:32, height:32, borderRadius:'50%', border:'none', background:'#fff', color:accent, fontSize:18, fontWeight:700, cursor:'pointer'}}>+</button>
      </div>
    </div>
  );
}

function MobilePayment({ delivery, f, onBack, onNext }) {
  const M = AppData.fmtMoney;
  return (
    <div style={{background:M_BG, minHeight:'100%'}}>
      <MTop title="Payment" onBack={onBack}/>
      <div style={{padding:'8px 16px 100px'}}>
        <div style={{background:M_CARD, borderRadius:12, padding:16, marginBottom:12}}>
          <div style={{fontSize:11, fontWeight:700, color:M_T2, textTransform:'uppercase', letterSpacing:'0.04em'}}>Invoice {delivery.invoiceNo}</div>
          <div style={{fontSize:32, fontWeight:700, color:M_TEXT, marginTop:2, fontVariantNumeric:'tabular-nums'}}>{M(delivery.invoiceAmount)}</div>
          <div style={{fontSize:13, color:M_T2, marginTop:2}}>Subtotal {M(delivery.subtotal)} · VAT {M(delivery.tax)}</div>
        </div>

        <div style={{fontSize:13, color:M_T2, padding:'4px 4px 8px', fontWeight:600}}>Payment method</div>
        <div style={{background:M_CARD, borderRadius:12, overflow:'hidden', marginBottom:12}}>
          {[
            {v:'none', t:'No payment now', s:'Invoice on terms'},
            {v:'cash', t:'Cash collected', s:'Driver collects in THB'},
            {v:'bank', t:'Bank transfer', s:'Customer transferred'},
            {v:'mixed', t:'Mixed', s:'Cash + transfer'},
          ].map((opt, i, arr) => (
            <div key={opt.v} onClick={() => f.setMethod(opt.v)}
              style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom: i === arr.length-1 ? 'none' : '1px solid rgba(60,60,67,0.08)', cursor:'pointer'}}>
              <div>
                <div style={{fontSize:15, fontWeight:600, color:M_TEXT}}>{opt.t}</div>
                <div style={{fontSize:12, color:M_T2, marginTop:1}}>{opt.s}</div>
              </div>
              <div style={{width:22, height:22, borderRadius:'50%', border:'2px solid '+(f.method === opt.v ? M_BLUE : 'rgba(60,60,67,0.2)'), display:'flex', alignItems:'center', justifyContent:'center'}}>
                {f.method === opt.v && <div style={{width:10, height:10, borderRadius:'50%', background:M_BLUE}}/>}
              </div>
            </div>
          ))}
        </div>

        {(f.method === 'cash' || f.method === 'mixed') && (
          <div style={{background:M_CARD, borderRadius:12, padding:16, marginBottom:12}}>
            <div style={{fontSize:11, fontWeight:700, color:M_T2, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:10}}>Cash collected</div>
            <div style={{display:'flex', alignItems:'baseline', gap:6, padding:'10px 12px', background:M_BG, borderRadius:8}}>
              <span style={{fontSize:24, fontWeight:700, color:M_T2}}>฿</span>
              <input type="number" inputMode="decimal" value={f.cashAmount} onChange={e => f.setCashAmount(e.target.value)} placeholder="0.00"
                style={{flex:1, border:'none', background:'transparent', outline:'none', fontSize:28, fontWeight:700, color:M_TEXT, fontVariantNumeric:'tabular-nums', width:'100%', padding:0}}/>
            </div>
            <div style={{display:'flex', gap:6, marginTop:10}}>
              {[delivery.invoiceAmount, Math.ceil(delivery.invoiceAmount/100)*100, Math.ceil(delivery.invoiceAmount/500)*500].filter((v,i,a)=>a.indexOf(v)===i).map(v => (
                <button key={v} onClick={() => f.setCashAmount(String(v))} style={{flex:1, height:36, borderRadius:8, border:'none', background:M_BG, color:M_BLUE, fontSize:13, fontWeight:600, cursor:'pointer'}}>{M(v)}</button>
              ))}
            </div>
            <div style={{display:'flex', justifyContent:'space-between', marginTop:12, paddingTop:12, borderTop:'1px solid rgba(60,60,67,0.08)'}}>
              <span style={{fontSize:13, color:M_T2}}>Change</span>
              <span style={{fontSize:15, fontWeight:700, color:M_TEXT, fontVariantNumeric:'tabular-nums'}}>{M(f.change)}</span>
            </div>
            {f.cashShort > 0 && (
              <div style={{display:'flex', justifyContent:'space-between', marginTop:6}}>
                <span style={{fontSize:13, color:'var(--neg)'}}>Short</span>
                <span style={{fontSize:15, fontWeight:700, color:'var(--neg)', fontVariantNumeric:'tabular-nums'}}>{M(f.cashShort)}</span>
              </div>
            )}
          </div>
        )}

        {(f.method === 'bank' || f.method === 'mixed') && (
          <div style={{background:M_CARD, borderRadius:12, padding:16, marginBottom:12}}>
            <div style={{fontSize:11, fontWeight:700, color:M_T2, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:10}}>Bank transfer receipt</div>
            <input value={f.reference} onChange={e => f.setReference(e.target.value)} placeholder="Reference / Transaction ID"
              style={{width:'100%', height:44, borderRadius:8, border:'1px solid rgba(60,60,67,0.18)', background:M_BG, padding:'0 12px', fontSize:14, color:M_TEXT, outline:'none', marginBottom:10}}/>
            <ReceiptUploader value={f.receipt} onChange={f.setReceipt}/>
          </div>
        )}
      </div>
      <MBottomCTA onClick={onNext}>Continue to signature</MBottomCTA>
    </div>
  );
}

function MobileSign({ delivery, f, onBack, onSubmit }) {
  return (
    <div style={{background:M_BG, minHeight:'100%'}}>
      <MTop title="Signature" onBack={onBack}/>
      <div style={{padding:'8px 16px 100px'}}>
        <div style={{background:M_CARD, borderRadius:12, padding:16}}>
          <div style={{fontSize:11, fontWeight:700, color:M_T2, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:10}}>Customer signature</div>
          <div style={{display:'flex', gap:6, background:M_BG, borderRadius:8, padding:3, marginBottom:12}}>
            <button onClick={() => f.setSigMode('draw')} style={{flex:1, padding:'8px 10px', borderRadius:6, border:'none', background: f.sigMode === 'draw' ? '#fff' : 'transparent', color: f.sigMode === 'draw' ? M_TEXT : M_T2, fontWeight:600, fontSize:13, cursor:'pointer', boxShadow: f.sigMode === 'draw' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'}}>Sign on screen</button>
            <button onClick={() => f.setSigMode('photo')} style={{flex:1, padding:'8px 10px', borderRadius:6, border:'none', background: f.sigMode === 'photo' ? '#fff' : 'transparent', color: f.sigMode === 'photo' ? M_TEXT : M_T2, fontWeight:600, fontSize:13, cursor:'pointer', boxShadow: f.sigMode === 'photo' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'}}>Photo of paper</button>
          </div>
          {f.sigMode === 'draw'
            ? <SignaturePad value={f.signature} onChange={f.setSignature} height={180}/>
            : <PhotoCapture value={f.podPhoto} onChange={f.setPodPhoto} label="Photo of signed POD" placeholder="Capture the customer's signed slip"/>}
          <input value={f.signerName} onChange={e => f.setSignerName(e.target.value)} placeholder="Signer name"
            style={{width:'100%', height:44, marginTop:10, borderRadius:8, border:'1px solid rgba(60,60,67,0.18)', background:M_BG, padding:'0 12px', fontSize:14, color:M_TEXT, outline:'none'}}/>
        </div>
        <div style={{background:M_CARD, borderRadius:12, padding:16, marginTop:12}}>
          <div style={{fontSize:11, fontWeight:700, color:M_T2, textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:10}}>Summary</div>
          <Row label="Invoice" value={<span style={{fontVariantNumeric:'tabular-nums'}}>{delivery.invoiceNo}</span>}/>
          <Row label="Method" value={ {none:'No payment', cash:'Cash', bank:'Bank transfer', mixed:'Mixed'}[f.method] }/>
          {f.method === 'cash' && <Row label="Cash collected" value={<span style={{fontVariantNumeric:'tabular-nums'}}>{AppData.fmtMoney(f.cashNum)}</span>}/>}
          {f.method === 'bank' && <Row label="Reference" value={<span style={{fontVariantNumeric:'tabular-nums'}}>{f.reference || '—'}</span>}/>}
          <Row label="Items rejected" value={f.totalRejected || 'None'}/>
          <Row label="Outcome" value={<span style={{color: f.hasReject ? 'var(--neg)' : 'var(--pos-dark)'}}>{f.hasReject ? 'POD with reject' : 'POD complete'}</span>} last/>
        </div>
      </div>
      <MBottomCTA onClick={onSubmit} disabled={!f.valid.ok} subline={!f.valid.ok ? f.valid.reason : null}>Submit POD</MBottomCTA>
    </div>
  );
}

function MobileDone({ delivery, f, onBackToList }) {
  return (
    <div style={{background:M_BG, minHeight:'100%', display:'flex', flexDirection:'column'}}>
      <div style={{flex:1, padding:'120px 24px 0', display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center'}}>
        <div style={{width:72, height:72, borderRadius:'50%', background:'var(--pos-bg)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16}}>
          <Ico.Check stroke="#25713A" width="36" height="36"/>
        </div>
        <div style={{fontSize:24, fontWeight:700, color:M_TEXT}}>{f.hasReject ? 'POD recorded with reject' : 'Delivery complete'}</div>
        <div style={{fontSize:14, color:M_T2, marginTop:6, lineHeight:1.5}}>
          Proof of delivery for <span style={{fontVariantNumeric:'tabular-nums', fontWeight:600, color:M_TEXT}}>{delivery.id}</span> has been recorded and synced to the back office.
        </div>
        <div style={{background:M_CARD, borderRadius:12, padding:14, marginTop:24, width:'100%', textAlign:'left'}}>
          <Row label="Invoice" value={<span style={{fontVariantNumeric:'tabular-nums'}}>{delivery.invoiceNo}</span>}/>
          <Row label="Method" value={ {none:'No payment', cash:'Cash', bank:'Bank transfer', mixed:'Mixed'}[f.method] }/>
          {f.method !== 'none' && <Row label="Amount" value={<span style={{fontVariantNumeric:'tabular-nums', fontWeight:700, color:'var(--pos-dark)'}}>{AppData.fmtMoney(delivery.invoiceAmount)}</span>}/>}
          <Row label="Signed by" value={f.signerName} last/>
        </div>
      </div>
      <MBottomCTA onClick={onBackToList}>Back to stops</MBottomCTA>
    </div>
  );
}

function MobileEmpty() {
  return (
    <div style={{background:M_BG, minHeight:'100%', padding:'120px 24px', textAlign:'center'}}>
      <div style={{fontSize:18, fontWeight:600, color:M_TEXT}}>No delivery selected</div>
      <div style={{fontSize:14, color:M_T2, marginTop:6}}>Pick a stop from the list to begin POD capture.</div>
    </div>
  );
}

Object.assign(window, { PODEntryWeb, MobilePODFlow, SignaturePad, ReceiptUploader, PODEntryList, MobilePreview, PODEvidenceViewer });

// ───────── POD Evidence Viewer ─────────
function PODEvidenceViewer({ delivery, customers, drivers, groups, onClose }) {
  const [zoom, setZoom] = useState(null); // photo to zoom in lightbox
  if (!delivery || !delivery.pod) {
    return (
      <div className="dialog-overlay" onClick={onClose}>
        <div className="dialog" onClick={e => e.stopPropagation()}>
          <div className="dialog-header">
            <div className="dialog-title">No POD evidence</div>
            <button className="icon-btn" onClick={onClose}><Ico.X/></button>
          </div>
          <div className="dialog-body">
            <div className="empty-state">
              <div className="empty-icon"><Ico.Files/></div>
              <div className="empty-title">No driver capture on file</div>
              <div className="empty-body">This delivery has status <strong>{delivery.status}</strong>. POD evidence will appear here once the driver submits proof of delivery.</div>
            </div>
          </div>
          <div className="dialog-footer">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    );
  }

  const p = delivery.pod;
  const cust = customers[delivery.customer];
  const grp = delivery.group ? groups[delivery.group] : null;
  const driver = grp ? drivers.find(x => x.id === grp.driver) : null;
  const M = AppData.fmtMoney;
  const methodLabel = { none:'No payment', cash:'Cash', bank:'Bank transfer', mixed:'Cash + bank transfer' }[p.method] || '—';

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog lg" onClick={e => e.stopPropagation()} style={{width: 820}}>
        <div className="dialog-header">
          <div>
            <div className="t3 fs12 fw700" style={{textTransform:'uppercase', letterSpacing:'0.06em'}}>POD evidence</div>
            <div className="dialog-title"><span className="num">{delivery.id}</span> · {cust.name}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Ico.X/></button>
        </div>
        <div className="dialog-body" style={{padding:0}}>
          <div style={{padding:'14px 20px', background:'var(--bg-shell)', borderBottom:'1px solid var(--border2)', display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:14}}>
            <div>
              <div className="t3 fs12 fw700" style={{textTransform:'uppercase'}}>Status</div>
              <div className="mt4"><Status status={delivery.status} mode="tag"/></div>
            </div>
            <div>
              <div className="t3 fs12 fw700" style={{textTransform:'uppercase'}}>POD captured</div>
              <div className="num fw700 fs13 mt4">{AppData.fmtDate(delivery.podDate)}</div>
              <div className="t3 fs12">{p.capturedAt ? new Date(p.capturedAt).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) : ''}</div>
            </div>
            <div>
              <div className="t3 fs12 fw700" style={{textTransform:'uppercase'}}>Captured by</div>
              <div className="fw700 fs13 mt4">{driver ? driver.name : '—'}</div>
              <div className="t3 fs12 num">{grp ? grp.plate : ''}</div>
            </div>
            <div>
              <div className="t3 fs12 fw700" style={{textTransform:'uppercase'}}>Truck ref.</div>
              <div className="num fw700 fs13 mt4">{delivery.group}</div>
              <div className="t3 fs12 num">Invoice {delivery.invoiceNo}</div>
            </div>
          </div>

          <div style={{padding:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
            {/* Signature / paper photo */}
            <div>
              <div className="sec-title">{p.sigMode === 'photo' ? 'Photo of signed POD' : 'Customer signature'}</div>
              <div style={{border:'1px solid var(--border2)', borderRadius:8, background:'#fff', minHeight:160, display:'flex', alignItems:'center', justifyContent:'center', padding:8, cursor: (p.signature || p.podPhoto) ? 'pointer' : 'default'}}
                onClick={() => {
                  if (p.sigMode === 'photo' && p.podPhoto) setZoom({ photo: p.podPhoto, title: 'Photo of signed POD' });
                }}>
                {p.sigMode === 'draw' && p.signature
                  ? <img src={p.signature} alt="signature" style={{maxWidth:'100%', maxHeight:160}}/>
                  : (p.sigMode === 'photo' && p.podPhoto)
                    ? <img src={p.podPhoto.dataUrl} alt="paper POD" style={{maxWidth:'100%', maxHeight:200, borderRadius:4}}/>
                    : <span className="t3">Not captured</span>}
              </div>
              <div className="mt8 attr-grid" style={{gridTemplateColumns:'120px 1fr'}}>
                <div className="attr-label">Signed by</div><div className="attr-val">{p.signerName || '—'}</div>
                {p.notes && (<><div className="attr-label">Notes</div><div className="attr-val fw400 t2 fs13">{p.notes}</div></>)}
              </div>
            </div>

            {/* Payment evidence */}
            <div>
              <div className="sec-title">Payment evidence</div>
              <div style={{border:'1px solid var(--border2)', borderRadius:8, padding:14, background:'var(--bg)'}}>
                <div className="flex justify-between fs13 mb8">
                  <span className="t2">Method</span>
                  <span className="fw700">{methodLabel}</span>
                </div>
                <div className="flex justify-between fs13"><span className="t2">Invoice amount</span><span className="num fw700">{M(delivery.invoiceAmount)}</span></div>
                {p.method === 'cash' && (
                  <>
                    <div className="flex justify-between fs13 mt4"><span className="t2">Cash collected</span><span className="num fw700">{M(p.cashAmount)}</span></div>
                    {p.change > 0 && <div className="flex justify-between fs13 mt4"><span className="t2">Change returned</span><span className="num">{M(p.change)}</span></div>}
                  </>
                )}
                {p.method === 'bank' && (
                  <div className="flex justify-between fs13 mt4"><span className="t2">Reference</span><span className="num fw700">{p.reference || '—'}</span></div>
                )}
                {p.method === 'none' && (
                  <div className="msg-strip msg-info mt8" style={{fontSize:12}}>
                    <Ico.Info stroke="#0064D9"/>
                    <div>No payment collected at delivery. Customer invoiced on terms — <strong>{delivery.paymentTerms}</strong>.</div>
                  </div>
                )}
              </div>

              {/* Receipt photo */}
              {p.receipt && (
                <div className="mt12">
                  <div className="sec-title">Bank transfer slip</div>
                  <div style={{border:'1px solid var(--border2)', borderRadius:8, padding:8, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', minHeight:120}}
                    onClick={() => setZoom({ photo: p.receipt, title: 'Bank transfer slip' })}>
                    <img src={p.receipt.dataUrl} alt="receipt" style={{maxWidth:'100%', maxHeight:240, borderRadius:4}}/>
                  </div>
                  <div className="t3 fs12 mt4">{p.receipt.source === 'camera' ? 'Captured on driver mobile' : 'Uploaded by driver'} · {(p.receipt.size/1024).toFixed(1)} KB</div>
                </div>
              )}
            </div>
          </div>

          {/* Items received */}
          {p.items && (
            <div style={{padding:'0 20px 20px'}}>
              <div className="sec-title">Items received</div>
              <table className="product-table">
                <thead>
                  <tr>
                    <th style={{width:'14%'}}>Item</th>
                    <th>Description</th>
                    <th style={{width:'10%', textAlign:'right'}}>Shipped</th>
                    <th style={{width:'10%', textAlign:'right'}}>Received</th>
                    <th style={{width:'10%', textAlign:'right'}}>Rejected</th>
                    <th>Reject reason</th>
                  </tr>
                </thead>
                <tbody>
                  {p.items.map(it => {
                    const prod = AppData.products[it.sku];
                    return (
                      <tr key={it.sku} style={{background: it.rejected > 0 ? 'var(--neg-bg)' : 'transparent'}}>
                        <td><span className="num">{prod.sku}</span></td>
                        <td>{prod.name}</td>
                        <td className="num text-right">{it.qty}</td>
                        <td className="num text-right">{it.received}</td>
                        <td className="num text-right" style={{color: it.rejected > 0 ? 'var(--neg)' : 'inherit', fontWeight: it.rejected > 0 ? 700 : 400}}>{it.rejected || '—'}</td>
                        <td className="t2 fs12">{it.reason || (it.rejected > 0 ? '—' : '')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary"><Ico.Download/> Export evidence (PDF)</button>
        </div>
      </div>
      <PhotoViewer open={!!zoom} photo={zoom?.photo} title={zoom?.title} onClose={() => setZoom(null)}/>
    </div>
  );
}

// ───────── POD entry list (web — picker before form) ─────────
function PODEntryList({ deliveries, customers, groups, drivers, statusMode, onPick }) {
  const [search, setSearch] = useState('');
  const [invoiceQ, setInvoiceQ] = useState('');
  const [poQ, setPoQ] = useState('');
  const allPending = deliveries.filter(d => d.status === 'PGI' || d.status === 'In Transit');
  const allCompleted = deliveries.filter(d => d.status === 'POD' || d.status === 'POD Reject');
  const matchFilter = (d) => {
    if (invoiceQ && !(d.invoiceNo || '').toLowerCase().includes(invoiceQ.trim().toLowerCase())) return false;
    if (poQ && !(d.customerPO || '').toLowerCase().includes(poQ.trim().toLowerCase())) return false;
    const q = search.trim().toLowerCase();
    if (q) {
      const hay = `${d.id} ${d.so} ${d.invoiceNo || ''} ${d.customerPO || ''} ${d.group || ''} ${customers[d.customer].name}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  };
  const pending = allPending.filter(matchFilter);
  const completed = allCompleted.filter(matchFilter).slice(0, 8);
  const hasFilter = !!(search || invoiceQ || poQ);
  const M = AppData.fmtMoney;

  return (
    <div>
      <div className="page-title-row">
        <div>
          <div className="page-title">POD entry</div>
          <div className="page-subtitle">Capture proof of delivery, payment receipt, and signature for any in-transit or PGI'd delivery.</div>
        </div>
      </div>

      <div className="msg-strip msg-info mb16">
        <Ico.Info stroke="#0064D9"/>
        <div>
          <span className="msg-strip-title">Tip:</span> drivers normally use the mobile app. This desktop form is for back-office capture (phone-in PODs, scanned signature pages).
        </div>
      </div>

      <div className="card mb16">
        <div className="card-body" style={{padding:'12px 16px'}}>
          <div className="flex gap8 items-center">
            <div className="search-input" style={{flex:1, maxWidth:340}}>
              <Ico.Search stroke="#7F8C9A"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SO / DLV / Invoice / PO / Truck ref / Customer..."/>
            </div>
            <input className="input num" style={{width:170}} value={invoiceQ} onChange={e => setInvoiceQ(e.target.value)} placeholder="Invoice no." title="Filter by invoice number"/>
            <input className="input num" style={{width:170}} value={poQ} onChange={e => setPoQ(e.target.value)} placeholder="Customer PO" title="Filter by customer PO number"/>
            {hasFilter && (
              <button className="btn btn-tertiary btn-compact" onClick={() => { setSearch(''); setInvoiceQ(''); setPoQ(''); }}>Clear</button>
            )}
            <span style={{flex:1}}></span>
            <span className="t3 fs12">{pending.length} pending · {completed.length} recent</span>
          </div>
        </div>
      </div>

      <div className="card mb20">
        <div className="card-header">
          <div>
            <span className="card-title">Pending POD ({pending.length})</span>
            <div className="card-subtitle">In transit or PGI'd — waiting for proof of delivery</div>
          </div>
        </div>
        <table className="sap-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Delivery</th>
              <th>Customer PO</th>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Destination</th>
              <th>Terms</th>
              <th className="text-right">Amount</th>
              <th>PGI</th>
              <th style={{width:120}}></th>
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 && (
              <tr><td colSpan={10}><div className="empty-state"><div className="empty-icon"><Ico.Check/></div><div className="empty-title">All caught up</div><div className="empty-body">No deliveries are waiting on a POD right now.</div></div></td></tr>
            )}
            {pending.map(d => {
              const c = customers[d.customer];
              return (
                <tr key={d.id} className="row-link" onClick={() => onPick(d)}>
                  <td><Status status={d.status} mode={statusMode}/></td>
                  <td><a className="num">{d.id}</a><div className="t3 fs12 num">{d.so}</div></td>
                  <td className="num t2">{d.customerPO || <span className="t3">—</span>}</td>
                  <td className="num">{d.invoiceNo}</td>
                  <td>{c.name}<div className="t3 fs12">{c.shipTo}</div></td>
                  <td className="t2 fs13">{c.city}<div className="t3 fs12">{c.region}</div></td>
                  <td><span className="tag" style={{background: d.paymentTerms.startsWith('COD') ? '#FFE9C7' : 'var(--bg-shell)', color: d.paymentTerms.startsWith('COD') ? '#E07A00' : 'var(--text2)'}}>{d.paymentTerms}</span></td>
                  <td className="num text-right fw700">{M(d.invoiceAmount)}</td>
                  <td className="num">{AppData.fmtDate(d.pgiDate)}</td>
                  <td><button className="btn btn-primary btn-compact" onClick={(e) => { e.stopPropagation(); onPick(d); }}><Ico.Pen width="12" height="12"/> Capture</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {completed.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Recently completed</span>
              <div className="card-subtitle">Last {completed.length} PODs captured</div>
            </div>
          </div>
          <table className="sap-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Delivery</th>
                <th>Customer PO</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>POD date</th>
                <th>Payment</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {completed.map(d => {
                const c = customers[d.customer];
                const m = d.pod?.method;
                const methodLabel = m === 'cash' ? `Cash · ${M(d.pod.cashAmount)}` : m === 'bank' ? `Bank transfer · ${d.pod.reference || '—'}` : m === 'mixed' ? 'Mixed' : 'No payment now';
                return (
                  <tr key={d.id}>
                    <td><Status status={d.status} mode={statusMode}/></td>
                    <td><a className="num">{d.id}</a></td>
                    <td className="num t2">{d.customerPO || <span className="t3">—</span>}</td>
                    <td className="num t2">{d.invoiceNo}</td>
                    <td>{c.name}</td>
                    <td className="num">{AppData.fmtDate(d.podDate)}</td>
                    <td className="t2 fs13">{m ? methodLabel : <span className="t3">—</span>}</td>
                    <td className="num text-right">{M(d.invoiceAmount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ───────── Mobile preview (web shows iPhone with driver flow) ─────────
function MobilePreview({ deliveries, customers, groups, drivers, onSubmitPOD }) {
  const pending = useMemo(() => deliveries.filter(d => (d.status === 'PGI' || d.status === 'In Transit')), [deliveries]);
  const [picked, setPicked] = useState(null);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <div className="page-title">Driver mobile app</div>
          <div className="page-subtitle">The same POD capture available to drivers on their handheld. Tap through to test the flow.</div>
        </div>
        <div className="flex gap8">
          <span className="tag" style={{background:'var(--info-bg)', color:'var(--info)'}}>Live preview</span>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:24, alignItems:'flex-start'}}>
        <div style={{display:'flex', justifyContent:'center'}}>
          <IOSDevice width={402} height={874} title="POD" keyboard={false}>
            <div style={{width:'100%', height:'100%', overflow:'auto', background:M_BG}}>
              <MobilePODFlow
                delivery={picked}
                pendingDeliveries={pending}
                customers={customers}
                groups={groups}
                drivers={drivers}
                onPickDelivery={setPicked}
                onBackToList={() => setPicked(null)}
                onSubmit={(d, payload) => onSubmitPOD(d.id, payload)}
              />
            </div>
          </IOSDevice>
        </div>
        <div>
          <div className="card mb16">
            <div className="card-header"><span className="card-title">How drivers use this</span></div>
            <div className="card-body">
              <ol style={{paddingLeft:18, color:'var(--text2)', lineHeight:1.7, fontSize:14}}>
                <li>Driver opens the app at the customer's site — sees today's stops.</li>
                <li>Taps a stop to see what's on board and the invoice amount due.</li>
                <li>Confirms received quantities, marks any rejected items with a reason.</li>
                <li>Captures payment: cash amount or bank-transfer receipt photo + reference.</li>
                <li>Customer signs on the screen; driver submits.</li>
                <li>POD syncs to the back office: status flips to POD (or POD with reject) and shows in all reports.</li>
              </ol>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Why it matters</span></div>
            <div className="card-body" style={{fontSize:13, color:'var(--text2)', lineHeight:1.7}}>
              <div className="flex items-start gap10 mb12"><div style={{width:28, height:28, borderRadius:6, background:'var(--pos-bg)', color:'var(--pos-dark)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}><Ico.Cash/></div><div><div className="fw700" style={{color:'var(--text)'}}>Payment is recorded at the truck</div>No paper receipts to chase. Bank-transfer photos and cash totals are filed against the invoice instantly.</div></div>
              <div className="flex items-start gap10 mb12"><div style={{width:28, height:28, borderRadius:6, background:'var(--info-bg)', color:'var(--info)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}><Ico.Pen width="14" height="14"/></div><div><div className="fw700" style={{color:'var(--text)'}}>Signature locks the POD</div>The signature, signer name and timestamp are stored with the delivery document as legal proof.</div></div>
              <div className="flex items-start gap10"><div style={{width:28, height:28, borderRadius:6, background:'var(--neg-bg)', color:'var(--neg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}><Ico.Info width="14" height="14"/></div><div><div className="fw700" style={{color:'var(--text)'}}>Rejects surface immediately</div>Any rejected lines auto-flip the delivery to "POD with reject" and push to the attention list.</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
