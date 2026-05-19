/* ──────────────────────────────────────────────────────────────
 * Administrator role — Access permissions, Users, Audit log
 * Controls which functions each business role can access.
 * ────────────────────────────────────────────────────────────── */

// ── Catalogue of permission-controllable functions ────────────
const PERMISSION_GROUPS = [
  {
    key: "report", label: "Daily reporting",
    items: [
      { k: "p.report.view",    label: "View daily delivery & billing report", desc: "Open the main report screen with KPIs and customer rollups." },
      { k: "p.report.export",  label: "Export to Excel / PDF",                desc: "Download the filtered report dataset." },
      { k: "p.report.filter",  label: "Save & share filters",                 desc: "Create reusable filter sets for the team." },
    ],
  },
  {
    key: "submit", label: "Submission to cashier",
    items: [
      { k: "p.submit.draft",   label: "Edit draft billings",                  desc: "Inline-correct billings before sending for review." },
      { k: "p.submit.submit",  label: "Submit billings for cashier review",   desc: "Promote drafts to Sales Admin Submitted status." },
      { k: "p.submit.rework",  label: "Resolve rework queue",                 desc: "Re-edit and resubmit billings returned by the cashier." },
    ],
  },
  {
    key: "review", label: "Cashier review",
    items: [
      { k: "p.review.queue",   label: "Access cashier review queue",          desc: "See trucks awaiting settlement." },
      { k: "p.review.approve", label: "Approve individual billings",          desc: "Mark billing as Settled (ready for posting)." },
      { k: "p.review.reject",  label: "Reject with note (back to Rework)",    desc: "Send a billing back to Sales Admin." },
    ],
  },
  {
    key: "settle", label: "Settlement & posting",
    items: [
      { k: "p.settle.truck",   label: "Settle truck (settlement approval)",   desc: "Confirm all reviewed billings; triggers SAP background posting.", critical: true },
      { k: "p.settle.post",    label: "Trigger SAP FI clearing posting",      desc: "Background clearing for Cash & Bank Transfer customers." },
      { k: "p.settle.reverse", label: "Reverse a posted settlement",          desc: "Restricted action — requires Admin approval.", critical: true },
    ],
  },
  {
    key: "master", label: "Master data & admin",
    items: [
      { k: "p.master.customer",label: "Manage customers & ship-to",           desc: "Create or edit customer master records." },
      { k: "p.master.truck",   label: "Manage trucks & drivers",              desc: "Fleet master data." },
      { k: "p.master.user",    label: "Manage users & role assignment",       desc: "Admin-only function." },
      { k: "p.master.audit",   label: "View audit log",                       desc: "All status changes and posting history." },
    ],
  },
];

// Defaults per the brief: report=both, settle approval=cashier only
const DEFAULT_PERMS = {
  // Daily reporting — both Sales Admin + Cashier can see the report
  "p.report.view":    { sales: true,  cashier: true,  admin: true },
  "p.report.export":  { sales: true,  cashier: true,  admin: true },
  "p.report.filter":  { sales: true,  cashier: false, admin: true },
  // Submission — Sales Admin only
  "p.submit.draft":   { sales: true,  cashier: false, admin: true },
  "p.submit.submit":  { sales: true,  cashier: false, admin: true },
  "p.submit.rework":  { sales: true,  cashier: false, admin: true },
  // Cashier review — Cashier only
  "p.review.queue":   { sales: false, cashier: true,  admin: true },
  "p.review.approve": { sales: false, cashier: true,  admin: true },
  "p.review.reject":  { sales: false, cashier: true,  admin: true },
  // Settlement — Cashier only (Admin override)
  "p.settle.truck":   { sales: false, cashier: true,  admin: true },
  "p.settle.post":    { sales: false, cashier: true,  admin: true },
  "p.settle.reverse": { sales: false, cashier: false, admin: true },
  // Master data — Admin only
  "p.master.customer":{ sales: false, cashier: false, admin: true },
  "p.master.truck":   { sales: false, cashier: false, admin: true },
  "p.master.user":    { sales: false, cashier: false, admin: true },
  "p.master.audit":   { sales: false, cashier: false, admin: true },
};

