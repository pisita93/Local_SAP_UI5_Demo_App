// Worklist — the daily driver page
// Shows deliveries ready to bill; filters, bulk select, copy preview tooltip

const computeCopyPlan = (d) => {
  // 3 master copies × master multiplier + delivery note (if ship-to flagged) + PO (if sold-to flagged)
  // Each "master copy" set is actually 3 documents (Tax Invoice + Receipt + Delivery Note)
  // soldToMasterCopies = number of master sets to print
  const masterSets = d.soldToMasterCopies;
  const totalMasterDocs = masterSets * 3;
  const extraDeliveryNote = d.shipToRequiresDeliveryNote ? 1 : 0;
  const includePo = d.soldToRequiresPo ? 1 : 0;
  return {
    masterSets,
    totalMasterDocs,
    extraDeliveryNote,
    includePo,
    totalPages: totalMasterDocs + extraDeliveryNote + includePo,
    reasons: [
      `${masterSets} master ${masterSets === 1 ? "set" : "sets"} (Sold-to setting)`,
      ...(extraDeliveryNote ? ["Extra Delivery Note (Ship-to flagged)"] : []),
      ...(includePo ? ["PO printout attached (Sold-to flagged)"] : []),
    ],
  };
};

const WorklistPage = ({ deliveries, onCreateBilling, onOpenDetail }) => {
  const [selected, setSelected] = React.useState(new Set());
  const [filter, setFilter] = React.useState("ready");
  const [search, setSearch] = React.useState("");
  const [shipPoint, setShipPoint] = React.useState("ALL");
  const [date, setDate] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 12;

  const counts = React.useMemo(() => ({
    all: deliveries.length,
    ready: deliveries.filter(d => d.status === "ready").length,
    sent: deliveries.filter(d => d.status === "sent").length,
    error: deliveries.filter(d => d.status === "error").length,
    draft: deliveries.filter(d => d.status === "draft").length,
  }), [deliveries]);

  const filtered = React.useMemo(() => {
    let xs = deliveries;
    if (filter !== "all") xs = xs.filter(d => d.status === filter);
    if (search) {
      const s = search.toLowerCase();
      xs = xs.filter(d =>
        d.delivery.includes(s) ||
        d.poNumber.toLowerCase().includes(s) ||
        d.soldToName.toLowerCase().includes(s) ||
        d.shipToName.toLowerCase().includes(s) ||
        d.soldTo.includes(s)
      );
    }
    if (shipPoint !== "ALL") xs = xs.filter(d => d.shippingPoint === shipPoint);
    if (date !== "ALL") xs = xs.filter(d => d.pgiDate === date);
    return xs;
  }, [deliveries, filter, search, shipPoint, date]);

  React.useEffect(() => { setPage(1); }, [filter, search, shipPoint, date]);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const allSelected = visible.length > 0 && visible.every(d => selected.has(d.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allSelected) visible.forEach(d => next.delete(d.id));
    else visible.forEach(d => { if (d.status === "ready") next.add(d.id); });
    setSelected(next);
  };
  const toggleOne = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  const selectedDeliveries = deliveries.filter(d => selected.has(d.id));
  const selectedTotal = selectedDeliveries.reduce((a, b) => a + b.total, 0);
  const selectedPages = selectedDeliveries.reduce((a, b) => a + computeCopyPlan(b).totalPages, 0);

  return (
    <div className="page-area">
      <div className="breadcrumb">
        <a>Home</a>
        <Icon name="chevron_right" size={12} stroke="#7F8C9A" />
        <span>Billing Worklist</span>
      </div>

      <div className="page-title-row">
        <div>
          <div className="page-title">
            Billing Worklist
            <span className="th"> · ใบแจ้งหนี้รอเรียกเก็บ</span>
          </div>
          <div className="page-subtitle">
            Deliveries with completed Goods Issue, ready to be billed and submitted to iNet · {fmtThaiDate("2026-05-05")} (Today)
          </div>
        </div>
        <div className="flex items-center" style={{ gap: 8 }}>
          <button className="btn btn-tertiary btn-compact">
            <Icon name="download" size={14} /> Export
          </button>
          <button className="btn btn-secondary">
            <Icon name="refresh" size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI / Status filter strip */}
      <div className="kpi-strip">
        <div className={"kpi-card" + (filter === "all" ? " active" : "")} onClick={() => setFilter("all")}>
          <div className="kpi-label">All</div>
          <div className="kpi-val">{counts.all}</div>
          <div className="kpi-th">ทั้งหมด</div>
        </div>
        <div className={"kpi-card" + (filter === "ready" ? " active" : "")} onClick={() => setFilter("ready")}>
          <div className="kpi-label">Ready to bill</div>
          <div className="kpi-val" style={{ color: "var(--blue-h)" }}>{counts.ready}</div>
          <div className="kpi-th">พร้อมเรียกเก็บ</div>
        </div>
        <div className={"kpi-card" + (filter === "draft" ? " active" : "")} onClick={() => setFilter("draft")}>
          <div className="kpi-label">Draft</div>
          <div className="kpi-val" style={{ color: "var(--text2)" }}>{counts.draft}</div>
          <div className="kpi-th">ฉบับร่าง</div>
        </div>
        <div className={"kpi-card" + (filter === "sent" ? " active" : "")} onClick={() => setFilter("sent")}>
          <div className="kpi-label">Sent to iNet</div>
          <div className="kpi-val" style={{ color: "var(--pos-dark)" }}>{counts.sent}</div>
          <div className="kpi-th">ส่งให้ไอเน็ตแล้ว</div>
        </div>
        <div className={"kpi-card" + (filter === "error" ? " active" : "")} onClick={() => setFilter("error")}>
          <div className="kpi-label">Failed / Rejected</div>
          <div className="kpi-val" style={{ color: "var(--neg)" }}>{counts.error}</div>
          <div className="kpi-th">ผิดพลาด</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="shell-search" style={{ width: 260, height: 32 }}>
          <Icon name="search" size={14} stroke="#7F8C9A" />
          <input placeholder="Delivery, PO, customer…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-divider"></div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600 }}>Shipping point:</span>
          <select className="input" style={{ height: 30, width: 130, fontSize: 13 }} value={shipPoint} onChange={e => setShipPoint(e.target.value)}>
            <option value="ALL">All</option>
            <option value="BKK1">BKK1 — Bangkok</option>
            <option value="CMI1">CMI1 — Chiang Mai</option>
          </select>
        </div>
        <div className="flex items-center" style={{ gap: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600 }}>PGI date:</span>
          <select className="input" style={{ height: 30, width: 140, fontSize: 13 }} value={date} onChange={e => setDate(e.target.value)}>
            <option value="ALL">All dates</option>
            <option value="2026-05-04">May 04, 2026</option>
            <option value="2026-05-03">May 03, 2026</option>
            <option value="2026-05-02">May 02, 2026</option>
          </select>
        </div>
        <div className="filter-divider"></div>
        <button className="btn btn-tertiary btn-compact">
          <Icon name="filter" size={13} /> More filters
        </button>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text2)" }}>
          <strong style={{ color: "var(--text)" }}>{filtered.length}</strong> {filtered.length === 1 ? "delivery" : "deliveries"} match
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <div className="bulk-bar-left">
            <span className="bulk-count">{selected.size}</span>
            <span>selected · Total {fmtTHB(selectedTotal)} · ~{selectedPages} pages to print</span>
          </div>
          <div className="flex" style={{ gap: 8 }}>
            <button className="btn btn-secondary btn-compact" onClick={() => setSelected(new Set())}>Clear</button>
            <button className="btn btn-primary" onClick={() => onCreateBilling(selectedDeliveries)}>
              <Icon name="file" size={14} /> Create billing ({selected.size})
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="table-wrap">
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <span className="table-toolbar-title">Deliveries</span>
            <span className="table-toolbar-count">({filtered.length})</span>
          </div>
          <div className="flex" style={{ gap: 6 }}>
            <button className="btn btn-tertiary btn-compact"><Icon name="sort" size={13} /> Sort</button>
            <button className="btn btn-tertiary btn-compact"><Icon name="settings" size={13} /></button>
          </div>
        </div>
        <div className="table-scroll">
          <table className="sap-table">
            <thead>
              <tr>
                <th className="ck"><input type="checkbox" style={{ accentColor: "#0070F2" }} checked={allSelected} onChange={toggleAll} /></th>
                <th className="sortable">Delivery</th>
                <th>PGI date</th>
                <th>Sold-to</th>
                <th>Ship-to</th>
                <th>Items</th>
                <th className="num">Net</th>
                <th className="num">VAT</th>
                <th className="num">Total (THB)</th>
                <th>Copies</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={12}>
                  <div className="empty-state">
                    <div className="empty-icon"><Icon name="package" size={36} /></div>
                    <div className="empty-title">No deliveries match</div>
                    <div className="empty-body">Try adjusting filters or check the {filter === "ready" ? "Sent" : "Ready"} tab.</div>
                  </div>
                </td></tr>
              ) : visible.map(d => {
                const plan = computeCopyPlan(d);
                const billable = d.status === "ready" || d.status === "draft";
                return (
                  <tr
                    key={d.id}
                    className={"selectable" + (selected.has(d.id) ? " selected" : "")}
                    onClick={() => onOpenDetail(d)}
                  >
                    <td className="ck" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" style={{ accentColor: "#0070F2" }} checked={selected.has(d.id)} disabled={!billable} onChange={() => toggleOne(d.id)} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--blue-h)" }}>{d.delivery}</div>
                      <div style={{ fontSize: 11, color: "var(--text2)" }}>PO {d.poNumber}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      <div>{fmtEnDate(d.pgiDate)}</div>
                      <div style={{ fontSize: 11, color: "var(--text2)" }}>{d.shippingPoint}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.soldToName}</div>
                      <div style={{ fontSize: 11, color: "var(--text2)" }}>{d.soldTo}</div>
                    </td>
                    <td>
                      <div style={{ maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13 }}>{d.shipToName}</div>
                      <div style={{ fontSize: 11, color: "var(--text2)" }}>{d.shipTo}</div>
                    </td>
                    <td className="num">{d.items.length}</td>
                    <td className="num tabular">{fmtNum(d.subtotal)}</td>
                    <td className="num tabular muted" style={{ fontSize: 13 }}>{fmtNum(d.vat)}</td>
                    <td className="num tabular" style={{ fontWeight: 700 }}>{fmtNum(d.total)}</td>
                    <td>
                      <span
                        className={"copy-pill" + (plan.totalPages > 4 ? " warn" : "")}
                        title={plan.reasons.join(" · ")}
                      >
                        <Icon name="printer" size={11} /> {plan.totalPages}
                      </span>
                    </td>
                    <td>
                      {d.status === "ready" && <span className="pill pill-ready"><span className="pill-dot"></span>Ready</span>}
                      {d.status === "draft" && <span className="pill pill-draft"><span className="pill-dot"></span>Draft</span>}
                      {d.status === "sent" && d.inetStatus === "submitted" && <span className="pill pill-pending"><span className="pill-dot"></span>iNet pending</span>}
                      {d.status === "sent" && d.inetStatus === "certified" && <span className="pill pill-success"><span className="pill-dot"></span>Certified</span>}
                      {d.status === "error" && <span className="pill pill-error"><span className="pill-dot"></span>Rejected</span>}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-tertiary btn-compact row-actions"><Icon name="more" size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>{filtered.length === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)}`} of {filtered.length} items</span>
          <div className="flex items-center" style={{ gap: 4 }}>
            <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}><Icon name="chevron_left" size={12} /></button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} className={"page-btn" + (page === i + 1 ? " active" : "")} onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><Icon name="chevron_right" size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { WorklistPage, computeCopyPlan });
