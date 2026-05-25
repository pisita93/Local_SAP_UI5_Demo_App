/* global React, AppData */
// Grouping wizard — pick deliveries -> review products -> confirm + generate ref
const { useState, useMemo, useEffect } = React;

function totalsFor(deliveryIds, deliveries) {
  let w=0, v=0, p=0, lines=0;
  const set = new Set(deliveryIds);
  deliveries.forEach(d => {
    if (set.has(d.id)) {
      w += d.totalWeight; v += d.totalVolume; p += d.pallets; lines += d.items.length;
    }
  });
  return { weight: Math.round(w*10)/10, volume: Math.round(v*100)/100, pallets: p, lines };
}

function WizardStepper({ step }) {
  const steps = ['Select deliveries', 'Review products', 'Confirm & generate'];
  return (
    <div className="stepper">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`step ${step === i ? 'active' : step > i ? 'done' : ''}`}>
            <span className="step-num">{step > i ? <Ico.Check/> : i+1}</span>
            <span className="step-label">{s}</span>
          </div>
          {i < steps.length - 1 && <div className="step-divider"/>}
        </React.Fragment>
      ))}
    </div>
  );
}

function AvailableRow({ d, checked, expanded, onToggle, onExpand, customer, statusMode }) {
  const { fmtDate, fmtNum } = AppData;
  return (
    <React.Fragment>
      <tr className={checked ? 'selected row-link' : 'row-link'} onClick={() => onToggle(d.id)}>
        <td style={{width:36, paddingRight:0}}><Cbx checked={checked} onChange={() => onToggle(d.id)}/></td>
        <td style={{width:30, paddingLeft:4, paddingRight:0}}>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onExpand(d.id); }} title="Show items" style={{width:24, height:24}}>
            <span style={{display:'inline-flex', transform: expanded ? 'rotate(0)' : 'rotate(-90deg)', transition:'transform 0.15s'}}><Ico.ChevD/></span>
          </button>
        </td>
        <td><a className="num">{d.id}</a></td>
        <td className="num t2">{d.so}</td>
        <td>{customer.name}<div className="t3 fs12">{customer.city}</div></td>
        <td className="num">{fmtDate(d.plannedDate)}</td>
        <td className="num text-right">{fmtNum(d.totalWeight, 1)} kg</td>
        <td className="num text-right">{fmtNum(d.totalVolume, 2)} m³</td>
        <td className="num text-right">{d.pallets}</td>
        <td><Status status={d.status} mode={statusMode}/></td>
      </tr>
      {expanded && (
        <tr className="expanded">
          <td colSpan={10} className="expand-cell">
            <div className="expand-inner">
              <ProductTable items={d.items}/>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

function TruckRow({ d, expanded, onExpand, onRemove, customer, statusMode }) {
  const { fmtDate, fmtNum } = AppData;
  return (
    <React.Fragment>
      <tr className="row-link" onClick={() => onExpand(d.id)}>
        <td style={{width:30, paddingLeft:8, paddingRight:0}}>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onExpand(d.id); }} title="Show items" style={{width:24, height:24}}>
            <span style={{display:'inline-flex', transform: expanded ? 'rotate(0)' : 'rotate(-90deg)', transition:'transform 0.15s'}}><Ico.ChevD/></span>
          </button>
        </td>
        <td><a className="num">{d.id}</a><div className="t3 fs12">{d.so}</div></td>
        <td>{customer.name}<div className="t3 fs12">{customer.city}</div></td>
        <td className="num text-right">{fmtNum(d.totalWeight, 1)} kg</td>
        <td className="num text-right">{d.pallets}</td>
        <td style={{width:36, paddingLeft:0}}>
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onRemove(d.id); }} title="Remove from truck"><Ico.X/></button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="expand-cell">
            <div className="expand-inner" style={{paddingLeft: 36}}>
              <ProductTable items={d.items}/>
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

