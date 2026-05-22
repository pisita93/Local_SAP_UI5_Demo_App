/* ──────────────────────────────────────────────────────────────
 * Shared components for the Sales BKK Payment Settlement app
 * ────────────────────────────────────────────────────────────── */

// ── Lucide-style line icons (inline SVG) ──────────────────────
const Icon = ({ name, size = 16, color = "currentColor", style }) => {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", style };
  const P = {
    search:    <><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></>,
    filter:    <path d="M3 5h18l-7 9v6l-4-2v-4z"/>,
    bell:      <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
    user:      <><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></>,
    grid:      <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
    home:      <><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></>,
    chevDown:  <path d="m6 9 6 6 6-6"/>,
    chevRight: <path d="m9 6 6 6-6 6"/>,
    chevLeft:  <path d="m15 6-6 6 6 6"/>,
    check:     <path d="m5 12 5 5 9-12"/>,
    x:         <><path d="M6 6l12 12"/><path d="M18 6 6 18"/></>,
    plus:      <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    truck:     <><path d="M1 6h14v10H1z"/><path d="M15 9h4l3 4v3h-7"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
    cash:      <><rect x="2" y="6" width="20" height="12" rx="1"/><circle cx="12" cy="12" r="3"/><path d="M6 9v6M18 9v6"/></>,
    receipt:   <><path d="M5 3h14v18l-2-2-2 2-2-2-2 2-2-2-2 2-2-2z"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    download:  <><path d="M12 4v12"/><path d="m6 10 6 6 6-6"/><path d="M4 20h16"/></>,
    refresh:   <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></>,
    eye:       <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></>,
    edit:      <><path d="M4 20h4l11-11-4-4L4 16z"/><path d="m13 5 4 4"/></>,
    send:      <><path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    calendar:  <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
    package:   <><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></>,
    pin:       <><path d="M12 2v6"/><circle cx="12" cy="12" r="4"/><path d="M12 16v6"/></>,
    alert:     <><circle cx="12" cy="12" r="10"/><path d="M12 8v5M12 16.5v.1"/></>,
    info:      <><circle cx="12" cy="12" r="10"/><path d="M12 11v6M12 7.5v.1"/></>,
    chart:     <><path d="M3 3v18h18"/><path d="m7 14 4-4 4 4 5-7"/></>,
    file:      <><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/></>,
    route:     <><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M6 8v6a4 4 0 0 0 4 4h6"/></>,
    list:      <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    shield:    <><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/></>,
    users:     <><circle cx="9" cy="8" r="3.5"/><path d="M2 20c.8-3 3.5-5 7-5s6.2 2 7 5"/><circle cx="17" cy="7" r="3"/><path d="M15.5 14.5c2.7.4 5 2 5.5 4.5"/></>,
    lock:      <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 1 1 8 0v4"/></>,
  };
  return <svg {...props}>{P[name]}</svg>;
};

// ── Status tag (palette-aware) ────────────────────────────────
const StatusTag = ({ status, palette = "fiori", size = "md" }) => {
  const s = STATUS[status] || STATUS.draft;
  const p = (STATUS_PALETTES[palette] || STATUS_PALETTES.fiori)[status] || {};
  const sizes = {
    sm: { h: 18, fs: 11, px: 6, gap: 4, dot: 6 },
    md: { h: 22, fs: 12, px: 8, gap: 6, dot: 7 },
    lg: { h: 26, fs: 13, px: 10, gap: 7, dot: 8 },
  }[size];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: sizes.gap,
      height: sizes.h, padding: `0 ${sizes.px}px`,
      background: p.bg, color: p.fg, fontSize: sizes.fs, fontWeight: 600,
      borderRadius: 4, border: p.border ? `1px solid ${p.border}` : "1px solid transparent",
      whiteSpace: "nowrap",
    }}>
      <i style={{
        width: sizes.dot, height: sizes.dot, borderRadius: "50%",
        background: p.dot, flexShrink: 0,
      }} />
      {s.short}
    </span>
  );
};