// ── Sample users ──────────────────────────────────────────────
const SAMPLE_USERS = [
  { id: "U-0042", name: "ณัฐพล สง่างาม",     en: "Natthapon S.",     role: "sales",   email: "natthapon.s@salesbkk.co.th",   lastLogin: "16 May 2026 06:12" },
  { id: "U-0043", name: "ศิริพร ใจดี",         en: "Siriporn J.",      role: "sales",   email: "siriporn.j@salesbkk.co.th",     lastLogin: "16 May 2026 06:30" },
  { id: "U-0044", name: "อรุณ พิมพ์งาม",      en: "Aroon P.",         role: "sales",   email: "aroon.p@salesbkk.co.th",        lastLogin: "15 May 2026 17:48" },
  { id: "U-0099", name: "ปริยากร นันทกุล",    en: "Priyakorn N.",     role: "cashier", email: "priyakorn.n@salesbkk.co.th",    lastLogin: "16 May 2026 06:55" },
  { id: "U-0100", name: "ธนพร วิเศษศิลป์",    en: "Thanaporn W.",     role: "cashier", email: "thanaporn.w@salesbkk.co.th",    lastLogin: "16 May 2026 07:15" },
  { id: "U-0007", name: "วรเดช อนันต์",       en: "Woradet A.",       role: "admin",   email: "woradet.a@salesbkk.co.th",      lastLogin: "16 May 2026 08:01" },
];

// ── Audit log entries ─────────────────────────────────────────
const AUDIT_LOG = [
  { ts: "16 May 2026 15:42:11", actor: "ปริยากร น.",  role: "cashier", action: "Settled truck TRK-1046 (4 billings · ฿38,400)",        kind: "settle" },
  { ts: "16 May 2026 15:41:02", actor: "ปริยากร น.",  role: "cashier", action: "Approved BL-880373 — บิ๊กซี เอ็กซ์ตร้า พระราม 4",         kind: "approve" },
  { ts: "16 May 2026 15:24:48", actor: "ปริยากร น.",  role: "cashier", action: "Rejected BL-880371 — receipt amount mismatch",        kind: "reject" },
  { ts: "16 May 2026 14:55:11", actor: "ณัฐพล ส.",   role: "sales",   action: "Submitted 5 billings on TRK-1044 to cashier",         kind: "submit" },
  { ts: "16 May 2026 14:50:23", actor: "ณัฐพล ส.",   role: "sales",   action: "Edited BL-880335 (cash short note, ฿420)",           kind: "edit"   },
  { ts: "16 May 2026 11:02:39", actor: "ระบบ SAP",     role: "system",  action: "FI document 9100456712 created — clearing complete", kind: "post"   },
  { ts: "16 May 2026 08:01:55", actor: "วรเดช อ.",    role: "admin",   action: "Updated permission · p.settle.reverse → Admin only",  kind: "admin"  },
];

// ─────────────────────────────────────────────────────────────
// AdminHome — wraps the 3 admin sub-pages
// ─────────────────────────────────────────────────────────────
function AdminHome({ page, perms, setPerms, density }) {
  if (page === "users")   return <UsersPage density={density}/>;
  if (page === "audit")   return <AuditPage density={density}/>;
  return <PermissionsPage perms={perms} setPerms={setPerms} density={density}/>;
}

