/* ──────────────────────────────────────────────────────────────
 * Sales BKK Payment Settlement — App root
 * Routing, mutable billings state, status state machine, tweaks
 * ────────────────────────────────────────────────────────────── */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "cozy",
  "statusPalette": "fiori",
  "reportView": "tree"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // role: admin (Sales) | cashier | sysadmin (system Admin)
  const [role, setRole] = React.useState("admin");

  // access control matrix — mutable; managed from sysadmin tab
  const [perms, setPerms] = React.useState(DEFAULT_PERMS);

  // billings state — derived from data.jsx BILLINGS; mutable for status flow
  const [billings, setBillings] = React.useState(() => BILLINGS.map(b => ({ ...b })));

  // page state per role
  const [page, setPage] = React.useState("report");            // admin pages
  const [cashierPage, setCashierPage] = React.useState("review"); // cashier pages
  const [sysadminPage, setSysadminPage] = React.useState("perms");// sysadmin pages
  const [drillTruck, setDrillTruck] = React.useState(null);

  // filters
  const [adminFilters, setAdminFilters]   = React.useState({ date: TODAY, truck: "", route: "", customer: "", payment: "", status: "" });
  const [cashierFilters, setCashierFilters] = React.useState({ date: TODAY, truck: "", route: "", customer: "", payment: "", status: "" });

  // toasts
  const [toast, setToast] = React.useState(null);
  const flash = (msg, kind = "info") => setToast({ msg, kind });

  // ── Status state machine ─────────────────────────────────────
  const mutate = (matches, nextStatus, extra = {}) =>
    setBillings(prev => prev.map(b => matches.includes(b.billing) ? { ...b, status: nextStatus, ...extra } : b));

  const submitToCashier = (selected, note) => {
    const ids = Array.isArray(selected) ? selected : selected.map(b => b.billing);
    setBillings(prev => prev.map(b => ids.includes(b.billing)
      ? { ...b, status: "submitted", submitNote: note, rejectReason: null }
      : b));
    flash(`Submitted ${ids.length} billing${ids.length > 1 ? "s" : ""} to cashier · ${note ? "with note" : "no note"}`, "success");
  };

  const markUnderReview = (id) => {
    setBillings(prev => prev.map(b => b.billing === id && b.status === "submitted" ? { ...b, status: "review" } : b));
  };
  // expose for useEffect inside cashier
  React.useEffect(() => { window.__markUnderReview = markUnderReview; }, []);

  const approveBilling = (id) => {
    mutate([id], "settled");
    flash(`Billing ${id} approved · ready for SAP posting`, "success");
  };
  const rejectBilling = (id, reason) => {
    setBillings(prev => prev.map(b => b.billing === id ? { ...b, status: "rejected", rejectReason: reason } : b));
    flash(`Billing ${id} rejected · returned for rework`, "warn");
  };
  const settleTruck = (truckNo) => {
    setBillings(prev => prev.map(b => (b.truck === truckNo && b.status === "settled")
      ? { ...b, status: "closed", postedAt: "16 May 2026 15:42" }
      : b));
    flash(`Truck ${truckNo} settled · SAP posting complete. Documents marked Closed.`, "success");
    // also: any rejected go to rework
    setTimeout(() => {
      setBillings(prev => prev.map(b => (b.truck === truckNo && b.status === "rejected")
        ? { ...b, status: "rework" } : b));
    }, 300);
  };

  // ── Compute KPIs for side nav badges ─────────────────────────
  const kpis = React.useMemo(() => {
    const k = { count: billings.length, pendingReview: 0, rework: 0, closed: 0, settled: 0 };
    billings.forEach(b => {
      if (b.status === "submitted" || b.status === "review") k.pendingReview++;
      if (b.status === "rework")    k.rework++;
      if (b.status === "closed")    k.closed++;
      if (b.status === "settled")   k.settled++;
    });
    return k;
  }, [billings]);

  // ── Body density on document for global effect ───────────────
  React.useEffect(() => {
    document.body.dataset.density = t.density;
  }, [t.density]);

  // Role change resets drill
  React.useEffect(() => { setDrillTruck(null); }, [role]);

  // ── Render ───────────────────────────────────────────────────
  const onOpenTruck = (truckNo) => setDrillTruck(truckNo);
  const onBackFromTruck = () => setDrillTruck(null);

  const adminView = drillTruck
    ? <AdminTruckDetail truckNo={drillTruck} billings={billings} onBack={onBackFromTruck}
                        onSubmit={(ids, note) => { submitToCashier(ids, note); setDrillTruck(null); }}
                        onEdit={() => flash("Edit billing — opens line-item editor (not in this prototype)", "info")}
                        density={t.density} palette={t.statusPalette}/>
    : (page === "rework" || page === "settled")
      ? <StatusFilteredPage status={page} billings={billings}
                            density={t.density} palette={t.statusPalette}
                            onOpenTruck={onOpenTruck}/>
      : <AdminReport billings={billings} filters={adminFilters} setFilters={setAdminFilters}
                      density={t.density} palette={t.statusPalette}
                      view={t.reportView} setView={(v) => setTweak("reportView", v)}
                      onOpenTruck={onOpenTruck}
                      onSubmitDrafts={(drafts) => submitToCashier(drafts.map(b => b.billing), "Submitted from daily report")}/>;

  const cashierView = drillTruck
    ? <CashierReview truckNo={drillTruck} billings={billings} onBack={onBackFromTruck}
                     onApprove={approveBilling} onReject={rejectBilling}
                     onSettleTruck={settleTruck}
                     density={t.density} palette={t.statusPalette}/>
    : <CashierQueue billings={billings} filters={cashierFilters} setFilters={setCashierFilters}
                    density={t.density} palette={t.statusPalette}
                    onOpenTruck={onOpenTruck}/>;

  const sysadminView = <AdminHome page={sysadminPage} perms={perms} setPerms={setPerms} density={t.density}/>;

  const currentView = role === "sysadmin" ? sysadminView
                    : role === "cashier"  ? cashierView
                    :                       adminView;
  const currentPage = role === "sysadmin" ? sysadminPage
                    : role === "cashier"  ? cashierPage
                    :                       page;
  const setCurrentPage = (k) => {
    if (role === "sysadmin") setSysadminPage(k);
    else if (role === "cashier") setCashierPage(k);
    else setPage(k);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-shell)" }}>
      <ShellBar role={role} onRoleChange={(r) => { setRole(r); setDrillTruck(null); }}
                badge={role === "cashier" ? kpis.pendingReview : role === "admin" ? kpis.rework : 0}/>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <SideNav role={role} page={currentPage} onNav={setCurrentPage} kpis={kpis} perms={perms}/>
        <main style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>
          {currentView}
        </main>
      </div>

      <Toast {...(toast || {})} onClose={() => setToast(null)}/>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Density">
          <TweakRadio label="Row density" value={t.density}
                      options={[{ value: "compact", label: "Compact" }, { value: "cozy", label: "Cozy" }]}
                      onChange={v => setTweak("density", v)}/>
        </TweakSection>
        <TweakSection label="Status palette">
          <TweakRadio label="Style" value={t.statusPalette}
                      options={[
                        { value: "fiori",  label: "Fiori" },
                        { value: "vivid",  label: "Vivid" },
                        { value: "subtle", label: "Subtle" },
                      ]}
                      onChange={v => setTweak("statusPalette", v)}/>
        </TweakSection>
        <TweakSection label="Main report layout">
          <TweakSelect label="Variation" value={t.reportView}
                       options={[
                         { value: "tree",  label: "V1 · Tree table" },
                         { value: "kpi",   label: "V2 · KPI dashboard + flat" },
                         { value: "cards", label: "V3 · Customer cards" },
                       ]}
                       onChange={v => setTweak("reportView", v)}/>
        </TweakSection>
        <TweakSection label="Demo">
          <TweakButton label="Reset all billings to original status"
                       onClick={() => { setBillings(BILLINGS.map(b => ({ ...b }))); flash("All billings reset to original demo state", "info"); }}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