// ── Payment type tag (Credit/Cash/Bank) ───────────────────────
const PaymentTag = ({ type }) => {
  const t = PAYMENT_TYPES.find(p => p.key === type) || PAYMENT_TYPES[0];
  const palette = {
    credit: { bg: "#D1EFFF", fg: "#0064D9" },
    cash:   { bg: "#C2FCEE", fg: "#25713A" },
    bank:   { bg: "#DDC4F0", fg: "#5C2E8E" },
  }[type] || {};
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      height: 20, padding: "0 8px",
      background: palette.bg, color: palette.fg,
      fontSize: 11, fontWeight: 700, borderRadius: 4,
    }}>{t.label}</span>
  );
};

// ── Shell Bar ─────────────────────────────────────────────────
const ShellBar = ({ role, onRoleChange, onSearch, badge }) => (
  <div className="shell-bar" style={{
    padding: "0 24px", background: "var(--bg)", height: 52,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "1px solid var(--border2)", position: "sticky", top: 0, zIndex: 10,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <button style={{ background: "transparent", border: 0, cursor: "pointer", padding: 6, display: "flex", color: "var(--text2)" }}>
        <Icon name="grid" size={18}/>
      </button>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span className="shell-product" style={{ fontWeight: 700 }}>Sales BKK</span>
        <span style={{ fontSize: 13, color: "var(--text2)" }}>Payment Settlement</span>
      </div>
    </div>
    <div style={{ flex: 1, maxWidth: 460, margin: "0 32px" }}>
      <div style={{ position: "relative" }}>
        <Icon name="search" size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text2)" }}/>
        <input className="input" placeholder="Search trucks, billings, customers…"
               style={{ height: 32, paddingLeft: 32, fontSize: 13, background: "var(--bg-shell)", border: "1px solid transparent" }}
               onChange={e => onSearch?.(e.target.value)}/>
      </div>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <RoleSwitcher role={role} onChange={onRoleChange}/>
      <button style={iconBtn}>
        <Icon name="settings" size={16}/>
      </button>
      <button style={iconBtn}>
        <Icon name="bell" size={16}/>
        {badge > 0 && <i style={{
          position: "absolute", top: 4, right: 4, minWidth: 16, height: 16,
          padding: "0 4px", borderRadius: 8, background: "var(--neg)", color: "#fff",
          fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
        }}>{badge}</i>}
      </button>
      <div style={{ width: 1, height: 24, background: "var(--border2)", margin: "0 6px" }}/>
      <Avatar name={role === "sysadmin" ? "วรเดช" : role === "cashier" ? "ปริยากร" : "ณัฐพล"}
              en={role === "sysadmin" ? "Woradet A." : role === "cashier" ? "Priyakorn N." : "Natthapon S."}/>
    </div>
  </div>
);

const iconBtn = {
  width: 32, height: 32, borderRadius: 8, border: 0, background: "transparent",
  cursor: "pointer", color: "var(--text2)", display: "flex", alignItems: "center",
  justifyContent: "center", position: "relative",
};

const RoleSwitcher = ({ role, onChange }) => (
  <div style={{
    display: "flex", padding: 2, borderRadius: 8, background: "var(--bg-shell)",
    border: "1px solid var(--border2)",
  }}>
    {[
      { v: "admin",   label: "Sales admin" },
      { v: "cashier", label: "Cashier"     },
      { v: "sysadmin",label: "Admin"       },
    ].map(o => (
      <button key={o.v} onClick={() => onChange(o.v)} style={{
        height: 26, padding: "0 12px", borderRadius: 6, border: 0,
        background: role === o.v ? "var(--bg)" : "transparent",
        color: role === o.v ? "var(--text)" : "var(--text2)",
        fontWeight: role === o.v ? 700 : 500, fontSize: 12, cursor: "pointer",
        boxShadow: role === o.v ? "0 1px 2px rgba(0,0,0,.1)" : "none",
        fontFamily: "inherit",
      }}>{o.label}</button>
    ))}
  </div>
);

const Avatar = ({ name, en, size = 32 }) => {
  const initials = (en || "").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div title={`${name} (${en})`} style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #0070F2, #5128A6)",
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  );
};