// ─────────────────────────────────────────────────────────────
// Permissions matrix
// ─────────────────────────────────────────────────────────────
function PermissionsPage({ perms, setPerms, density }) {
  const [dirty, setDirty] = React.useState(false);
  const [filter, setFilter] = React.useState("");

  const grant = (k, role, v) => {
    setPerms(prev => ({ ...prev, [k]: { ...prev[k], [role]: v } }));
    setDirty(true);
  };

  const groups = PERMISSION_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(it =>
      !filter || it.label.toLowerCase().includes(filter.toLowerCase()) || g.label.toLowerCase().includes(filter.toLowerCase())),
  })).filter(g => g.items.length > 0);

  // counts per role
  const totals = Object.values(perms).reduce((s, p) => {
    if (p.sales)   s.sales++;
    if (p.cashier) s.cashier++;
    if (p.admin)   s.admin++;
    return s;
  }, { sales: 0, cashier: 0, admin: 0 });

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageTitle
        title="Access permissions"
        subtitle="Configure which functions each business role can access. Changes apply immediately to all signed-in users."
        actions={<>
          <Btn variant="secondary" icon="refresh" density={density}
               onClick={() => { setPerms(DEFAULT_PERMS); setDirty(false); }}>Reset to defaults</Btn>
          <Btn variant="primary" icon="check" density={density}
               disabled={!dirty} onClick={() => setDirty(false)}>
            {dirty ? "Save changes" : "Saved"}
          </Btn>
        </>}
      />

      <div style={{ padding: "16px 24px 0", display: "flex", gap: 12 }}>
        <KPITile label="Functions" value={Object.keys(DEFAULT_PERMS).length} sub="across 5 capability groups" icon="grid"/>
        <KPITile label="Sales admin" value={totals.sales} sub="granted permissions" icon="user" accent="#0064D9"/>
        <KPITile label="Cashier"     value={totals.cashier} sub="granted permissions" icon="cash" accent="#30914C"/>
        <KPITile label="Admin"       value={totals.admin} sub="granted permissions" icon="settings" accent="#5C2E8E"/>
      </div>

      {dirty && (
        <div style={{ margin: "16px 24px 0" }}>
          <div className="msg-strip msg-warn">
            <Icon name="alert" size={14} color="var(--warn)" style={{ marginTop: 2 }}/>
            <div>
              <div className="msg-strip-title">Unsaved permission changes</div>
              <span>Changes are previewed live in this prototype. Click <b>Save changes</b> to commit, or <b>Reset</b> to discard.</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: "16px 24px 0", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ position: "relative", flex: "0 0 320px" }}>
          <Icon name="search" size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text2)" }}/>
          <input className="input" placeholder="Find a function…"
                 style={{ paddingLeft: 32 }} value={filter} onChange={e => setFilter(e.target.value)}/>
        </div>
        <span style={{ fontSize: 12, color: "var(--text2)" }}>
          <Icon name="info" size={12}/> Tap a checkbox to toggle. Settlement approval defaults to <b>Cashier-only</b>.
        </span>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", overflow: "hidden" }}>
          {/* Header row */}
          <div style={{
            display: "grid", gridTemplateColumns: "minmax(420px, 1fr) 130px 130px 130px",
            alignItems: "center", padding: "12px 16px",
            background: "#FAFBFC", borderBottom: "2px solid var(--border2)",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text2)",
                          textTransform: "uppercase", letterSpacing: ".04em" }}>Function</div>
            <RoleHeader label="Sales admin" sub="3 users" color="#0064D9" icon="user"/>
            <RoleHeader label="Cashier"     sub="2 users" color="#25713A" icon="cash"/>
            <RoleHeader label="Admin"       sub="1 user"  color="#5C2E8E" icon="settings"/>
          </div>

          {groups.map(g => (
            <PermGroup key={g.key} group={g} perms={perms} grant={grant} density={density}/>
          ))}
        </div>
      </div>
    </div>
  );
}

const RoleHeader = ({ label, sub, color, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color, fontSize: 12, fontWeight: 700 }}>
      <Icon name={icon} size={13}/> {label}
    </span>
    <span style={{ fontSize: 10, color: "var(--text2)" }}>{sub}</span>
  </div>
);

