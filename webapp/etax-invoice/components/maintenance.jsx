// Sold-to and Ship-to maintenance pages

const SoldToPage = ({ customers, onUpdate }) => {
  const [search, setSearch] = React.useState("");
  const [editId, setEditId] = React.useState(null);

  const filtered = customers.filter(c =>
    !search || c.soldTo.includes(search) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.nameTh.includes(search)
  );

  return (
    <div className="page-area">
      <div className="breadcrumb">
        <a>Home</a>
        <Icon name="chevron_right" size={12} stroke="#7F8C9A" />
        <span>Master Data</span>
        <Icon name="chevron_right" size={12} stroke="#7F8C9A" />
        <span>Sold-to Settings</span>
      </div>
      <div className="page-title-row">
        <div>
          <div className="page-title">Sold-to Settings <span className="th"> · ตั้งค่าตามรหัสลูกค้า</span></div>
          <div className="page-subtitle">Number of master copies and PO attachment per Sold-to (รหัสลูกค้า)</div>
        </div>
        <div className="flex" style={{ gap: 8 }}>
          <button className="btn btn-tertiary btn-compact"><Icon name="download" size={14} /> Export CSV</button>
          <button className="btn btn-secondary"><Icon name="plus" size={14} /> New entry</button>
        </div>
      </div>

      <div className="msg-strip msg-info" style={{ fontSize: 13 }}>
        <Icon name="info" size={16} stroke="#0064D9" style={{ flexShrink: 0, marginTop: 2 }} />
        <div>
          <div className="msg-strip-title" style={{ color: "#0064D9" }}>How this works</div>
          <span style={{ color: "var(--text)" }}>
            <strong>Master copies</strong> sets how many full sets (Tax Invoice + Receipt + Delivery Note) print per delivery.
            <strong> Attach PO</strong> appends the customer's purchase order to the printed set.
            Changes apply to <em>new</em> billing documents only.
          </span>
        </div>
      </div>

      <div className="filter-bar">
        <div className="shell-search" style={{ width: 320, height: 32 }}>
          <Icon name="search" size={14} stroke="#7F8C9A" />
          <input placeholder="Search Sold-to code or name…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text2)" }}>
          <strong style={{ color: "var(--text)" }}>{filtered.length}</strong> of {customers.length} customers
        </div>
      </div>

      <div className="maint-table-wrap">
        <div className="table-scroll">
          <table className="sap-table">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Sold-to</th>
                <th>Customer name</th>
                <th>Tax ID</th>
                <th>Payment terms</th>
                <th style={{ width: 130 }}>Master copies <Tooltip text="Number of full sets to print per delivery"><Icon name="info" size={11} stroke="#7F8C9A" style={{ verticalAlign: "middle" }} /></Tooltip></th>
                <th style={{ width: 110 }}>Attach PO</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const editing = editId === c.soldTo;
                return (
                  <tr key={c.soldTo} className={editing ? "selected" : ""}>
                    <td><span className="mono" style={{ fontWeight: 700, color: "var(--blue-h)" }}>{c.soldTo}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text2)" }}>{c.nameTh}</div>
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>{c.taxId}</td>
                    <td>{c.paymentTerms}</td>
                    <td>
                      {editing ? (
                        <div className="stepper">
                          <button onClick={() => onUpdate(c.soldTo, { masterCopies: Math.max(1, c.masterCopies - 1) })} disabled={c.masterCopies <= 1}>−</button>
                          <input value={c.masterCopies} readOnly />
                          <button onClick={() => onUpdate(c.soldTo, { masterCopies: c.masterCopies + 1 })}>+</button>
                        </div>
                      ) : (
                        <strong style={{ fontSize: 14, color: "var(--text)" }}>{c.masterCopies}</strong>
                      )}
                    </td>
                    <td>
                      <label className="switch">
                        <input type="checkbox" checked={c.requiresPo} onChange={() => onUpdate(c.soldTo, { requiresPo: !c.requiresPo })} />
                        <span className="switch-slider"></span>
                      </label>
                    </td>
                    <td>
                      <button className="btn btn-tertiary btn-compact" onClick={() => setEditId(editing ? null : c.soldTo)}>
                        {editing ? "Done" : "Edit"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>{filtered.length} entries</span>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>Last sync from S/4HANA: Today 09:42</span>
        </div>
      </div>
    </div>
  );
};

