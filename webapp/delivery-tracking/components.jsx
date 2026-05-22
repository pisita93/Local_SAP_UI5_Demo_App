/* global React */
// Shared atoms + chrome for Delivery Optimization & Tracking
const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ---------- Icons (lucide-style monoline) ----------
const Ico = {
  Menu:    (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Search:  (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Bell:    (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Settings:(p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Grid:    (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Truck:   (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62L18.3 8.38a1 1 0 0 0-.78-.38H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>,
  Boxes:   (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5l-5.03-3.02a2 2 0 0 0-2.06 0l-1.94 1.16Z"/><path d="M7 16.5l-4.74-2.85"/><path d="M7 16.5v5.17"/><path d="M7 16.5l5-3"/><path d="M14.97 12.92A2 2 0 0 0 14 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0Z"/><path d="M19 16.5l-5-3"/><path d="M19 16.5l5-3"/><path d="M19 16.5v5.17"/><path d="M8.97 4.42A2 2 0 0 0 8 6.13v3.24L12 11.5l4-2.13V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0Z"/><path d="M12 8L7.26 5.15"/><path d="M12 8l4.74-2.85"/></svg>,
  Chart:   (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6"  y1="20" x2="6"  y2="14"/></svg>,
  Files:   (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15.5 2H8.6c-.4 0-.8.2-1.1.5C7.2 2.8 7 3.2 7 3.6V16.4c0 .4.2.8.5 1.1.3.3.7.5 1.1.5h9.8c.4 0 .8-.2 1.1-.5.3-.3.5-.7.5-1.1V6.5L15.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M17 18v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3"/></svg>,
  Plus:    (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Refresh: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/></svg>,
  ChevR:   (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><polyline points="9 18 15 12 9 6"/></svg>,
  ChevL:   (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><polyline points="15 18 9 12 15 6"/></svg>,
  ChevD:   (p) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><polyline points="6 9 12 15 18 9"/></svg>,
  X:       (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:   (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><polyline points="20 6 9 17 4 12"/></svg>,
  Filter:  (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Sort:    (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="18" x2="13" y2="18"/></svg>,
  Download:(p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Calendar:(p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Pin:     (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  User:    (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Hash:    (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  Trash:   (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  ArrowR:  (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  ArrowL:  (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Info:    (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Eye:     (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Star:    (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Package: (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Pen:     (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>,
  Phone:   (p) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
  Cash:    (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>,
  Camera:  (p) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
};

// ---------- Status component ----------
function Status({ status, mode }) {
  const m = window.AppData.statusMeta[status];
  if (!m) return <span className="t3">{status}</span>;
  if (mode === 'dot') {
    return <span className="status-dot"><span className="dot" style={{background: m.dot}}/>{m.label}</span>;
  }
  if (mode === 'strip') {
    return <span className="status-strip" style={{borderLeftColor: m.strip, color: m.strip}}>{m.label}</span>;
  }
  return <span className="tag" style={{background: m.bg}}>{m.label}</span>;
}

// ---------- Checkbox ----------
function Cbx({ checked, indeterminate, onChange, disabled }) {
  return (
    <span
      className={`cbx ${checked ? 'checked' : ''} ${indeterminate && !checked ? 'indeterminate' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={(e) => { e.stopPropagation(); !disabled && onChange && onChange(!checked); }}
      role="checkbox"
      aria-checked={checked}
    />
  );
}

// ---------- Toast ----------
function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    window.toast = (msg, kind='success') => {
      const id = Math.random().toString(36).slice(2);
      setItems((s) => [...s, { id, msg, kind }]);
      setTimeout(() => setItems((s) => s.filter(x => x.id !== id)), 3200);
    };
  }, []);
  return (
    <>
      {items.map(t => (
        <div key={t.id} className={`toast show ${t.kind}`}>
          {t.kind === 'success' ? <Ico.Check stroke="#fff"/> : t.kind === 'error' ? <Ico.X stroke="#fff"/> : <Ico.Info stroke="#fff"/>}
          <span>{t.msg}</span>
        </div>
      ))}
    </>
  );
}

// ---------- Shell Bar ----------
function ShellBar({ onToggleNav, currentUser, users, onSwitchUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);
  const r = currentUser ? window.AppData.roles[currentUser.role] : null;

  return (
    <div className="shell-bar">
      <div className="flex items-center gap12">
        <button className="shell-btn" onClick={onToggleNav} title="Menu"><Ico.Menu/></button>
        <div className="shell-divider"/>
        <div className="shell-logo">
          <svg width="36" height="18" viewBox="0 0 54 26.713">
            <defs><linearGradient id="sg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00B8F1"/><stop offset="31%" stopColor="#0D90D9"/><stop offset="82%" stopColor="#1C65C8"/><stop offset="100%" stopColor="#1E5FBB"/></linearGradient></defs>
            <polygon points="0,26.713 27.291,26.713 54,0 0,0" fill="url(#sg)"/>
            <text x="4" y="20" fontSize="14" fontWeight="900" fill="white" fontFamily="Arial">SAP</text>
          </svg>
          <span className="shell-product">Delivery Optimization & Tracking</span>
        </div>
      </div>
      <div className="flex items-center gap4">
        <div className="search-input" style={{width:220}}>
          <Ico.Search stroke="#7F8C9A"/>
          <input placeholder="Search SO / DLV / Truck ref…"/>
        </div>
        <div className="notif-wrap">
          <button className="shell-btn" title="Notifications"><Ico.Bell/></button>
          <div className="notif-badge"></div>
        </div>
        <button className="shell-btn" title="Settings"><Ico.Settings/></button>
        <button className="shell-btn" title="Apps"><Ico.Grid/></button>
        {/* User menu */}
        <div ref={ref} style={{position:'relative', marginLeft:4}}>
          <button onClick={() => setOpen(o => !o)} style={{display:'flex', alignItems:'center', gap:8, height:36, padding:'0 8px 0 4px', borderRadius:8, border:'none', background:'transparent', cursor:'pointer'}} title="Account & role">
            <div className="avatar" style={{width:32, height:32, fontSize:12, background: r?.tone || 'var(--blue)'}}>{currentUser?.avatar || '?'}</div>
            <div style={{textAlign:'left', minWidth:0}}>
              <div className="fw700 fs12" style={{lineHeight:1.1, color:'var(--text)', whiteSpace:'nowrap'}}>{currentUser?.name || 'Guest'}</div>
              <div className="fs12" style={{lineHeight:1.1, color: r?.tone || 'var(--text2)', fontWeight:600}}>{r?.label || ''}</div>
            </div>
            <Ico.ChevD/>
          </button>
          {open && (
            <div style={{position:'absolute', right:0, top:'100%', marginTop:6, background:'var(--bg)', borderRadius:10, boxShadow:'var(--sh-pop)', width:280, zIndex:50, overflow:'hidden'}}>
              <div style={{padding:'14px 16px', background:'var(--bg-shell)', borderBottom:'1px solid var(--border2)'}}>
                <div className="flex items-center gap10">
                  <div className="avatar" style={{width:40, height:40, fontSize:14, background: r?.tone}}>{currentUser?.avatar}</div>
                  <div style={{minWidth:0}}>
                    <div className="fw700">{currentUser?.name}</div>
                    <div className="t2 fs12 num" style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{currentUser?.email}</div>
                  </div>
                </div>
              </div>
              <div style={{padding:'12px 16px 4px'}}>
                <div className="t3 fs12 fw700" style={{textTransform:'uppercase', letterSpacing:'0.06em'}}>Sign in as…</div>
                <div className="t3 fs12 mt4">Demo role switcher</div>
              </div>
              <div style={{maxHeight:260, overflowY:'auto', padding:'4px 8px 8px'}}>
                {users && users.filter(u => u.status === 'Active').map(u => {
                  const ur = window.AppData.roles[u.role];
                  const active = u.id === currentUser?.id;
                  return (
                    <div key={u.id}
                      className={`role-switcher-item ${active ? 'active' : ''}`}
                      onClick={() => { onSwitchUser(u); setOpen(false); }}>
                      <div className="avatar" style={{width:28, height:28, fontSize:11, background: ur.tone}}>{u.avatar}</div>
                      <div style={{flex:1, minWidth:0}}>
                        <div className="fs13 fw700" style={{color:'var(--text)'}}>{u.name}</div>
                        <div className="fs12" style={{color: ur.tone, fontWeight:600}}>{ur.label}</div>
                      </div>
                      {active && <Ico.Check stroke="var(--blue-h)"/>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Side Nav ----------
function SideNav({ collapsed, route, onNav, permissions = [] }) {
  const has = (p) => permissions.includes(p);
  const Item = ({id, label, Icon}) => (
    <div className={`nav-item ${route === id ? 'active' : ''}`} onClick={() => onNav(id)} title={label}>
      <Icon/>
      <span>{label}</span>
    </div>
  );
  return (
    <nav className={`side-nav ${collapsed ? 'collapsed' : ''}`}>
      <div style={{height:8}}/>
      <Item id="overview"  label="Overview"             Icon={Ico.Grid}/>
      {has('GROUPING') && <>
        <div className="nav-section-title">Plan</div>
        <Item id="grouping"  label="Group deliveries"     Icon={Ico.Truck}/>
        <Item id="groups"    label="My truck groups"      Icon={Ico.Boxes}/>
      </>}
      {has('POD_ENTRY') && <>
        <div className="nav-section-title">Capture</div>
        <Item id="podentry"  label="POD entry"            Icon={Ico.Pen}/>
        <Item id="mobile"    label="Driver mobile app"    Icon={Ico.Phone}/>
      </>}
      {has('TRACKING') && <>
        <div className="nav-section-title">Track</div>
        <Item id="status"    label="Delivery status"      Icon={Ico.Chart}/>
        <Item id="search"    label="Document search"      Icon={Ico.Files}/>
      </>}
      {has('ADMIN') && <>
        <div className="nav-section-title">Admin</div>
        <Item id="users"     label="Users & access"       Icon={Ico.User}/>
      </>}
    </nav>
  );
}

// ---------- Breadcrumb ----------
function Breadcrumb({ items }) {
  return (
    <div className="breadcrumb">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {it.onClick ? <a onClick={it.onClick}>{it.label}</a> : <span>{it.label}</span>}
          {i < items.length - 1 && <Ico.ChevR/>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ---------- Capacity bar ----------
function CapBar({ label, value, max, unit, decimals=0 }) {
  const pct = Math.min(120, Math.round((value / max) * 100));
  const cls = pct >= 100 ? 'over' : pct >= 85 ? 'warn' : '';
  const fmt = window.AppData.fmtNum;
  return (
    <div className="cap-row">
      <div className="cap-label">{label}</div>
      <div className="cap-track">
        <div className={`cap-fill ${cls}`} style={{width: Math.min(100, pct) + '%'}}/>
      </div>
      <div className="cap-val">
        <span style={{color: cls === 'over' ? 'var(--neg)' : cls === 'warn' ? '#E07A00' : 'var(--text)'}}>{fmt(value, decimals)}</span>
        <span className="t3"> / {fmt(max, decimals)} {unit}</span>
      </div>
    </div>
  );
}

// ---------- Product item table (expanded row) ----------
function ProductTable({ items, prefix='' }) {
  const P = window.AppData.products;
  const fmt = window.AppData.fmtNum;
  return (
    <table className="product-table">
      <thead>
        <tr>
          <th style={{width:'18%'}}>{prefix}Item</th>
          <th>Description</th>
          <th style={{width:'10%', textAlign:'right'}}>Qty</th>
          <th style={{width:'8%'}}>UoM</th>
          <th style={{width:'14%', textAlign:'right'}}>Weight (kg)</th>
          <th style={{width:'14%', textAlign:'right'}}>Volume (m³)</th>
        </tr>
      </thead>
      <tbody>
        {items.map((it, i) => {
          const p = P[it.sku];
          return (
            <tr key={i}>
              <td><span className="num">{p.sku}</span></td>
              <td>{p.name}</td>
              <td className="num text-right">{fmt(it.qty)}</td>
              <td className="t2">{p.uom}</td>
              <td className="num text-right">{fmt(p.wPerU * it.qty, 1)}</td>
              <td className="num text-right">{fmt(p.vPerU * it.qty, 2)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ---------- Confirm dialog (small) ----------
function ConfirmDialog({ open, title, body, confirmLabel, confirmKind='primary', onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="dialog-title">{title}</div>
          <button className="icon-btn" onClick={onCancel}><Ico.X/></button>
        </div>
        <div className="dialog-body">{body}</div>
        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className={`btn btn-${confirmKind}`} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// expose
Object.assign(window, { Ico, Status, Cbx, ToastHost, ShellBar, SideNav, Breadcrumb, CapBar, ProductTable, ConfirmDialog });