// ── Side Navigation (dark Fiori variant) ──────────────────────
const SideNav = ({ role, page, onNav, kpis, perms }) => {
  const can = (k) => !perms || !perms[k] || perms[k][roleToPermRole(role)];
  let items;
  if (role === "sysadmin") {
    items = [
      { k: "perms",  label: "Access permissions", icon: "shield" },
      { k: "users",  label: "Users",              icon: "users"  },
      { k: "audit",  label: "Audit log",          icon: "file"   },
    ];
  } else if (role === "admin") {
    items = [
      can("p.report.view")   && { k: "report",   label: "Daily report",       icon: "list",    count: kpis.count },
      can("p.submit.rework") && { k: "rework",   label: "Rework queue",       icon: "alert",   count: kpis.rework, accent: "var(--warn)" },
      can("p.report.view")   && { k: "trucks",   label: "Trucks",             icon: "truck"  },
      can("p.report.view")   && { k: "customers",label: "Customers",          icon: "user"   },
      can("p.report.view")   && { k: "settled",  label: "Settled",            icon: "check",   count: kpis.settled },
    ].filter(Boolean);
  } else {
    items = [
      can("p.review.queue") && { k: "review",   label: "Review queue",       icon: "list",    count: kpis.pendingReview, accent: "var(--warn)" },
      can("p.report.view")  && { k: "report",   label: "Daily report",       icon: "list",    count: kpis.count },
      can("p.settle.truck") && { k: "settled",  label: "Settled today",      icon: "check",   count: kpis.settled },
      can("p.report.view")  && { k: "closed",   label: "Closed (posted)",    icon: "file",    count: kpis.closed },
      can("p.report.view")  && { k: "reports",  label: "Reports",            icon: "chart"  },
    ].filter(Boolean);
  }
  const sectionTitle = role === "sysadmin" ? "System administration"
                     : role === "admin"    ? "Sales operations"
                     :                       "Cashier desk";
  return (
    <aside style={{
      width: 220, background: "var(--dark-nav)", padding: "12px 8px",
      display: "flex", flexDirection: "column", gap: 2, flexShrink: 0, height: "100%",
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.4)",
        textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 12px 6px",
      }}>{sectionTitle}</div>
      {items.map(it => (
        <button key={it.k} onClick={() => onNav(it.k)} style={{
          height: 38, display: "flex", alignItems: "center", gap: 10,
          padding: "0 12px", borderRadius: 8,
          background: page === it.k ? "var(--blue)" : "transparent",
          color: page === it.k ? "#fff" : "rgba(255,255,255,.78)",
          border: 0, cursor: "pointer", fontSize: 13, fontWeight: page === it.k ? 700 : 500,
          fontFamily: "inherit", textAlign: "left", justifyContent: "space-between",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icon name={it.icon} size={16}/>
            {it.label}
          </span>
          {it.count > 0 && (
            <span style={{
              minWidth: 22, padding: "0 6px", height: 18, borderRadius: 9,
              background: page === it.k ? "rgba(255,255,255,.25)" : (it.accent || "rgba(255,255,255,.15)"),
              color: "#fff", fontSize: 11, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>{it.count}</span>
          )}
        </button>
      ))}
      <div style={{ marginTop: "auto", padding: 8, color: "rgba(255,255,255,.4)", fontSize: 11 }}>
        <div>Date · {TODAY}</div>
        <div style={{ marginTop: 4 }}>v 2.4.1 · BTP</div>
      </div>
    </aside>
  );
};

// role keys used in app vs in permission objects differ slightly
function roleToPermRole(role) {
  if (role === "admin")    return "sales";   // 'admin' role tab = Sales admin
  if (role === "cashier")  return "cashier";
  if (role === "sysadmin") return "admin";   // 'sysadmin' tab = Admin
  return "sales";
}

// ── KPI tile ──────────────────────────────────────────────────
const KPITile = ({ label, value, sub, accent, icon }) => (
  <div style={{
    background: "var(--bg)", borderRadius: 10, padding: "14px 16px",
    boxShadow: "var(--sh0)", display: "flex", flexDirection: "column", gap: 4,
    minWidth: 160, flex: 1, position: "relative", overflow: "hidden",
  }}>
    {accent && <span style={{
      position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent,
    }}/>}
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text2)", fontSize: 12, fontWeight: 600 }}>
      {icon && <Icon name={icon} size={13}/>}
      {label}
    </div>
    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'72 Duplex','72'", letterSpacing: "-0.01em" }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 12, color: "var(--text2)" }}>{sub}</div>}
  </div>
);

// ── Filter bar ────────────────────────────────────────────────
const FilterBar = ({ filters, onChange, onReset, density }) => {
  const set = (k, v) => onChange({ ...filters, [k]: v });
  const h = density === "compact" ? 28 : 32;
  const fld = {
    height: h, padding: "0 8px", borderRadius: 6, border: "1px solid var(--border)",
    background: "var(--bg)", fontSize: 13, fontFamily: "inherit", color: "var(--text)",
    minWidth: 130,
  };
  return (
    <div style={{
      display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap",
      padding: density === "compact" ? "8px 16px" : "12px 16px",
      background: "var(--bg)", borderBottom: "1px solid var(--border2)",
    }}>
      <FilterField label="Date">
        <input type="text" value={filters.date} onChange={e => set("date", e.target.value)} style={fld}/>
      </FilterField>
      <FilterField label="Truck">
        <select value={filters.truck} onChange={e => set("truck", e.target.value)} style={fld}>
          <option value="">All trucks</option>
          {TRUCKS.map(t => <option key={t.no} value={t.no}>{t.no} · {t.driverEn}</option>)}
        </select>
      </FilterField>
      <FilterField label="Route">
        <select value={filters.route} onChange={e => set("route", e.target.value)} style={fld}>
          <option value="">All routes</option>
          {ROUTES.map(r => <option key={r.code} value={r.code}>{r.code} · {r.name}</option>)}
        </select>
      </FilterField>
      <FilterField label="Customer">
        <select value={filters.customer} onChange={e => set("customer", e.target.value)} style={fld}>
          <option value="">All customers</option>
          {Object.entries(CUSTOMERS).map(([k, c]) => <option key={k} value={k}>{c.en}</option>)}
        </select>
      </FilterField>
      <FilterField label="Payment">
        <select value={filters.payment} onChange={e => set("payment", e.target.value)} style={fld}>
          <option value="">All types</option>
          {PAYMENT_TYPES.map(p => <option key={p.key} value={p.key}>{p.label} · {p.thai}</option>)}
        </select>
      </FilterField>
      <FilterField label="Status">
        <select value={filters.status} onChange={e => set("status", e.target.value)} style={fld}>
          <option value="">All statuses</option>
          {Object.values(STATUS).map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </FilterField>
      <button onClick={onReset} style={{
        height: h, padding: "0 12px", border: "1px solid var(--border)",
        borderRadius: 6, background: "var(--bg)", color: "var(--blue-h)",
        fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6,
      }}><Icon name="refresh" size={13}/> Reset</button>
    </div>
  );
};

const FilterField = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
    <label style={{ fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>{label}</label>
    {children}
  </div>
);

// ── Button ────────────────────────────────────────────────────
const Btn = ({ variant = "secondary", icon, children, density, className = "", ...rest }) => {
  const cls = `bk-btn bk-btn-${variant} bk-btn-${density === "compact" ? "compact" : "default"}${className ? " " + className : ""}`;
  return (
    <button {...rest} className={cls}>
      {icon && <Icon name={icon} size={13}/>}
      {children}
    </button>
  );
};

// ── Page Title strip ──────────────────────────────────────────
const PageTitle = ({ title, subtitle, breadcrumbs, actions }) => (
  <div style={{ background: "var(--bg)", padding: "16px 24px 12px", borderBottom: "1px solid var(--border2)" }}>
    {breadcrumbs && (
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>
        {breadcrumbs.map((b, i) => (
          <React.Fragment key={i}>
            {i > 0 && <Icon name="chevRight" size={11}/>}
            {b.onClick ? <a onClick={b.onClick} style={{ color: "var(--blue-h)", cursor: "pointer" }}>{b.label}</a>
                       : <span>{b.label}</span>}
          </React.Fragment>
        ))}
      </div>
    )}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.15 }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  </div>
);

// ── Toast ─────────────────────────────────────────────────────
const Toast = ({ msg, kind = "info", onClose }) => {
  React.useEffect(() => { if (msg) { const t = setTimeout(onClose, 4500); return () => clearTimeout(t); } }, [msg]);
  if (!msg) return null;
  const palette = {
    info:    { bg: "#D1EFFF", border: "#80C8F0", color: "#0064D9", icon: "info" },
    success: { bg: "#C2FCEE", border: "#96E6C8", color: "#25713A", icon: "check" },
    warn:    { bg: "#FFF3B8", border: "#F0D56A", color: "#A65500", icon: "alert" },
    error:   { bg: "#FFDBEF", border: "#E8A0A0", color: "var(--neg)", icon: "alert" },
  }[kind];
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: palette.bg, color: palette.color, border: `1px solid ${palette.border}`,
      padding: "10px 16px", borderRadius: 8, boxShadow: "var(--sh0)",
      display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600,
      zIndex: 1000, minWidth: 320, maxWidth: 560,
    }}>
      <Icon name={palette.icon} size={16}/>
      <span style={{ flex: 1 }}>{msg}</span>
      <button onClick={onClose} style={{ background: "transparent", border: 0, cursor: "pointer", color: palette.color, padding: 4, display: "flex" }}>
        <Icon name="x" size={14}/>
      </button>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────
function filterBillings(billings, f) {
  return billings.filter(b => {
    if (f.truck && b.truck !== f.truck) return false;
    if (f.payment && b.payment !== f.payment) return false;
    if (f.status && b.status !== f.status) return false;
    const st = SHIP_TO[b.shipTo];
    if (f.customer && st.code !== f.customer) return false;
    if (f.route) {
      const truck = TRUCKS.find(t => t.no === b.truck);
      if (!truck || truck.route !== f.route) return false;
    }
    return true;
  });
}

function groupByCustomer(billings) {
  const map = {};
  billings.forEach(b => {
    const st = SHIP_TO[b.shipTo];
    const cust = CUSTOMERS[st.code];
    if (!map[st.code]) {
      map[st.code] = {
        code: st.code, ...cust, billings: [], shipTos: {},
        sums: { qty: 0, credit: 0, cash: 0, bank: 0, total: 0 },
      };
    }
    const m = map[st.code];
    m.billings.push(b);
    m.sums.qty += b.qty;
    m.sums.total += b.total;
    m.sums[b.payment] += b.total;
    if (!m.shipTos[b.shipTo]) m.shipTos[b.shipTo] = { ...SHIP_TO[b.shipTo], stId: b.shipTo, billings: [] };
    m.shipTos[b.shipTo].billings.push(b);
  });
  return Object.values(map);
}

// ── Expose globally ───────────────────────────────────────────
Object.assign(window, {
  Icon, StatusTag, PaymentTag, ShellBar, SideNav, KPITile,
  FilterBar, Btn, PageTitle, Avatar, Toast, RoleSwitcher,
  filterBillings, groupByCustomer, roleToPermRole,
});