const ShipToPage = ({ shipTos, customers, onUpdate }) => {
  const [search, setSearch] = React.useState("");
  const [filterFlagged, setFilterFlagged] = React.useState(false);

  let filtered = shipTos.filter(s =>
    !search || s.shipTo.includes(search) ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.nameTh.includes(search)
  );
  if (filterFlagged) filtered = filtered.filter(s => s.requiresDeliveryNote);
  const customerName = (soldTo) => (customers.find(c => c.soldTo === soldTo) || {}).name || "—";
  const flagged = shipTos.filter(s => s.requiresDeliveryNote).length;

  return (
    <div className="page-area">
      <div className="breadcrumb">
        <a>Home</a>
        <Icon name="chevron_right" size={12} stroke="#7F8C9A" />
        <span>Master Data</span>
        <Icon name="chevron_right" size={12} stroke="#7F8C9A" />
        <span>Ship-to Settings</span>
      </div>
      <div className="page-title-row">
        <div>
          <div className="page-title">Ship-to Settings <span className="th"> · ตั้งค่าตามรหัสสถานที่ส่ง</span></div>
          <div className="page-subtitle">Flag a Ship-to to receive an extra Delivery Note (without price) printed with the master set</div>
        </div>
        <div className="flex" style={{ gap: 8 }}>
          <button className="btn btn-tertiary btn-compact"><Icon name="download" size={14} /> Export CSV</button>
          <button className="btn btn-secondary"><Icon name="plus" size={14} /> New entry</button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="shell-search" style={{ width: 320, height: 32 }}>
          <Icon name="search" size={14} stroke="#7F8C9A" />
          <input placeholder="Search Ship-to code or name…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-divider"></div>
        <div className={"filter-chip" + (filterFlagged ? " active" : "")} onClick={() => setFilterFlagged(!filterFlagged)}>
          Requires extra Delivery Note <span className="count">{flagged}</span>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text2)" }}>
          <strong style={{ color: "var(--text)" }}>{filtered.length}</strong> of {shipTos.length} ship-to locations
        </div>
      </div>

      <div className="maint-table-wrap">
        <div className="table-scroll">
          <table className="sap-table">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Ship-to</th>
                <th>Location</th>
                <th>Address</th>
                <th>Sold-to</th>
                <th style={{ width: 200 }}>Extra Delivery Note (no price)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.shipTo}>
                  <td><span className="mono" style={{ fontWeight: 700, color: "var(--blue-h)" }}>{s.shipTo}</span></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{s.nameTh}</div>
                  </td>
                  <td style={{ fontSize: 12, maxWidth: 280 }}>{s.address}</td>
                  <td style={{ fontSize: 12 }}>
                    <div className="mono">{s.soldTo}</div>
                    <div style={{ color: "var(--text2)", fontSize: 11 }}>{customerName(s.soldTo)}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <label className="switch">
                        <input type="checkbox" checked={s.requiresDeliveryNote} onChange={() => onUpdate(s.shipTo, { requiresDeliveryNote: !s.requiresDeliveryNote })} />
                        <span className="switch-slider"></span>
                      </label>
                      {s.requiresDeliveryNote ? (
                        <span style={{ fontSize: 12, color: "var(--pos-dark)", fontWeight: 600 }}>+1 page enabled</span>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--text3)" }}>Not required</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>{filtered.length} entries · {flagged} flagged for extra Delivery Note</span>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>Last sync from S/4HANA: Today 09:42</span>
        </div>
      </div>
    </div>
  );
};

const HistoryPage = ({ deliveries }) => {
  const billed = deliveries.filter(d => d.billingDoc);
  return (
    <div className="page-area">
      <div className="breadcrumb">
        <a>Home</a>
        <Icon name="chevron_right" size={12} stroke="#7F8C9A" />
        <span>Billing History</span>
      </div>
      <div className="page-title-row">
        <div>
          <div className="page-title">Billing History <span className="th"> · ประวัติเอกสารเรียกเก็บ</span></div>
          <div className="page-subtitle">All billing documents created through this portal</div>
        </div>
        <button className="btn btn-secondary"><Icon name="download" size={14} /> Export</button>
      </div>
      <div className="table-wrap">
        <div className="table-scroll">
          <table className="sap-table">
            <thead>
              <tr>
                <th>Billing doc</th><th>Delivery</th><th>Customer</th>
                <th className="num">Total (THB)</th><th>iNet status</th><th>iNet ref (= billing doc)</th><th>Printed</th><th></th>
              </tr>
            </thead>
            <tbody>
              {billed.map(d => (
                <tr key={d.id} className="selectable">
                  <td style={{ fontWeight: 700, color: "var(--blue-h)" }}>{d.billingDoc}</td>
                  <td>{d.delivery}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{d.soldToName}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{d.soldTo}</div>
                  </td>
                  <td className="num tabular" style={{ fontWeight: 700 }}>{fmtNum(d.total)}</td>
                  <td>
                    {d.inetStatus === "certified" && <span className="pill pill-success"><span className="pill-dot"></span>Certified</span>}
                    {d.inetStatus === "submitted" && <span className="pill pill-pending"><span className="pill-dot"></span>Submitted</span>}
                    {d.inetStatus === "rejected" && <span className="pill pill-error"><span className="pill-dot"></span>Rejected</span>}
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>{d.billingDoc || "—"}</td>
                  <td>{d.printCount ? <span style={{ fontWeight: 600 }}>{d.printCount} ×</span> : <span className="muted">—</span>}</td>
                  <td><button className="btn btn-tertiary btn-compact"><Icon name="eye" size={13} /> View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const InetPage = () => (
  <div className="page-area">
    <div className="breadcrumb">
      <a>Home</a>
      <Icon name="chevron_right" size={12} stroke="#7F8C9A" />
      <span>iNet Connection</span>
    </div>
    <div className="page-title-row">
      <div>
        <div className="page-title">iNet Connection <span className="th"> · การเชื่อมต่อไอเน็ต</span></div>
        <div className="page-subtitle">E-Tax Invoice service provider configuration</div>
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div className="info-card">
        <div className="info-card-title">Connection status</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span className="pill pill-success"><span className="pill-dot"></span>Connected</span>
          <span style={{ fontSize: 12, color: "var(--text2)" }}>Last ping: 2 sec ago</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 16px", fontSize: 13 }}>
          <span className="muted">Endpoint</span><span className="mono" style={{ fontSize: 12 }}>https://api.inet.co.th/etax/v3</span>
          <span className="muted">Account</span><span className="mono" style={{ fontSize: 12 }}>greenspot-prod-001</span>
          <span className="muted">Certificate</span><span>SHA-256 · Valid until 2027-08-15</span>
          <span className="muted">Schema version</span><span>v3.0 (Revenue Department, Thailand)</span>
        </div>
      </div>
      <div className="info-card">
        <div className="info-card-title">Today's traffic</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>Submitted</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>47</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>Certified</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--pos-dark)" }}>44</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>Pending</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--warn)" }}>2</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "var(--text2)" }}>Rejected</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--neg)" }}>1</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { SoldToPage, ShipToPage, HistoryPage, InetPage });