function GroupingScreen({ deliveries, customers, truckSpec, drivers, statusMode, density, onGenerated, onCancel }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState([]); // delivery ids in the truck
  const [expanded, setExpanded] = useState({}); // id -> true
  const [searchAvail, setSearchAvail] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterCust, setFilterCust] = useState('');
  const [driverId, setDriverId] = useState(drivers[0].id);
  const [note, setNote] = useState('');
  const [overrideOK, setOverrideOK] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);

  // available = open & not in another group
  const available = useMemo(() => {
    return deliveries.filter(d => d.status === 'Open' && !d.group && !selected.includes(d.id));
  }, [deliveries, selected]);

  const filteredAvail = useMemo(() => {
    const q = searchAvail.trim().toLowerCase();
    return available.filter(d => {
      if (q && !(d.id.toLowerCase().includes(q) || d.so.toLowerCase().includes(q) || customers[d.customer].name.toLowerCase().includes(q))) return false;
      if (filterDate && d.plannedDate !== filterDate) return false;
      if (filterCust && d.customer !== filterCust) return false;
      return true;
    });
  }, [available, searchAvail, filterDate, filterCust, customers]);

  const selDeliveries = useMemo(() => selected.map(id => deliveries.find(d => d.id === id)).filter(Boolean), [selected, deliveries]);

  const totals = useMemo(() => totalsFor(selected, deliveries), [selected, deliveries]);
  const pctW = (totals.weight / truckSpec.maxWeight) * 100;
  const pctV = (totals.volume / truckSpec.maxVolume) * 100;
  const pctP = (totals.pallets / truckSpec.maxPallets) * 100;
  const utilization = Math.max(pctW, pctV, pctP);
  const overCapacity = pctW > 100 || pctV > 100 || pctP > 100;
  const nearCapacity = utilization > 85 && !overCapacity;

  const toggleSel = (id) => {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  };
  const toggleExp = (id) => setExpanded(e => ({...e, [id]: !e[id]}));

  // Selection mode: also support bulk "add to truck"
  const [bulkSel, setBulkSel] = useState(new Set());
  const toggleBulk = (id) => setBulkSel(b => { const n = new Set(b); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const addBulk = () => {
    if (bulkSel.size === 0) return;
    setSelected(s => Array.from(new Set([...s, ...bulkSel])));
    setBulkSel(new Set());
  };
  const allFilteredSelected = filteredAvail.length > 0 && filteredAvail.every(d => bulkSel.has(d.id));
  const someFilteredSelected = filteredAvail.some(d => bulkSel.has(d.id));
  const toggleAllFiltered = () => {
    if (allFilteredSelected) {
      setBulkSel(b => { const n = new Set(b); filteredAvail.forEach(d => n.delete(d.id)); return n; });
    } else {
      setBulkSel(b => { const n = new Set(b); filteredAvail.forEach(d => n.add(d.id)); return n; });
    }
  };

  const goNext = () => {
    if (step === 0 && selected.length === 0) { window.toast('Add at least one delivery to the truck', 'error'); return; }
    if (step === 2) {
      const ref = generateRef();
      onGenerated({ ref, deliveryIds: selected, driverId, note, plate: drivers.find(x => x.id === driverId).plate, totals });
      return;
    }
    setStep(s => s + 1);
  };
  const goBack = () => setStep(s => Math.max(0, s - 1));

  function generateRef() {
    // Build a sensible next number from existing groups (highest +1)
    const existing = Object.keys(AppData.groups);
    let n = 0;
    existing.forEach(r => { const m = r.match(/Truck-2026-(\d+)/); if (m) n = Math.max(n, parseInt(m[1], 10)); });
    return `Truck-2026-${String(n+1).padStart(5, '0')}`;
  }

  return (
    <div className="flex-col" style={{gap:0, height:'100%'}}>
      <WizardStepper step={step}/>
      <div style={{padding: '16px 24px 0'}}>
        <div className="page-title-row">
          <div>
            <div className="page-title">{step === 0 ? 'Select deliveries' : step === 1 ? 'Review products & quantities' : 'Confirm & generate reference'}</div>
            <div className="page-subtitle">
              {step === 0 && 'Pick open deliveries to load onto a single truck. Capacity updates live.'}
              {step === 1 && 'Verify item composition before generating the truck reference.'}
              {step === 2 && 'Assign a driver and confirm. A truck reference is written back to each delivery document.'}
            </div>
          </div>
          <div className="flex gap8">
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            {step > 0 && <button className="btn btn-secondary" onClick={goBack}><Ico.ArrowL/>Back</button>}
            <button className="btn btn-primary" onClick={goNext} disabled={step === 0 && selected.length === 0 || (step === 2 && overCapacity && !overrideOK)}>
              {step === 2 ? <>Generate truck reference <Ico.Check/></> : <>Next <Ico.ArrowR/></>}
            </button>
          </div>
        </div>
      </div>

      {step === 0 && (
        <div className="grouping-grid" style={{padding:'0 24px 24px'}}>
          {/* LEFT: available deliveries */}
          <div className="grouping-pane">
            <div className="pane-header">
              <div>
                <div className="card-title">Available deliveries</div>
                <div className="card-subtitle">{filteredAvail.length} of {available.length} shown · {available.length} unassigned open</div>
              </div>
              <div className="flex gap8">
                <button className="btn btn-secondary btn-compact" onClick={addBulk} disabled={bulkSel.size === 0}>
                  <Ico.ArrowR/> Add {bulkSel.size > 0 ? `(${bulkSel.size})` : ''} to truck
                </button>
              </div>
            </div>
            <div className="pane-toolbar">
              <div className="search-input" style={{width:260}}>
                <Ico.Search stroke="#7F8C9A"/>
                <input value={searchAvail} onChange={e => setSearchAvail(e.target.value)} placeholder="Search by SO, DLV, customer..."/>
              </div>
              <select className="input" style={{width:'auto'}} value={filterCust} onChange={e => setFilterCust(e.target.value)}>
                <option value="">All customers</option>
                {Object.values(customers).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input className="input" type="date" style={{width:'auto'}} value={filterDate} onChange={e => setFilterDate(e.target.value)}/>
              {(searchAvail || filterCust || filterDate) && (
                <button className="btn btn-tertiary btn-compact" onClick={() => { setSearchAvail(''); setFilterDate(''); setFilterCust(''); }}>Clear</button>
              )}
            </div>
            <div className="pane-body">
              <table className="sap-table">
                <thead>
                  <tr>
                    <th style={{width:36, paddingRight:0}}><Cbx checked={allFilteredSelected} indeterminate={someFilteredSelected && !allFilteredSelected} onChange={toggleAllFiltered}/></th>
                    <th style={{width:30}}></th>
                    <th>Delivery</th>
                    <th>Sales Order</th>
                    <th>Customer</th>
                    <th>Planned</th>
                    <th className="text-right">Weight</th>
                    <th className="text-right">Volume</th>
                    <th className="text-right">Pallets</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAvail.length === 0 && (
                    <tr><td colSpan={10}><div className="empty-state"><div className="empty-icon"><Ico.Boxes/></div><div className="empty-title">No matching deliveries</div><div className="empty-body">Adjust your filters or check that the delivery is in Open status and not already assigned to a truck.</div></div></td></tr>
                  )}
                  {filteredAvail.map(d => (
                    <AvailableRow key={d.id}
                      d={d}
                      checked={bulkSel.has(d.id)}
                      expanded={!!expanded[d.id]}
                      onToggle={toggleBulk}
                      onExpand={toggleExp}
                      customer={customers[d.customer]}
                      statusMode={statusMode}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: truck */}
          <div className="grouping-pane">
            <div className="pane-header">
              <div className="flex items-center gap10">
                <div style={{width:32, height:32, borderRadius:8, background:'var(--blue-tint)', color:'var(--blue-h)', display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                  <Ico.Truck/>
                </div>
                <div>
                  <div className="card-title">Truck — new group</div>
                  <div className="card-subtitle">{selected.length} delivery{selected.length === 1 ? '' : 's'} loaded</div>
                </div>
              </div>
              {selected.length > 0 && (
                <button className="btn btn-tertiary btn-compact" onClick={() => setSelected([])}>Clear all</button>
              )}
            </div>
            <div style={{padding:'14px 16px', borderBottom:'1px solid var(--border2)'}}>
              <div className="cap-bars">
                <CapBar label="Weight"  value={totals.weight}  max={truckSpec.maxWeight}  unit="kg"  decimals={1}/>
                <CapBar label="Volume"  value={totals.volume}  max={truckSpec.maxVolume}  unit="m³" decimals={2}/>
                <CapBar label="Pallets" value={totals.pallets} max={truckSpec.maxPallets} unit="pal"/>
              </div>
              <div className="flex items-center justify-between mt12">
                <div className="t2 fs12">Overall utilization</div>
                <div className="num fw700" style={{fontSize:18, color: overCapacity ? 'var(--neg)' : nearCapacity ? '#E07A00' : 'var(--text)'}}>{Math.round(utilization)}%</div>
              </div>
              {overCapacity && (
                <div className="msg-strip msg-error mt8" style={{fontSize:12}}>
                  <Ico.Info stroke="#AA0808"/>
                  <div><span className="msg-strip-title">Truck over capacity.</span> Remove deliveries or split into two groups.</div>
                </div>
              )}
              {nearCapacity && !overCapacity && (
                <div className="msg-strip msg-warning mt8" style={{fontSize:12}}>
                  <Ico.Info stroke="#B66800"/>
                  <div><span className="msg-strip-title">Approaching capacity.</span> {Math.round(utilization)}% loaded.</div>
                </div>
              )}
            </div>
            <div className="pane-body">
              {selDeliveries.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon"><Ico.Truck width="32" height="32"/></div>
                  <div className="empty-title">Truck is empty</div>
                  <div className="empty-body">Tick deliveries on the left and click "Add to truck", or click a row to add a single delivery.</div>
                </div>
              ) : (
                <table className="sap-table">
                  <thead>
                    <tr>
                      <th style={{width:30}}></th>
                      <th>Delivery</th>
                      <th>Customer</th>
                      <th className="text-right">Weight</th>
                      <th className="text-right">Pallets</th>
                      <th style={{width:36}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selDeliveries.map(d => (
                      <TruckRow key={d.id}
                        d={d}
                        expanded={!!expanded['t-'+d.id]}
                        onExpand={(id) => setExpanded(e => ({...e, ['t-'+id]: !e['t-'+id]}))}
                        onRemove={(id) => setSelected(s => s.filter(x => x !== id))}
                        customer={customers[d.customer]}
                        statusMode={statusMode}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{padding:'0 24px 24px', overflow:'auto', flex:1}}>
          <div className="card mb16">
            <div className="card-header">
              <div>
                <div className="card-title">Truck contents</div>
                <div className="card-subtitle">{selected.length} deliveries · {totals.lines} item lines · {AppData.fmtNum(totals.weight, 1)} kg</div>
              </div>
              <div className="flex gap8">
                <button className="btn btn-secondary btn-compact" onClick={() => setStep(0)}>Edit selection</button>
              </div>
            </div>
            <div className="truck-summary">
              <div className="ts-cell"><div className="ts-label">Deliveries</div><div className="ts-val">{selected.length}</div></div>
              <div className="ts-cell"><div className="ts-label">Total weight</div><div className="ts-val">{AppData.fmtNum(totals.weight, 1)} kg</div></div>
              <div className="ts-cell"><div className="ts-label">Total volume</div><div className="ts-val">{AppData.fmtNum(totals.volume, 2)} m³</div></div>
              <div className="ts-cell"><div className="ts-label">Pallets</div><div className="ts-val">{totals.pallets} / {truckSpec.maxPallets}</div></div>
            </div>
          </div>

          {selDeliveries.map(d => (
            <div className="card mb12" key={d.id}>
              <div className="card-header">
                <div>
                  <div className="flex items-center gap10">
                    <span className="card-title num">{d.id}</span>
                    <Status status={d.status} mode={statusMode}/>
                  </div>
                  <div className="card-subtitle">
                    <span>SO {d.so}</span> · <span>{customers[d.customer].name}</span> · <span>{customers[d.customer].city}</span> · <span>Planned {AppData.fmtDate(d.plannedDate)}</span>
                  </div>
                </div>
                <div className="flex gap16 items-center">
                  <div className="text-right"><div className="t3 fs12 fw700">WEIGHT</div><div className="num fw700">{AppData.fmtNum(d.totalWeight, 1)} kg</div></div>
                  <div className="text-right"><div className="t3 fs12 fw700">VOLUME</div><div className="num fw700">{AppData.fmtNum(d.totalVolume, 2)} m³</div></div>
                  <div className="text-right"><div className="t3 fs12 fw700">PALLETS</div><div className="num fw700">{d.pallets}</div></div>
                </div>
              </div>
              <div style={{padding: '0 0 4px'}}>
                <ProductTable items={d.items}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {step === 2 && (
        <div style={{padding:'0 24px 24px', overflow:'auto', flex:1}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16}}>
            <div className="card">
              <div className="card-header"><span className="card-title">Truck summary</span></div>
              <div className="card-body">
                <div className="attr-grid">
                  <div className="attr-label">Deliveries</div><div className="attr-val">{selected.length}</div>
                  <div className="attr-label">Item lines</div><div className="attr-val">{totals.lines}</div>
                  <div className="attr-label">Total weight</div><div className="attr-val num">{AppData.fmtNum(totals.weight, 1)} kg <span className="t3 fw400">of {AppData.fmtNum(truckSpec.maxWeight)} kg</span></div>
                  <div className="attr-label">Total volume</div><div className="attr-val num">{AppData.fmtNum(totals.volume, 2)} m³ <span className="t3 fw400">of {truckSpec.maxVolume} m³</span></div>
                  <div className="attr-label">Pallets</div><div className="attr-val num">{totals.pallets} <span className="t3 fw400">of {truckSpec.maxPallets}</span></div>
                  <div className="attr-label">Utilization</div><div className="attr-val num" style={{color: overCapacity ? 'var(--neg)' : nearCapacity ? '#E07A00' : 'var(--text)'}}>{Math.round(utilization)}%</div>
                </div>
                <div className="mt16">
                  <CapBar label="Weight"  value={totals.weight}  max={truckSpec.maxWeight}  unit="kg"  decimals={1}/>
                  <div style={{height:8}}/>
                  <CapBar label="Volume"  value={totals.volume}  max={truckSpec.maxVolume}  unit="m³" decimals={2}/>
                  <div style={{height:8}}/>
                  <CapBar label="Pallets" value={totals.pallets} max={truckSpec.maxPallets} unit="pal"/>
                </div>
                {overCapacity && (
                  <div className="msg-strip msg-error mt16">
                    <Ico.Info stroke="#AA0808"/>
                    <div>
                      <div className="msg-strip-title">Capacity exceeded</div>
                      <div className="mt4">This truck is loaded beyond physical limits. You can still proceed only with an override.</div>
                      <label style={{display:'inline-flex', gap:8, alignItems:'center', marginTop:8}}>
                        <Cbx checked={overrideOK} onChange={setOverrideOK}/>
                        <span>I confirm an override is approved by the dispatcher.</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title">Driver & truck assignment</span></div>
              <div className="card-body">
                <div className="field mb12">
                  <label className="field-label">Assigned driver</label>
                  <select className="input" value={driverId} onChange={e => setDriverId(e.target.value)}>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name} — {d.plate}</option>)}
                  </select>
                </div>
                <div className="field mb12">
                  <label className="field-label">Note (optional)</label>
                  <textarea className="input" style={{height:'auto', padding:'8px 10px', resize:'vertical', minHeight:80}} value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Dock 4 loading at 14:00, fragile pallets last on."/>
                </div>

                <div className="sec-title mt16">What happens on confirmation</div>
                <ul style={{paddingLeft: 16, color:'var(--text2)', fontSize:13, lineHeight:1.6}}>
                  <li>A unique reference <code style={{background:'var(--bg-shell)', padding:'1px 6px', borderRadius:4, fontFamily:'var(--fd)'}}>Truck-2026-XXXXX</code> is generated.</li>
                  <li>The reference is written back to every selected delivery document as a custom field.</li>
                  <li>Deliveries become trackable in the Status report under this truck reference.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="card mt16">
            <div className="card-header"><span className="card-title">Loaded deliveries ({selected.length})</span></div>
            <table className="sap-table">
              <thead>
                <tr>
                  <th>Delivery</th>
                  <th>SO</th>
                  <th>Customer</th>
                  <th>Planned</th>
                  <th className="text-right">Items</th>
                  <th className="text-right">Weight</th>
                  <th className="text-right">Volume</th>
                  <th className="text-right">Pallets</th>
                </tr>
              </thead>
              <tbody>
                {selDeliveries.map(d => (
                  <tr key={d.id}>
                    <td><a className="num">{d.id}</a></td>
                    <td className="num t2">{d.so}</td>
                    <td>{customers[d.customer].name}<div className="t3 fs12">{customers[d.customer].city}</div></td>
                    <td>{AppData.fmtDate(d.plannedDate)}</td>
                    <td className="num text-right">{d.items.length}</td>
                    <td className="num text-right">{AppData.fmtNum(d.totalWeight, 1)} kg</td>
                    <td className="num text-right">{AppData.fmtNum(d.totalVolume, 2)} m³</td>
                    <td className="num text-right">{d.pallets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

window.GroupingScreen = GroupingScreen;
