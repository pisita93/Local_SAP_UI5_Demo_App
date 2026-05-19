/* global React, AppData */
// Reports: Delivery Status report + Document Search report
const { useState, useMemo, useEffect, useRef } = React;

// ---------- Detail drawer for a delivery ----------
function DeliveryDetailDrawer({ delivery, customers, drivers, groups, statusMode, onClose, onCapturePOD, onViewEvidence }) {
  if (!delivery) return null;
  const { fmtDate, fmtNum, fmtMoney } = AppData;
  const d = delivery;
  const cust = customers[d.customer];
  const grp = d.group ? groups[d.group] : null;
  const driver = grp ? drivers.find(x => x.id === grp.driver) : null;
  const canCapturePOD = d.status === 'PGI' || d.status === 'In Transit';
  const hasEvidence = !!d.pod;

  const tlSteps = [
    { key:'Created',     title:'Delivery created',          date: d.plannedDate, done:true },
    { key:'PGI',         title:'Post goods issue (PGI)',    date: d.pgiDate, done: ['PGI','In Transit','POD','POD Reject'].includes(d.status) },
    { key:'In Transit',  title:'In transit',                date: d.pgiDate, done: ['In Transit','POD','POD Reject'].includes(d.status) },
    { key:'POD',         title: d.status === 'POD Reject' ? 'POD with reject' : 'Proof of delivery', date: d.podDate, done: ['POD','POD Reject'].includes(d.status) },
  ];
  const currentIdx = (() => {
    if (d.status === 'Open') return 0;
    if (d.status === 'PGI') return 1;
    if (d.status === 'In Transit') return 2;
    return 3;
  })();

  return (
    <>
      <div className="drawer-overlay" onClick={onClose}/>
      <div className="drawer">
        <div className="drawer-header">
          <div>
            <div className="t3 fs12 fw700" style={{textTransform:'uppercase', letterSpacing:'0.06em'}}>Delivery</div>
            <div className="page-title" style={{fontSize:20, marginTop:2}}><span className="num">{d.id}</span></div>
            <div className="mt8 flex gap8 items-center">
              <Status status={d.status} mode={statusMode}/>
              {d.group && <span className="tag" style={{background:'var(--bg-shell)', color:'var(--text2)'}}><Ico.Truck width="12" height="12"/> <span className="num" style={{marginLeft:4}}>{d.group}</span></span>}
            </div>
          </div>
          <button className="icon-btn" onClick={onClose}><Ico.X/></button>
        </div>
        <div className="drawer-body">
          <div className="sec-title">Document info</div>
          <div className="attr-grid">
            <div className="attr-label">Sales order</div><div className="attr-val num">{d.so}</div>
            <div className="attr-label">Customer PO</div><div className="attr-val num">{d.customerPO || '—'}</div>
            <div className="attr-label">Customer</div><div className="attr-val">{cust.name}<div className="t2 fs12 fw600">{cust.shipTo}</div></div>
            <div className="attr-label">Destination</div><div className="attr-val">{cust.city}, {cust.region}</div>
            <div className="attr-label">Planned date</div><div className="attr-val">{fmtDate(d.plannedDate)}</div>
            <div className="attr-label">PGI date</div><div className="attr-val">{fmtDate(d.pgiDate)}</div>
            <div className="attr-label">POD date</div><div className="attr-val">{fmtDate(d.podDate)}</div>
          </div>

          {grp && (
            <>
              <div className="sec-title mt20">Truck assignment</div>
              <div className="attr-grid">
                <div className="attr-label">Truck ref.</div><div className="attr-val num">{grp.ref}</div>
                <div className="attr-label">Driver</div><div className="attr-val">{driver ? driver.name : '—'}</div>
                <div className="attr-label">Plate</div><div className="attr-val num">{grp.plate}</div>
                <div className="attr-label">Grouped on</div><div className="attr-val">{fmtDate(grp.createdOn)}</div>
              </div>
            </>
          )}

          <div className="sec-title mt20">Invoice & payment</div>
          <div className="attr-grid">
            <div className="attr-label">Invoice no.</div><div className="attr-val num">{d.invoiceNo}</div>
            <div className="attr-label">Amount</div><div className="attr-val num fw700">{fmtMoney(d.invoiceAmount)}</div>
            <div className="attr-label">Payment terms</div><div className="attr-val">{d.paymentTerms}</div>
          </div>

          {d.rejectReason && (
            <div className="msg-strip msg-error mt16">
              <Ico.Info stroke="#AA0808"/>
              <div><span className="msg-strip-title">Rejection note.</span> {d.rejectReason}</div>
            </div>
          )}

          <div className="sec-title mt20">Status timeline</div>
          <div className="timeline">
            {tlSteps.map((s, i) => (
              <div className={`tl-row ${s.done ? 'done' : ''} ${i === currentIdx && !s.done ? 'current' : ''} ${!s.done && i !== currentIdx ? 'pending' : ''}`} key={i}>
                <div className="tl-marker"/>
                <div className="tl-body">
                  <div className="tl-title">{s.title}</div>
                  <div className="tl-meta">{s.done ? fmtDate(s.date) : 'Pending'}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="sec-title mt20">Items ({d.items.length})</div>
          <ProductTable items={d.items}/>

          <div className="card mt20" style={{boxShadow:'none', border:'1px solid var(--border2)'}}>
            <div className="card-body">
              <div className="flex justify-between">
                <div>
                  <div className="t3 fs12 fw700">TOTAL WEIGHT</div>
                  <div className="num fw700 fs16">{fmtNum(d.totalWeight, 1)} kg</div>
                </div>
                <div>
                  <div className="t3 fs12 fw700">TOTAL VOLUME</div>
                  <div className="num fw700 fs16">{fmtNum(d.totalVolume, 2)} m³</div>
                </div>
                <div>
                  <div className="t3 fs12 fw700">PALLETS</div>
                  <div className="num fw700 fs16">{d.pallets}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="drawer-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          {hasEvidence && onViewEvidence && (
            <button className="btn btn-secondary" onClick={() => onViewEvidence(d)}><Ico.Eye/> View POD evidence</button>
          )}
          {canCapturePOD && onCapturePOD && (
            <button className="btn btn-primary" onClick={() => onCapturePOD(d)}><Ico.Pen width="14" height="14"/> Capture POD</button>
          )}
          {!canCapturePOD && !hasEvidence && <button className="btn btn-primary">Open delivery document</button>}
        </div>
      </div>
    </>
  );
}

// ---------- Status Report ----------
function StatusReport({ deliveries, customers, groups, drivers, statusMode, onOpenDetail, onViewEvidence }) {
  const STATUSES = ['Open','PGI','In Transit','POD','POD Reject'];
  const [view, setView] = useState('all'); // saved views
  const [statusSel, setStatusSel] = useState([]); // multi
  const [search, setSearch] = useState('');
  const [custSel, setCustSel] = useState('');
  const [truckSel, setTruckSel] = useState('');
  const [invoiceQ, setInvoiceQ] = useState('');
  const [poQ, setPoQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Apply saved-view presets
  useEffect(() => {
    if (view === 'open') setStatusSel(['Open']);
    else if (view === 'pgi') setStatusSel(['PGI', 'In Transit']);
    else if (view === 'rejects') setStatusSel(['POD Reject']);
    else if (view === 'all') setStatusSel([]);
  }, [view]);

  const counts = useMemo(() => {
    const c = { all: deliveries.length };
    STATUSES.forEach(s => { c[s] = deliveries.filter(d => d.status === s).length; });
    return c;
  }, [deliveries]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return deliveries.filter(d => {
      if (statusSel.length && !statusSel.includes(d.status)) return false;
      if (custSel && d.customer !== custSel) return false;
      if (truckSel && d.group !== truckSel) return false;
      if (invoiceQ && !(d.invoiceNo || '').toLowerCase().includes(invoiceQ.trim().toLowerCase())) return false;
      if (poQ && !(d.customerPO || '').toLowerCase().includes(poQ.trim().toLowerCase())) return false;
      if (from && d.plannedDate < from) return false;
      if (to && d.plannedDate > to) return false;
      if (q) {
        const hay = `${d.id} ${d.so} ${d.invoiceNo || ''} ${d.customerPO || ''} ${d.group || ''} ${customers[d.customer].name}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [deliveries, statusSel, custSel, truckSel, invoiceQ, poQ, from, to, search, customers]);

  const toggleStatus = (s) => setStatusSel(arr => arr.includes(s) ? arr.filter(x => x !== s) : [...arr, s]);
  const clearAll = () => { setStatusSel([]); setCustSel(''); setTruckSel(''); setInvoiceQ(''); setPoQ(''); setFrom(''); setTo(''); setSearch(''); };

  const trucks = Object.keys(groups);

  // KPIs (computed live)
  const kpi = useMemo(() => ({
    open:   counts['Open'],
    pgi:    counts['PGI'] + counts['In Transit'],
    pod:    counts['POD'],
    reject: counts['POD Reject'],
    total:  counts.all,
  }), [counts]);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <div className="page-title">Delivery status</div>
          <div className="page-subtitle">Live status across {deliveries.length} deliveries · last refreshed Today, 09:42</div>
        </div>
        <div className="flex gap8">
          <button className="btn btn-secondary"><Ico.Refresh/> Refresh</button>
          <button className="btn btn-secondary"><Ico.Download/> Export</button>
        </div>
      </div>

      {/* KPI strip — clickable filters */}
      <div className="kpi-strip">
        <div className={`kpi-card ${view === 'all' ? 'active' : ''}`} onClick={() => setView('all')}>
          <div className="kpi-label">All deliveries</div>
          <div className="kpi-val">{kpi.total}</div>
          <div className="kpi-sub"><span className="dot" style={{background:'var(--text3)'}}/>Across {Object.keys(groups).length} truck groups</div>
        </div>
        <div className={`kpi-card ${view === 'open' ? 'active' : ''}`} onClick={() => setView('open')}>
          <div className="kpi-label">Open</div>
          <div className="kpi-val" style={{color:'var(--info)'}}>{kpi.open}</div>
          <div className="kpi-sub"><span className="dot" style={{background:'var(--info)'}}/>Awaiting grouping</div>
        </div>
        <div className={`kpi-card ${view === 'pgi' ? 'active' : ''}`} onClick={() => setView('pgi')}>
          <div className="kpi-label">PGI · in transit</div>
          <div className="kpi-val" style={{color:'#E07A00'}}>{kpi.pgi}</div>
          <div className="kpi-sub"><span className="dot" style={{background:'#FF9900'}}/>Not yet POD</div>
        </div>
        <div className={`kpi-card`} onClick={() => { setView('custom'); setStatusSel(['POD']); }}>
          <div className="kpi-label">POD complete</div>
          <div className="kpi-val" style={{color:'var(--pos-dark)'}}>{kpi.pod}</div>
          <div className="kpi-sub"><span className="dot" style={{background:'var(--pos)'}}/>Confirmed delivery</div>
        </div>
        <div className={`kpi-card ${view === 'rejects' ? 'active' : ''}`} onClick={() => setView('rejects')}>
          <div className="kpi-label">POD with reject</div>
          <div className="kpi-val" style={{color:'var(--neg)'}}>{kpi.reject}</div>
          <div className="kpi-sub"><span className="dot" style={{background:'var(--neg)'}}/>Action required</div>
        </div>
      </div>

      <div className="table-wrap">
        <div className="view-tabs">
          <div className={`view-tab ${view === 'all' ? 'active' : ''}`}     onClick={() => setView('all')}>All <span className="count">{counts.all}</span></div>
          <div className={`view-tab ${view === 'open' ? 'active' : ''}`}    onClick={() => setView('open')}><Ico.Star/> My open <span className="count">{counts['Open']}</span></div>
          <div className={`view-tab ${view === 'pgi' ? 'active' : ''}`}     onClick={() => setView('pgi')}>PGI not POD <span className="count">{counts['PGI'] + counts['In Transit']}</span></div>
          <div className={`view-tab ${view === 'rejects' ? 'active' : ''}`} onClick={() => setView('rejects')}>Rejects <span className="count">{counts['POD Reject']}</span></div>
          <div className="view-tab" style={{marginLeft:'auto'}}>+ Save view</div>
        </div>

        <div className="filters-bar">
          <div className="search-input" style={{width:320}}>
            <Ico.Search stroke="#7F8C9A"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search SO / DLV / Invoice / PO / Truck ref / Customer..."/>
          </div>

          {/* Status chips */}
          <div className="flex gap6 items-center">
            <span className="t2 fs12 fw700">Status:</span>
            {STATUSES.map(s => (
              <span key={s} className={`chip ${statusSel.includes(s) ? 'active' : ''}`} onClick={() => toggleStatus(s)}>
                <span className="dot" style={{background: AppData.statusMeta[s].dot}}/>
                {AppData.statusMeta[s].label}
              </span>
            ))}
          </div>

          <span style={{flex:1}}></span>

          <select className="input" style={{width:'auto'}} value={custSel} onChange={e => setCustSel(e.target.value)}>
            <option value="">All customers</option>
            {Object.values(customers).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="input" style={{width:'auto'}} value={truckSel} onChange={e => setTruckSel(e.target.value)}>
            <option value="">All trucks</option>
            {trucks.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input className="input num" style={{width:160}} value={invoiceQ} onChange={e => setInvoiceQ(e.target.value)} placeholder="Invoice no." title="Filter by invoice number"/>
          <input className="input num" style={{width:160}} value={poQ} onChange={e => setPoQ(e.target.value)} placeholder="Customer PO" title="Filter by customer PO number"/>
          <input className="input" type="date" style={{width:'auto'}} value={from} onChange={e => setFrom(e.target.value)} title="From"/>
          <span className="t3">→</span>
          <input className="input" type="date" style={{width:'auto'}} value={to} onChange={e => setTo(e.target.value)} title="To"/>
          {(statusSel.length || custSel || truckSel || invoiceQ || poQ || from || to || search) && (
            <button className="btn btn-tertiary btn-compact" onClick={clearAll}>Clear</button>
          )}
        </div>

        <div className="table-scroll">
          <table className="sap-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Delivery</th>
                <th>Sales order</th>
                <th>Customer PO</th>
                <th>Invoice</th>
                <th>Truck ref.</th>
                <th>Customer / Ship-to</th>
                <th>Destination</th>
                <th>Planned</th>
                <th>PGI</th>
                <th>POD</th>
                <th>Driver / Plate</th>
                <th style={{width:120}}>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={13}><div className="empty-state"><div className="empty-icon"><Ico.Files/></div><div className="empty-title">No results</div><div className="empty-body">Try clearing filters or widening the date range.</div></div></td></tr>
              )}
              {filtered.map(d => {
                const c = customers[d.customer];
                const g = d.group ? groups[d.group] : null;
                const dr = g ? drivers.find(x => x.id === g.driver) : null;
                const hasEv = !!d.pod;
                return (
                  <tr key={d.id} className="row-link" onClick={() => onOpenDetail(d)}>
                    <td><Status status={d.status} mode={statusMode}/></td>
                    <td><a className="num">{d.id}</a></td>
                    <td className="num t2">{d.so}</td>
                    <td className="num t2">{d.customerPO || <span className="t3">—</span>}</td>
                    <td className="num t2">{d.invoiceNo}<div className="t3 fs12">{AppData.fmtMoney(d.invoiceAmount)}</div></td>
                    <td>{d.group ? <span className="num">{d.group}</span> : <span className="t3">—</span>}</td>
                    <td>{c.name}<div className="t3 fs12">{c.shipTo}</div></td>
                    <td className="t2 fs13">{c.city}<div className="t3 fs12">{c.region}</div></td>
                    <td className="num">{AppData.fmtDate(d.plannedDate)}</td>
                    <td className="num">{AppData.fmtDate(d.pgiDate)}</td>
                    <td className="num">{AppData.fmtDate(d.podDate)}</td>
                    <td>{dr ? <>{dr.name}<div className="t3 fs12 num">{g.plate}</div></> : <span className="t3">—</span>}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {hasEv ? (
                        <button className="btn btn-tertiary btn-compact" onClick={() => onViewEvidence(d)} title="View POD evidence captured by driver"><Ico.Eye/> Evidence</button>
                      ) : (
                        <button className="icon-btn" onClick={() => onOpenDetail(d)} title="Details"><Ico.ChevR/></button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12, color:'var(--text2)', borderTop:'1px solid var(--border2)'}}>
          <span>{filtered.length} {filtered.length === 1 ? 'item' : 'items'} · {deliveries.length} total</span>
          <div className="flex gap8">
            <button className="btn btn-secondary btn-compact" disabled><Ico.ChevL/> Previous</button>
            <button className="btn btn-secondary btn-compact">Next <Ico.ChevR/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Document Search Report ----------
function DocumentSearch({ deliveries, customers, groups, drivers, statusMode, onOpenDetail }) {
  const [docType, setDocType] = useState('Delivery'); // 'Sales Order' | 'Delivery' | 'Invoice' | 'Customer PO' | 'Truck-Ref'
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const placeholderMap = { 'Sales Order': 'SO-450231', 'Delivery': 'D80001245', 'Invoice': 'INV-2026-78421', 'Customer PO': 'LT-PO-2026-00037', 'Truck-Ref': 'Truck-2026-00012' };

  // Suggestions when typing
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    if (docType === 'Sales Order') {
      const set = new Set(deliveries.map(d => d.so));
      return Array.from(set).filter(s => s.toLowerCase().includes(q)).slice(0, 6);
    }
    if (docType === 'Delivery') {
      return deliveries.map(d => d.id).filter(s => s.toLowerCase().includes(q)).slice(0, 6);
    }
    if (docType === 'Invoice') {
      return deliveries.map(d => d.invoiceNo).filter(Boolean).filter(s => s.toLowerCase().includes(q)).slice(0, 6);
    }
    if (docType === 'Customer PO') {
      const set = new Set(deliveries.map(d => d.customerPO).filter(Boolean));
      return Array.from(set).filter(s => s.toLowerCase().includes(q)).slice(0, 6);
    }
    return Object.keys(groups).filter(s => s.toLowerCase().includes(q)).slice(0, 6);
  }, [query, docType, deliveries, groups]);

  const results = useMemo(() => {
    if (!submitted || !query.trim()) return null;
    const q = query.trim().toLowerCase();
    if (docType === 'Sales Order') return deliveries.filter(d => d.so.toLowerCase().includes(q));
    if (docType === 'Delivery') return deliveries.filter(d => d.id.toLowerCase().includes(q));
    if (docType === 'Invoice') return deliveries.filter(d => (d.invoiceNo || '').toLowerCase().includes(q));
    if (docType === 'Customer PO') return deliveries.filter(d => (d.customerPO || '').toLowerCase().includes(q));
    return deliveries.filter(d => d.group && d.group.toLowerCase().includes(q));
  }, [submitted, query, docType, deliveries]);

  const groupedByTruck = useMemo(() => {
    if (!results) return null;
    const g = {};
    results.forEach(d => {
      const k = d.group || '__unassigned__';
      (g[k] = g[k] || []).push(d);
    });
    return g;
  }, [results]);

  const recentSearches = [
    { type:'Truck-Ref', q:'Truck-2026-00012' },
    { type:'Customer PO', q:'LT-PO-2026-00037' },
    { type:'Invoice', q:'INV-2026-78435' },
    { type:'Sales Order', q:'SO-450231' },
    { type:'Delivery', q:'D80001225' },
  ];

  function runSearch(q, t) {
    setQuery(q);
    setDocType(t || docType);
    setSubmitted(true);
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <div className="page-title">Document search</div>
          <div className="page-subtitle">Find delivery status by Sales Order, Delivery document, Invoice, Customer PO, or Truck reference number.</div>
        </div>
      </div>

      <div className="card mb20">
        <div className="card-body">
          <div className="flex gap8 items-end">
            <div className="field" style={{width:180}}>
              <label className="field-label">Search by</label>
              <select className="input" value={docType} onChange={e => { setDocType(e.target.value); setSubmitted(false); }}>
                <option>Sales Order</option>
                <option>Delivery</option>
                <option>Invoice</option>
                <option>Customer PO</option>
                <option>Truck-Ref</option>
              </select>
            </div>
            <div className="field flex1" style={{position:'relative'}}>
              <label className="field-label">Document number</label>
              <div className="search-input" style={{width:'100%', height:36}}>
                <Ico.Search stroke="#7F8C9A"/>
                <input
                  value={query}
                  onChange={e => { setQuery(e.target.value); setSubmitted(false); }}
                  placeholder={placeholderMap[docType]}
                  onKeyDown={e => e.key === 'Enter' && setSubmitted(true)}
                />
                {query && <button className="icon-btn" onClick={() => { setQuery(''); setSubmitted(false); }} style={{width:24, height:24}}><Ico.X/></button>}
              </div>
              {suggestions.length > 0 && query && !submitted && (
                <div style={{position:'absolute', left:0, right:0, top:'100%', marginTop:4, background:'var(--bg)', borderRadius:8, boxShadow:'var(--sh-pop)', zIndex:5, overflow:'hidden'}}>
                  {suggestions.map(s => (
                    <div key={s} className="row-link" style={{padding:'8px 12px', borderBottom:'1px solid var(--border2)', display:'flex', alignItems:'center', gap:8}} onClick={() => runSearch(s)}>
                      <Ico.Search stroke="#7F8C9A"/>
                      <span className="num">{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-primary" onClick={() => setSubmitted(true)} disabled={!query.trim()}><Ico.Search stroke="#fff"/> Search</button>
          </div>

          {!submitted && (
            <>
              <div className="sec-title mt20">Recent searches</div>
              <div className="flex gap8" style={{flexWrap:'wrap'}}>
                {recentSearches.map((r, i) => (
                  <span key={i} className="chip" onClick={() => runSearch(r.q, r.type)}>
                    <span className="t3 fs12 fw700" style={{textTransform:'uppercase'}}>{r.type}</span>
                    <span className="num">{r.q}</span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {results && results.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon"><Ico.Files width="32" height="32"/></div>
            <div className="empty-title">No deliveries found</div>
            <div className="empty-body">No documents match "{query}" as a {docType}. Check the number, or change the document type.</div>
          </div>
        </div>
      )}

      {results && results.length > 0 && (
        <div>
          <div className="msg-strip msg-info mb16">
            <Ico.Info stroke="#0064D9"/>
            <div><span className="msg-strip-title">{results.length} {results.length === 1 ? 'delivery' : 'deliveries'} found</span> for {docType} "{query}".</div>
          </div>

          {Object.entries(groupedByTruck).map(([truckRef, items]) => {
            const g = truckRef === '__unassigned__' ? null : groups[truckRef];
            const dr = g ? drivers.find(x => x.id === g.driver) : null;
            const w = items.reduce((s, d) => s + d.totalWeight, 0);
            const p = items.reduce((s, d) => s + d.pallets, 0);
            return (
              <div className="card mb16" key={truckRef}>
                <div className="card-header" style={{padding:'14px 18px'}}>
                  <div className="flex items-center gap12">
                    {truckRef === '__unassigned__' ? (
                      <>
                        <div style={{width:36, height:36, borderRadius:8, background:'var(--bg-shell)', color:'var(--text2)', display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                          <Ico.Boxes/>
                        </div>
                        <div>
                          <div className="card-title">Unassigned (no truck group)</div>
                          <div className="card-subtitle">{items.length} deliveries · awaiting grouping</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{width:36, height:36, borderRadius:8, background:'var(--blue-tint)', color:'var(--blue-h)', display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                          <Ico.Truck/>
                        </div>
                        <div>
                          <div className="card-title num">{truckRef}</div>
                          <div className="card-subtitle">
                            {dr ? <>{dr.name} · <span className="num">{g.plate}</span> · </> : null}
                            {items.length} deliveries · {AppData.fmtNum(w, 1)} kg · {p} pallets
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="sap-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Delivery</th>
                        <th>Sales order</th>
                        <th>Customer PO</th>
                        <th>Invoice</th>
                        <th>Customer</th>
                        <th>Destination</th>
                        <th>Planned</th>
                        <th>PGI</th>
                        <th>POD</th>
                        <th style={{width:36}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(d => {
                        const c = customers[d.customer];
                        return (
                          <tr key={d.id} className="row-link" onClick={() => onOpenDetail(d)}>
                            <td><Status status={d.status} mode={statusMode}/></td>
                            <td><a className="num">{d.id}</a></td>
                            <td className="num t2">{d.so}</td>
                            <td className="num t2">{d.customerPO || <span className="t3">—</span>}</td>
                            <td className="num t2">{d.invoiceNo}<div className="t3 fs12">{AppData.fmtMoney(d.invoiceAmount)}</div></td>
                            <td>{c.name}<div className="t3 fs12">{c.shipTo}</div></td>
                            <td className="t2 fs13">{c.city}<div className="t3 fs12">{c.region}</div></td>
                            <td className="num">{AppData.fmtDate(d.plannedDate)}</td>
                            <td className="num">{AppData.fmtDate(d.pgiDate)}</td>
                            <td className="num">{AppData.fmtDate(d.podDate)}</td>
                            <td><button className="icon-btn" onClick={(e) => { e.stopPropagation(); onOpenDetail(d); }}><Ico.ChevR/></button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Overview ----------
function Overview({ deliveries, customers, groups, statusMode, onGoto }) {
  const counts = useMemo(() => {
    const c = { Open:0, PGI:0, 'In Transit':0, POD:0, 'POD Reject':0 };
    deliveries.forEach(d => { c[d.status] = (c[d.status] || 0) + 1; });
    return c;
  }, [deliveries]);

  return (
    <div>
      <div className="page-title-row">
        <div>
          <div className="page-title">Overview</div>
          <div className="page-subtitle">Welcome back, Ploy. Today is {new Date().toLocaleDateString('en-GB', {weekday:'long', day:'2-digit', month:'long', year:'numeric'})}.</div>
        </div>
        <div className="flex gap8">
          <button className="btn btn-secondary"><Ico.Refresh/> Refresh</button>
          <button className="btn btn-primary" onClick={() => onGoto('grouping')}><Ico.Plus/> New truck group</button>
        </div>
      </div>

      <div className="kpi-strip">
        <div className="kpi-card" onClick={() => onGoto('grouping')}>
          <div className="kpi-label">Unassigned open</div>
          <div className="kpi-val" style={{color:'var(--info)'}}>{counts['Open']}</div>
          <div className="kpi-sub"><span className="dot" style={{background:'var(--info)'}}/>Ready to group</div>
        </div>
        <div className="kpi-card" onClick={() => onGoto('status')}>
          <div className="kpi-label">PGI · in transit</div>
          <div className="kpi-val" style={{color:'#E07A00'}}>{counts['PGI'] + counts['In Transit']}</div>
          <div className="kpi-sub"><span className="dot" style={{background:'#FF9900'}}/>Not yet POD</div>
        </div>
        <div className="kpi-card" onClick={() => onGoto('status')}>
          <div className="kpi-label">POD complete</div>
          <div className="kpi-val" style={{color:'var(--pos-dark)'}}>{counts['POD']}</div>
          <div className="kpi-sub"><span className="dot" style={{background:'var(--pos)'}}/>Confirmed delivery</div>
        </div>
        <div className="kpi-card" onClick={() => onGoto('status')}>
          <div className="kpi-label">POD with reject</div>
          <div className="kpi-val" style={{color:'var(--neg)'}}>{counts['POD Reject']}</div>
          <div className="kpi-sub"><span className="dot" style={{background:'var(--neg)'}}/>Action required</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Active truck groups</div>
          <div className="kpi-val">{Object.keys(groups).length}</div>
          <div className="kpi-sub"><span className="dot" style={{background:'var(--text3)'}}/>This week</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:16}}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Active truck groups</div>
              <div className="card-subtitle">In planning, PGI'd, in transit</div>
            </div>
            <button className="btn btn-tertiary btn-compact" onClick={() => onGoto('groups')}>View all <Ico.ChevR/></button>
          </div>
          <table className="sap-table">
            <thead>
              <tr>
                <th>Truck ref.</th>
                <th>Driver</th>
                <th>Plate</th>
                <th>Deliveries</th>
                <th>Status mix</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(groups).map(g => {
                const items = deliveries.filter(d => d.group === g.ref);
                const dr = AppData.drivers.find(x => x.id === g.driver);
                const stMix = items.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {});
                return (
                  <tr key={g.ref} className="row-link" onClick={() => onGoto('status')}>
                    <td><a className="num">{g.ref}</a></td>
                    <td>{dr.name}</td>
                    <td className="num t2">{g.plate}</td>
                    <td className="num">{items.length}</td>
                    <td>
                      <div className="flex gap4">
                        {Object.entries(stMix).map(([s, c]) => (
                          <span key={s} className="tag" style={{background: AppData.statusMeta[s].bg, fontSize:11}}>{c} {AppData.statusMeta[s].label}</span>
                        ))}
                      </div>
                    </td>
                    <td className="num">{AppData.fmtDate(g.createdOn)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Needs your attention</div>
              <div className="card-subtitle">Rejects & overdue PGIs</div>
            </div>
          </div>
          <div style={{padding:'4px 0'}}>
            {deliveries.filter(d => d.status === 'POD Reject').map(d => (
              <div key={d.id} style={{padding:'12px 16px', borderBottom:'1px solid var(--border2)', display:'flex', gap:10, alignItems:'flex-start'}}>
                <div className="dot" style={{background:'var(--neg)', marginTop:6}}/>
                <div style={{flex:1}}>
                  <div className="fw700 fs13"><span className="num">{d.id}</span> · {customers[d.customer].name}</div>
                  <div className="t2 fs12 mt4">{d.rejectReason}</div>
                  <div className="t3 fs12 mt4">POD {AppData.fmtDate(d.podDate)} · Truck <span className="num">{d.group}</span></div>
                </div>
                <button className="btn btn-tertiary btn-compact">Review</button>
              </div>
            ))}
            {deliveries.filter(d => d.status === 'PGI').slice(0,2).map(d => (
              <div key={d.id} style={{padding:'12px 16px', borderBottom:'1px solid var(--border2)', display:'flex', gap:10, alignItems:'flex-start'}}>
                <div className="dot" style={{background:'var(--warn)', marginTop:6}}/>
                <div style={{flex:1}}>
                  <div className="fw700 fs13"><span className="num">{d.id}</span> · {customers[d.customer].name}</div>
                  <div className="t2 fs12 mt4">PGI on {AppData.fmtDate(d.pgiDate)} — POD not yet confirmed.</div>
                </div>
                <button className="btn btn-tertiary btn-compact">View</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Groups list ----------
function GroupsList({ deliveries, customers, groups, drivers, statusMode, onOpenDetail, onGoto }) {
  return (
    <div>
      <div className="page-title-row">
        <div>
          <div className="page-title">My truck groups</div>
          <div className="page-subtitle">All trucks you've grouped this period.</div>
        </div>
        <button className="btn btn-primary" onClick={() => onGoto('grouping')}><Ico.Plus/> New truck group</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(420px, 1fr))', gap:16}}>
        {Object.values(groups).map(g => {
          const items = deliveries.filter(d => d.group === g.ref);
          const dr = drivers.find(x => x.id === g.driver);
          const w = items.reduce((s, d) => s + d.totalWeight, 0);
          const v = items.reduce((s, d) => s + d.totalVolume, 0);
          const p = items.reduce((s, d) => s + d.pallets, 0);
          const stMix = items.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {});
          const dominant = Object.entries(stMix).sort((a,b) => b[1]-a[1])[0]?.[0];

          return (
            <div className="card" key={g.ref}>
              <div className="card-header">
                <div className="flex items-center gap10">
                  <div style={{width:32, height:32, borderRadius:8, background:'var(--blue-tint)', color:'var(--blue-h)', display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                    <Ico.Truck/>
                  </div>
                  <div>
                    <div className="card-title num">{g.ref}</div>
                    <div className="card-subtitle">{dr.name} · <span className="num">{g.plate}</span></div>
                  </div>
                </div>
                {dominant && <Status status={dominant} mode={statusMode}/>}
              </div>
              <div className="truck-summary">
                <div className="ts-cell"><div className="ts-label">Deliveries</div><div className="ts-val">{items.length}</div></div>
                <div className="ts-cell"><div className="ts-label">Weight</div><div className="ts-val num">{AppData.fmtNum(w, 0)} kg</div></div>
                <div className="ts-cell"><div className="ts-label">Volume</div><div className="ts-val num">{AppData.fmtNum(v, 1)} m³</div></div>
                <div className="ts-cell"><div className="ts-label">Pallets</div><div className="ts-val">{p}</div></div>
              </div>
              <table className="sap-table">
                <tbody>
                  {items.map(d => (
                    <tr key={d.id} className="row-link" onClick={() => onOpenDetail(d)}>
                      <td style={{width:80}}><Status status={d.status} mode={statusMode}/></td>
                      <td><a className="num">{d.id}</a></td>
                      <td className="t2">{customers[d.customer].name}</td>
                      <td className="num t2 text-right">{AppData.fmtNum(d.totalWeight, 1)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { DeliveryDetailDrawer, StatusReport, DocumentSearch, Overview, GroupsList });