function PermGroup({ group, perms, grant, density }) {
  const [open, setOpen] = React.useState(true);
  // group bulk toggle: check if all granted per role
  const allOn = (role) => group.items.every(it => perms[it.k]?.[role]);
  const someOn = (role) => group.items.some(it => perms[it.k]?.[role]);
  const bulk = (role) => {
    const target = !allOn(role);
    group.items.forEach(it => grant(it.k, role, target));
  };

  return (
    <>
      <div onClick={() => setOpen(!open)} style={{
        padding: "10px 16px", borderBottom: "1px solid var(--border2)",
        background: "var(--bg-shell)", cursor: "pointer",
        display: "grid", gridTemplateColumns: "minmax(420px, 1fr) 130px 130px 130px",
        alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={open ? "chevDown" : "chevRight"} size={13} color="var(--text2)"/>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text)",
                         textTransform: "uppercase", letterSpacing: ".04em" }}>{group.label}</span>
          <span style={{ fontSize: 11, color: "var(--text2)" }}>· {group.items.length} functions</span>
        </div>
        {["sales", "cashier", "admin"].map(role => (
          <div key={role} style={{ display: "flex", justifyContent: "center" }}>
            <TriCheck
              state={allOn(role) ? "on" : someOn(role) ? "mixed" : "off"}
              onClick={e => { e.stopPropagation(); bulk(role); }}/>
          </div>
        ))}
      </div>
      {open && group.items.map(it => (
        <div key={it.k} style={{
          display: "grid", gridTemplateColumns: "minmax(420px, 1fr) 130px 130px 130px",
          alignItems: "center", padding: density === "compact" ? "8px 16px" : "12px 16px",
          borderBottom: "1px solid var(--border3)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, paddingLeft: 21 }}>
            <span style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
              {it.label}
              {it.critical && <span style={{
                fontSize: 10, padding: "0 6px", height: 14, borderRadius: 3,
                background: "#FFDBEF", color: "var(--neg)", fontWeight: 700,
                display: "inline-flex", alignItems: "center", textTransform: "uppercase",
              }}>Critical</span>}
            </span>
            <span style={{ fontSize: 11, color: "var(--text2)" }}>{it.desc}</span>
            <span style={{ fontSize: 10, color: "var(--text3)", fontFamily: "'72 Duplex','72'" }}>{it.k}</span>
          </div>
          {["sales", "cashier", "admin"].map(role => (
            <div key={role} style={{ display: "flex", justifyContent: "center" }}>
              <TriCheck state={perms[it.k]?.[role] ? "on" : "off"}
                        disabled={role === "admin" && it.k.startsWith("p.master")}
                        onClick={() => grant(it.k, role, !perms[it.k]?.[role])}/>
            </div>
          ))}
        </div>
      ))}
    </>
  );
}

// Tri-state checkbox (on / off / mixed) — like Fiori UI5 tri-state
function TriCheck({ state, onClick, disabled }) {
  const base = {
    width: 22, height: 22, borderRadius: 4, cursor: disabled ? "not-allowed" : "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1.5px solid var(--border)", background: "var(--bg)",
    transition: "background .15s, border-color .15s",
    opacity: disabled ? 0.5 : 1,
  };
  const styles = {
    on:    { background: "var(--blue)", borderColor: "var(--blue)" },
    mixed: { background: "var(--blue)", borderColor: "var(--blue)" },
    off:   {},
  }[state];
  return (
    <button onClick={disabled ? null : onClick} style={{ ...base, ...styles, padding: 0 }}
            aria-checked={state === "on"} role="checkbox" disabled={disabled}>
      {state === "on" && <Icon name="check" size={14} color="#fff"/>}
      {state === "mixed" && <div style={{ width: 10, height: 2.5, background: "#fff", borderRadius: 1 }}/>}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Users page (read-only list)
// ─────────────────────────────────────────────────────────────
function UsersPage({ density }) {
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const users = SAMPLE_USERS.filter(u =>
    (!search || u.en.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search))
    && (!roleFilter || u.role === roleFilter));

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageTitle
        title="Users"
        subtitle={`${SAMPLE_USERS.length} users · 3 Sales admins · 2 Cashiers · 1 Admin`}
        actions={<>
          <Btn variant="secondary" icon="download" density={density}>Export</Btn>
          <Btn variant="primary" icon="plus" density={density}>Add user</Btn>
        </>}
      />
      <div style={{ padding: "16px 24px", display: "flex", gap: 8 }}>
        <div style={{ position: "relative", flex: "0 0 320px" }}>
          <Icon name="search" size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text2)" }}/>
          <input className="input" placeholder="Search users…" style={{ paddingLeft: 32 }}
                 value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <select className="input" style={{ width: 200 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="sales">Sales admin</option>
          <option value="cashier">Cashier</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "0 24px 24px" }}>
        <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", overflow: "hidden" }}>
          <div style={{
            display: "grid", gridTemplateColumns: "50px 100px minmax(220px, 1fr) 1fr 140px 180px 100px",
            padding: "12px 16px", gap: 12, background: "#FAFBFC",
            borderBottom: "2px solid var(--border2)", fontSize: 11, fontWeight: 700,
            color: "var(--text2)", textTransform: "uppercase", letterSpacing: ".04em",
          }}>
            <div/>
            <div>User ID</div>
            <div>Name</div>
            <div>Email</div>
            <div>Role</div>
            <div>Last login</div>
            <div style={{ textAlign: "right" }}>Status</div>
          </div>
          {users.map(u => (
            <div key={u.id} style={{
              display: "grid", gridTemplateColumns: "50px 100px minmax(220px, 1fr) 1fr 140px 180px 100px",
              padding: density === "compact" ? "8px 16px" : "12px 16px", gap: 12,
              alignItems: "center", borderBottom: "1px solid var(--border3)",
              fontSize: 13, cursor: "pointer",
            }} onMouseOver={e => e.currentTarget.style.background = "var(--bg-shell)"}
               onMouseOut={e => e.currentTarget.style.background = "var(--bg)"}>
              <Avatar name={u.name} en={u.en}/>
              <span style={{ fontFamily: "'72 Duplex','72'", color: "var(--text2)", fontSize: 12 }}>{u.id}</span>
              <div>
                <div style={{ fontWeight: 700 }}>{u.en}</div>
                <div style={{ fontSize: 11, color: "var(--text2)" }}>{u.name}</div>
              </div>
              <span style={{ color: "var(--blue-h)", fontSize: 12 }}>{u.email}</span>
              <RoleBadge role={u.role}/>
              <span style={{ fontSize: 12, color: "var(--text2)" }}>{u.lastLogin}</span>
              <span style={{ textAlign: "right" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 12, fontWeight: 600, color: "var(--pos-dark)",
                }}>
                  <i style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--pos)" }}/>
                  Active
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const RoleBadge = ({ role }) => {
  const map = {
    sales:   { label: "Sales admin", bg: "#D1EFFF", fg: "#0064D9", dot: "#0070F2" },
    cashier: { label: "Cashier",     bg: "#C2FCEE", fg: "#25713A", dot: "#30914C" },
    admin:   { label: "Admin",       bg: "#DDC4F0", fg: "#5C2E8E", dot: "#7B4FAB" },
  }[role];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      height: 22, padding: "0 8px", borderRadius: 4,
      background: map.bg, color: map.fg, fontSize: 12, fontWeight: 700,
    }}>
      <i style={{ width: 6, height: 6, borderRadius: "50%", background: map.dot }}/>
      {map.label}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// Audit log
// ─────────────────────────────────────────────────────────────
function AuditPage({ density }) {
  const kindToTag = {
    settle:  { label: "Settlement", color: "#5C2E8E", bg: "#DDC4F0" },
    approve: { label: "Approve",    color: "#25713A", bg: "#C2FCEE" },
    reject:  { label: "Reject",     color: "#AA0808", bg: "#FFDBEF" },
    submit:  { label: "Submit",     color: "#0064D9", bg: "#D1EFFF" },
    edit:    { label: "Edit",       color: "#556B82", bg: "#EAE4EE" },
    post:    { label: "SAP post",   color: "#1A5C30", bg: "#C2FCEE" },
    admin:   { label: "Admin",      color: "#A65500", bg: "#FFF3B8" },
  };
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageTitle
        title="Audit log"
        subtitle="System-wide activity. All actions are immutable and exported nightly to the SAP audit archive."
        actions={<Btn variant="secondary" icon="download" density="cozy">Export CSV</Btn>}/>
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div style={{ background: "var(--bg)", borderRadius: 10, boxShadow: "var(--sh0)", overflow: "hidden" }}>
          {AUDIT_LOG.map((e, i) => {
            const t = kindToTag[e.kind];
            return (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "180px 110px 200px 1fr",
                padding: density === "compact" ? "8px 16px" : "12px 16px", gap: 12,
                alignItems: "center", borderBottom: "1px solid var(--border3)",
                fontSize: 13,
              }}>
                <span style={{ fontFamily: "'72 Duplex','72'", fontSize: 12, color: "var(--text2)" }}>{e.ts}</span>
                <span style={{
                  display: "inline-flex", alignItems: "center", height: 22, padding: "0 8px",
                  borderRadius: 4, background: t.bg, color: t.color, fontSize: 11, fontWeight: 700,
                  width: "fit-content",
                }}>{t.label}</span>
                <span>
                  <b>{e.actor}</b> <span style={{ color: "var(--text2)", fontSize: 11 }}>· {e.role}</span>
                </span>
                <span>{e.action}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, {
  AdminHome, PermissionsPage, UsersPage, AuditPage,
  DEFAULT_PERMS, PERMISSION_GROUPS, SAMPLE_USERS, AUDIT_LOG,
  RoleBadge,
});
