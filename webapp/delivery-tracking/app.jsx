/* global React, ReactDOM, AppData, Overview, GroupingScreen, StatusReport, DocumentSearch, GroupsList, DeliveryDetailDrawer, ShellBar, SideNav, ToastHost, Breadcrumb, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect, Ico, PODEntryWeb, PODEntryList, MobilePreview, PODEvidenceViewer, UsersAdmin, AccessDeniedPage */
const { useState, useEffect, useMemo, useRef } = React;

// Editable defaults
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "cozy",
  "statusMode": "tag"
}/*EDITMODE-END*/;

// Permission required to view each route. Routes not listed are public.
const ROUTE_PERM = {
  grouping:  'GROUPING',
  groups:    'GROUPING',
  podentry:  'POD_ENTRY',
  mobile:    'POD_ENTRY',
  status:    'TRACKING',
  search:    'TRACKING',
  users:     'ADMIN',
};

// Default landing page per role
const ROLE_HOME = {
  'Admin':       'overview',
  'Sales Admin': 'overview',
  'Driver':      'mobile',
  'Finance AR':  'status',
  'Finance AP':  'status',
};

function App() {
  const [route, setRoute] = useState('overview');
  const [navCollapsed, setNavCollapsed] = useState(false);

  const [deliveries, setDeliveries] = useState(() => AppData.deliveries.map(d => ({...d})));
  const [groups, setGroups] = useState(() => ({...AppData.groups}));
  const [users, setUsers] = useState(() => AppData.users.map(u => ({...u})));

  // Current user — default to IT Admin so all menus are visible at startup
  const [currentUserId, setCurrentUserId] = useState('U009');
  const currentUser = useMemo(() => users.find(u => u.id === currentUserId) || users[0], [users, currentUserId]);
  const permissions = useMemo(() => AppData.roles[currentUser.role]?.permissions || [], [currentUser]);

  const [detail, setDetail] = useState(null);
  const [confirmGen, setConfirmGen] = useState(null);
  const [postGenRef, setPostGenRef] = useState(null);
  const [podDeliveryId, setPodDeliveryId] = useState(null);
  const [evidenceView, setEvidenceView] = useState(null);

  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffect(() => { document.body.setAttribute('data-density', t.density); }, [t.density]);

  function goto(r) {
    setRoute(r);
    setPostGenRef(null);
    if (r !== 'podentry') setPodDeliveryId(null);
  }

  function switchUser(u) {
    setCurrentUserId(u.id);
    // If current route requires a permission the new user lacks, send them to their home
    const need = ROUTE_PERM[route];
    const newPerms = AppData.roles[u.role]?.permissions || [];
    if (need && !newPerms.includes(need)) {
      setRoute(ROLE_HOME[u.role] || 'overview');
      setPodDeliveryId(null);
    }
    window.toast(`Signed in as ${u.name} — ${AppData.roles[u.role].label}`, 'success');
  }

  function openPOD(d) {
    setDetail(null);
    setPodDeliveryId(d.id);
    setRoute('podentry');
  }

  function viewEvidence(d) {
    setDetail(null);
    setEvidenceView(d);
  }

  function submitPOD(deliveryId, payload) {
    setDeliveries(ds => ds.map(d => d.id === deliveryId ? {
      ...d,
      status: payload.status,
      podDate: payload.podDate,
      rejectReason: payload.rejectReason || d.rejectReason,
      pod: { ...payload },
    } : d));
    const verb = payload.status === 'POD Reject' ? 'recorded with reject' : 'completed';
    window.toast(`POD for ${deliveryId} ${verb}`, payload.status === 'POD Reject' ? 'error' : 'success');
  }

  function onGenerated(payload) { setConfirmGen(payload); }

  function commitGroup() {
    const { ref, deliveryIds, driverId, plate, totals } = confirmGen;
    setDeliveries(ds => ds.map(d => deliveryIds.includes(d.id)
      ? { ...d, group: ref, status: 'PGI', pgiDate: new Date().toISOString().slice(0, 10) }
      : d
    ));
    setGroups(gs => ({ ...gs, [ref]: { ref, driver: driverId, plate, createdOn: new Date().toISOString().slice(0, 10) } }));
    setConfirmGen(null);
    setPostGenRef({ ref, count: deliveryIds.length, totals });
    window.toast(`Truck reference ${ref} generated and written to ${deliveryIds.length} delivery documents`, 'success');
    setRoute('groups');
  }

  const customers = AppData.customers;
  const drivers = AppData.drivers;
  const truckSpec = AppData.truckSpec;

  // Route guard
  const need = ROUTE_PERM[route];
  const denied = need && !permissions.includes(need);

  return (
    <React.Fragment>
      <ShellBar
        onToggleNav={() => setNavCollapsed(v => !v)}
        currentUser={currentUser}
        users={users}
        onSwitchUser={switchUser}
      />
      <div className="app-layout">
        <SideNav collapsed={navCollapsed} route={route} onNav={goto} permissions={permissions} />
        <div className="main-content">

          {denied && (
            <div className="page-area">
              <AccessDeniedPage route={route} user={currentUser} onGoHome={() => goto(ROLE_HOME[currentUser.role] || 'overview')}/>
            </div>
          )}

          {!denied && route === 'overview' && (
            <div className="page-area">
              <Breadcrumb items={[{label:'Home'}, {label:'Overview'}]}/>
              <Overview deliveries={deliveries} customers={customers} groups={groups} statusMode={t.statusMode} onGoto={goto}/>
            </div>
          )}

          {!denied && route === 'grouping' && (
            <React.Fragment>
              <div style={{padding:'16px 24px 0'}}>
                <Breadcrumb items={[{label:'Home', onClick:() => goto('overview')}, {label:'Plan', onClick:() => goto('grouping')}, {label:'Group deliveries'}]}/>
              </div>
              <GroupingScreen
                deliveries={deliveries}
                customers={customers}
                truckSpec={truckSpec}
                drivers={drivers}
                statusMode={t.statusMode}
                density={t.density}
                onGenerated={onGenerated}
                onCancel={() => goto('overview')}
              />
            </React.Fragment>
          )}

          {!denied && route === 'groups' && (
            <div className="page-area">
              <Breadcrumb items={[{label:'Home', onClick:() => goto('overview')}, {label:'Plan'}, {label:'My truck groups'}]}/>
              {postGenRef && (
                <PostGenBanner ref0={postGenRef.ref} count={postGenRef.count} totals={postGenRef.totals} onDismiss={() => setPostGenRef(null)}/>
              )}
              <GroupsList
                deliveries={deliveries}
                customers={customers}
                groups={groups}
                drivers={drivers}
                statusMode={t.statusMode}
                onOpenDetail={setDetail}
                onGoto={goto}
              />
            </div>
          )}

          {!denied && route === 'status' && (
            <div className="page-area">
              <Breadcrumb items={[{label:'Home', onClick:() => goto('overview')}, {label:'Track'}, {label:'Delivery status'}]}/>
              <StatusReport
                deliveries={deliveries}
                customers={customers}
                groups={groups}
                drivers={drivers}
                statusMode={t.statusMode}
                onOpenDetail={setDetail}
                onViewEvidence={setEvidenceView}
              />
            </div>
          )}

          {!denied && route === 'search' && (
            <div className="page-area">
              <Breadcrumb items={[{label:'Home', onClick:() => goto('overview')}, {label:'Track'}, {label:'Document search'}]}/>
              <DocumentSearch
                deliveries={deliveries}
                customers={customers}
                groups={groups}
                drivers={drivers}
                statusMode={t.statusMode}
                onOpenDetail={setDetail}
              />
            </div>
          )}

          {!denied && route === 'podentry' && (
            <div className="page-area">
              <Breadcrumb items={[
                {label:'Home', onClick:() => goto('overview')},
                {label:'Capture'},
                podDeliveryId ? {label:'POD entry', onClick:() => setPodDeliveryId(null)} : {label:'POD entry'},
                ...(podDeliveryId ? [{label: podDeliveryId}] : []),
              ]}/>
              {podDeliveryId ? (
                <PODEntryWeb
                  delivery={deliveries.find(x => x.id === podDeliveryId)}
                  customers={customers}
                  drivers={drivers}
                  groups={groups}
                  onSubmit={(payload) => { submitPOD(podDeliveryId, payload); setPodDeliveryId(null); setRoute('status'); }}
                  onCancel={() => setPodDeliveryId(null)}
                />
              ) : (
                <PODEntryList
                  deliveries={deliveries}
                  customers={customers}
                  groups={groups}
                  drivers={drivers}
                  statusMode={t.statusMode}
                  onPick={(d) => setPodDeliveryId(d.id)}
                />
              )}
            </div>
          )}

          {!denied && route === 'mobile' && (
            <div className="page-area">
              <Breadcrumb items={[{label:'Home', onClick:() => goto('overview')}, {label:'Capture'}, {label:'Driver mobile app'}]}/>
              <MobilePreview deliveries={deliveries} customers={customers} groups={groups} drivers={drivers} onSubmitPOD={submitPOD}/>
            </div>
          )}

          {!denied && route === 'users' && (
            <div className="page-area">
              <Breadcrumb items={[{label:'Home', onClick:() => goto('overview')}, {label:'Admin'}, {label:'Users & access'}]}/>
              <UsersAdmin users={users} onChange={setUsers}/>
            </div>
          )}
        </div>
      </div>

      {detail && (
        <DeliveryDetailDrawer
          delivery={detail}
          customers={customers}
          drivers={drivers}
          groups={groups}
          statusMode={t.statusMode}
          onClose={() => setDetail(null)}
          onCapturePOD={permissions.includes('POD_ENTRY') ? openPOD : null}
          onViewEvidence={viewEvidence}
        />
      )}

      {evidenceView && (
        <PODEvidenceViewer
          delivery={deliveries.find(d => d.id === evidenceView.id) || evidenceView}
          customers={customers}
          drivers={drivers}
          groups={groups}
          onClose={() => setEvidenceView(null)}
        />
      )}

      {/* Final confirm dialog before writing back */}
      {confirmGen && (
        <div className="dialog-overlay" onClick={() => setConfirmGen(null)}>
          <div className="dialog lg" onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <div className="dialog-title">Generate truck reference & write back</div>
              <button className="icon-btn" onClick={() => setConfirmGen(null)}><Ico.X/></button>
            </div>
            <div className="dialog-body">
              <div className="truck-illus mb16">
                <svg width="180" height="100" viewBox="0 0 180 100" fill="none">
                  <rect x="6" y="30" width="90" height="50" rx="4" fill="#fff" stroke="#0064D9" strokeWidth="2"/>
                  <rect x="14" y="38" width="74" height="34" rx="2" fill="#EDF6FF"/>
                  <path d="M96 44 L130 44 L150 60 L150 80 L96 80 Z" fill="#fff" stroke="#0064D9" strokeWidth="2"/>
                  <rect x="106" y="50" width="26" height="14" rx="1" fill="#EDF6FF"/>
                  <circle cx="36" cy="84" r="9" fill="#1D2D3E"/><circle cx="36" cy="84" r="4" fill="#F5F6F7"/>
                  <circle cx="120" cy="84" r="9" fill="#1D2D3E"/><circle cx="120" cy="84" r="4" fill="#F5F6F7"/>
                </svg>
              </div>
              <div className="text-center">
                <div className="t3 fs12 fw700" style={{textTransform:'uppercase', letterSpacing:'0.06em'}}>Reference to be generated</div>
                <div className="ref-pill mt8"><Ico.Check stroke="#25713A"/> {confirmGen.ref}</div>
                <div className="t2 fs13 mt12">{confirmGen.deliveryIds.length} deliveries · {AppData.fmtNum(confirmGen.totals.weight, 1)} kg · {confirmGen.totals.pallets} pallets</div>
                <div className="t3 fs12 mt4">Driver: {drivers.find(x => x.id === confirmGen.driverId).name} · Plate <span className="num">{confirmGen.plate}</span></div>
              </div>
              <div className="msg-strip msg-info mt16">
                <Ico.Info stroke="#0064D9"/>
                <div>The reference will be written back as a custom field on each delivery document. Status moves to <strong>PGI</strong> once written.</div>
              </div>
            </div>
            <div className="dialog-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmGen(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={commitGroup}><Ico.Check/> Confirm & write back</button>
            </div>
          </div>
        </div>
      )}

      <ToastHost/>

      <TweaksPanel title="Tweaks" defaultOpen={false} initialPos={{ right: 24, top: 80 }}>
        <TweakSection title="Density">
          <TweakRadio value={t.density} onChange={v => setTweak('density', v)} options={[
            { value: 'cozy',    label: 'Cozy' },
            { value: 'compact', label: 'Compact' },
          ]}/>
        </TweakSection>
        <TweakSection title="Status treatment" subtitle="How delivery statuses appear across tables and lists.">
          <TweakRadio value={t.statusMode} onChange={v => setTweak('statusMode', v)} options={[
            { value: 'tag',   label: 'Tag' },
            { value: 'dot',   label: 'Dot' },
            { value: 'strip', label: 'Strip' },
          ]}/>
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

function PostGenBanner({ ref0, count, totals, onDismiss }) {
  return (
    <div className="card mb20" style={{boxShadow:'var(--sh0)'}}>
      <div style={{padding:'16px 20px', display:'flex', gap:16, alignItems:'center', background:'linear-gradient(90deg, var(--pos-bg) 0%, #EDFAF3 60%, #fff 100%)', borderLeft: '4px solid var(--pos)'}}>
        <div style={{width:44, height:44, borderRadius:'50%', background:'#fff', border:'2px solid var(--pos)', display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
          <Ico.Check stroke="var(--pos-dark)" width="20" height="20"/>
        </div>
        <div style={{flex:1}}>
          <div className="fw700 fs16" style={{color:'var(--pos-dark)'}}>Truck reference <span className="num">{ref0}</span> generated</div>
          <div className="t2 fs13 mt4">
            Written back to {count} delivery documents · {AppData.fmtNum(totals.weight, 1)} kg total · {totals.pallets} pallets · status moved to <strong>PGI</strong>.
          </div>
        </div>
        <button className="icon-btn" onClick={onDismiss}><Ico.X/></button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
