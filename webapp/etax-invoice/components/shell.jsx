// Shell Bar + Side Nav for E-Tax Invoice Portal

const ShellBar = ({ onToggleNav }) => (
  <div className="shell-bar" style={{ padding: "0 16px" }}>
    <div className="flex items-center" style={{ gap: 12 }}>
      <button className="shell-btn" onClick={onToggleNav} title="Menu">
        <Icon name="menu" size={18} />
      </button>
      <div className="shell-divider"></div>
      <div className="shell-logo">
        <SapMark />
        <span className="shell-product">E-Tax Invoice Portal</span>
        <span style={{ fontSize: 11, color: "var(--text2)", padding: "2px 6px", background: "var(--bg-shell)", borderRadius: 4, fontWeight: 600, marginLeft: 4 }}>SD · Billing</span>
      </div>
    </div>
    <div className="flex items-center" style={{ gap: 4 }}>
      <div className="shell-search">
        <Icon name="search" size={14} stroke="#7F8C9A" />
        <input placeholder="Search delivery, billing doc, customer…" />
      </div>
      <div className="notif-wrap">
        <button className="shell-btn" title="Notifications" aria-label="Notifications" onClick={() => alert('Notifications — demo only')}>
          <Icon name="bell" size={18} />
        </button>
        <div className="notif-badge">3</div>
      </div>
      <button className="shell-btn" title="Settings" aria-label="Settings" onClick={() => alert('Settings — demo only')}>
        <Icon name="settings" size={18} />
      </button>
      <button className="shell-btn" title="Apps" aria-label="Apps launcher" onClick={() => alert('Apps launcher — demo only')}>
        <Icon name="apps" size={18} />
      </button>
      <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, marginLeft: 4 }}>SN</div>
    </div>
  </div>
);

const SideNav = ({ collapsed, page, onNav, counts }) => {
  const item = (id, icon, label, count) => (
    <div className={"nav-item" + (page === id ? " active" : "")} onClick={() => onNav(id)} key={id}>
      <Icon name={icon} size={18} />
      <span>{label}</span>
      {count != null && <span className="nav-count">{count}</span>}
    </div>
  );
  return (
    <nav className={"side-nav" + (collapsed ? " collapsed" : "")}>
      <div style={{ height: 8 }}></div>
      {item("worklist", "list", "Billing Worklist", counts.ready)}
      {item("history", "history", "Billing History", null)}
      <div className="nav-section-title">Master Data</div>
      {item("soldto", "users", "Sold-to Settings", null)}
      {item("shipto", "map", "Ship-to Settings", null)}
      <div className="nav-section-title">Admin</div>
      {item("inet", "send", "iNet Connection", null)}
    </nav>
  );
};

Object.assign(window, { ShellBar, SideNav });
