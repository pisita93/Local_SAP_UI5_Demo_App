/* global React, AppData, Ico, Cbx, Status */
// Admin — user management
const { useState, useMemo, useRef } = React;

function RoleBadge({ role }) {
  const r = AppData.roles[role];
  if (!r) return <span className="t3">{role}</span>;
  return (
    <span className="tag" style={{background: r.tone + '18', color: r.tone, borderColor: r.tone + '33'}}>
      <span className="dot" style={{background: r.tone}}/>{r.label}
    </span>
  );
}

function PermissionsList({ role }) {
  const r = AppData.roles[role];
  if (!r) return null;
  const labels = { ADMIN:'User management', GROUPING:'Delivery grouping', POD_ENTRY:'POD entry', TRACKING:'Tracking reports' };
  return (
    <div className="flex gap6" style={{flexWrap:'wrap'}}>
      {r.permissions.map(p => <span key={p} className="tag" style={{background:'var(--bg-shell)', color:'var(--text2)', fontSize:11}}>{labels[p] || p}</span>)}
    </div>
  );
}

function UsersAdmin({ users, onChange }) {
  const roles = AppData.roles;
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState(null); // user being edited
  const [creating, setCreating] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return users.filter(u => {
      if (qq && !(u.name.toLowerCase().includes(qq) || u.email.toLowerCase().includes(qq) || u.team.toLowerCase().includes(qq))) return false;
      if (roleFilter && u.role !== roleFilter) return false;
      if (statusFilter && u.status !== statusFilter) return false;
      return true;
    });
  }, [users, q, roleFilter, statusFilter]);

  // Counts per role
  const counts = useMemo(() => {
    const c = { _all: users.length };
    Object.keys(roles).forEach(r => c[r] = users.filter(u => u.role === r).length);
    return c;
  }, [users, roles]);

  function saveUser(u, isNew) {
    if (isNew) onChange([...users, { ...u, id: 'U' + String(users.length + 101).padStart(3, '0'), lastLogin: '—' }]);
    else onChange(users.map(x => x.id === u.id ? { ...x, ...u } : x));
    setEditing(null); setCreating(false);
    window.toast(`User ${isNew ? 'created' : 'updated'}`, 'success');
  }
  function toggleStatus(u) {
    onChange(users.map(x => x.id === u.id ? { ...x, status: x.status === 'Active' ? 'Inactive' : 'Active' } : x));
    window.toast(`User ${u.status === 'Active' ? 'deactivated' : 'activated'}`, 'success');
  }
  function deleteUser(u) {
    onChange(users.filter(x => x.id !== u.id));
    setConfirmDel(null);
    window.toast('User removed', 'success');
  }

  return (
    <div>
      <div className="page-title-row">
        <div>
          <div className="page-title">Users & access</div>
          <div className="page-subtitle">{users.length} users across {Object.keys(roles).length} roles. Assign roles to control what each user can do.</div>
        </div>
        <div className="flex gap8">
          <button className="btn btn-secondary"><Ico.Download/> Export</button>
          <button className="btn btn-primary" onClick={() => setCreating(true)}><Ico.Plus/> Add user</button>
        </div>
      </div>

      {/* Role summary tiles */}
      <div className="kpi-strip" style={{gridTemplateColumns:'repeat(5, 1fr)'}}>
        {Object.entries(roles).map(([key, r]) => (
          <div key={key} className={`kpi-card ${roleFilter === key ? 'active' : ''}`} onClick={() => setRoleFilter(roleFilter === key ? '' : key)}>
            <div className="kpi-label" style={{color: r.tone}}>{r.label}</div>
            <div className="kpi-val">{counts[key] || 0}</div>
            <div className="kpi-sub"><span className="dot" style={{background: r.tone}}/>{r.permissions.length} permission{r.permissions.length === 1 ? '' : 's'}</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <div className="flex gap8 items-center" style={{flexWrap:'wrap'}}>
            <div className="search-input" style={{width:260}}>
              <Ico.Search stroke="#7F8C9A"/>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, email, team..."/>
            </div>
            <select className="input" style={{width:'auto'}} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="">All roles</option>
              {Object.entries(roles).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
            </select>
            <select className="input" style={{width:'auto'}} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All statuses</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            {(q || roleFilter || statusFilter) && (
              <button className="btn btn-tertiary btn-compact" onClick={() => { setQ(''); setRoleFilter(''); setStatusFilter(''); }}>Clear</button>
            )}
          </div>
        </div>

        <table className="sap-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Permissions</th>
              <th>Team</th>
              <th>Status</th>
              <th>Last login</th>
              <th style={{width:120}}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon"><Ico.User/></div><div className="empty-title">No matching users</div><div className="empty-body">Adjust your search or filters.</div></div></td></tr>
            )}
            {filtered.map(u => (
              <tr key={u.id} className="row-link" onClick={() => setEditing(u)} style={{opacity: u.status === 'Inactive' ? 0.55 : 1}}>
                <td>
                  <div className="flex items-center gap10">
                    <div className="avatar" style={{width:32, height:32, fontSize:12, background: AppData.roles[u.role].tone}}>{u.avatar}</div>
                    <div>
                      <div className="fw700">{u.name}</div>
                      <div className="t3 fs12 num">{u.id}</div>
                    </div>
                  </div>
                </td>
                <td className="num t2 fs13">{u.email}</td>
                <td><RoleBadge role={u.role}/></td>
                <td><PermissionsList role={u.role}/></td>
                <td className="t2 fs13">{u.team}</td>
                <td>
                  <span style={{display:'inline-flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, color: u.status === 'Active' ? 'var(--pos-dark)' : 'var(--text3)'}}>
                    <span className="dot" style={{background: u.status === 'Active' ? 'var(--pos)' : 'var(--text3)'}}/>{u.status}
                  </span>
                </td>
                <td className="num t2 fs13">{u.lastLogin}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div className="flex gap4">
                    <button className="icon-btn" title="Edit" onClick={() => setEditing(u)}><Ico.Pen width="14" height="14"/></button>
                    <button className="icon-btn" title={u.status === 'Active' ? 'Deactivate' : 'Activate'} onClick={() => toggleStatus(u)}>
                      {u.status === 'Active' ? <Ico.X/> : <Ico.Check/>}
                    </button>
                    <button className="icon-btn" title="Remove" onClick={() => setConfirmDel(u)}><Ico.Trash/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Roles summary card */}
      <div className="card mt20">
        <div className="card-header">
          <div>
            <span className="card-title">Roles & permissions</span>
            <div className="card-subtitle">What each role can do in the app.</div>
          </div>
        </div>
        <div style={{padding:'8px 16px 16px'}}>
          <table className="sap-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Permissions</th>
                <th>Used by</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(roles).map(([k, r]) => (
                <tr key={k}>
                  <td><RoleBadge role={k}/></td>
                  <td><PermissionsList role={k}/></td>
                  <td className="t2 fs13">{counts[k] || 0} user{counts[k] === 1 ? '' : 's'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(editing || creating) && (
        <UserEditDialog
          user={editing}
          roles={roles}
          onCancel={() => { setEditing(null); setCreating(false); }}
          onSave={(u) => saveUser(u, creating)}
        />
      )}
      {confirmDel && (
        <ConfirmDialog
          open={!!confirmDel}
          title="Remove user"
          body={<>Are you sure you want to remove <strong>{confirmDel.name}</strong>? This cannot be undone.</>}
          confirmLabel="Remove user"
          confirmKind="reject"
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => deleteUser(confirmDel)}
        />
      )}
    </div>
  );
}

function UserEditDialog({ user, roles, onCancel, onSave }) {
  const isNew = !user;
  const [name, setName]   = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole]   = useState(user?.role || 'Sales Admin');
  const [team, setTeam]   = useState(user?.team || '');
  const [status, setStatus] = useState(user?.status || 'Active');

  function submit() {
    if (!name.trim() || !email.trim()) { window.toast('Name and email are required', 'error'); return; }
    const avatar = name.trim().split(/\s+/).slice(0,2).map(p => p[0]?.toUpperCase()).join('');
    onSave({ id: user?.id, name: name.trim(), email: email.trim(), role, team: team.trim() || '—', status, avatar });
  }

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <div className="dialog-title">{isNew ? 'Add user' : 'Edit user'}</div>
          <button className="icon-btn" onClick={onCancel}><Ico.X/></button>
        </div>
        <div className="dialog-body">
          <div className="flex gap16 items-center mb16">
            <div className="avatar" style={{width:56, height:56, fontSize:20, background: roles[role]?.tone || 'var(--blue)'}}>
              {(name.trim().split(/\s+/).slice(0,2).map(p => p[0]?.toUpperCase()).join('') || '?')}
            </div>
            <div className="flex1">
              <RoleBadge role={role}/>
              <div className="t3 fs12 mt4 num">{user?.id || 'New user'}</div>
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
            <div className="field">
              <label className="field-label">Full name <span style={{color:'var(--neg)'}}>*</span></label>
              <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pim Charoenkul"/>
            </div>
            <div className="field">
              <label className="field-label">Email <span style={{color:'var(--neg)'}}>*</span></label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@company.co.th"/>
            </div>
            <div className="field">
              <label className="field-label">Role <span style={{color:'var(--neg)'}}>*</span></label>
              <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                {Object.entries(roles).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Team</label>
              <input className="input" value={team} onChange={e => setTeam(e.target.value)} placeholder="e.g. Bangkok HQ"/>
            </div>
            <div className="field" style={{gridColumn:'span 2'}}>
              <label className="field-label">Status</label>
              <div className="flex gap8">
                <button className={`chip ${status === 'Active' ? 'active' : ''}`} onClick={() => setStatus('Active')}><span className="dot" style={{background:'var(--pos)'}}/> Active</button>
                <button className={`chip ${status === 'Inactive' ? 'active' : ''}`} onClick={() => setStatus('Inactive')}><span className="dot" style={{background:'var(--text3)'}}/> Inactive</button>
              </div>
            </div>
          </div>
          <div className="mt16">
            <div className="sec-title">Permissions granted by this role</div>
            <PermissionsList role={role}/>
          </div>
        </div>
        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}><Ico.Check/> {isNew ? 'Create user' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}

function AccessDeniedPage({ route, user, onGoHome }) {
  return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh'}}>
      <div className="card" style={{maxWidth:480, width:'100%'}}>
        <div className="card-body" style={{textAlign:'center', padding:'40px 32px'}}>
          <div style={{width:64, height:64, borderRadius:'50%', background:'var(--warn-bg)', color:'#B66800', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:16}}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <div className="page-title" style={{fontSize:20}}>Access restricted</div>
          <div className="t2 mt8">
            You're signed in as <strong>{user?.name}</strong> ({user?.role}). Your role doesn't have permission to view this screen.
          </div>
          <div className="mt16">
            <button className="btn btn-primary" onClick={onGoHome}>Go to your home</button>
          </div>
          <div className="t3 fs12 mt16">Need access? Contact your IT Admin.</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { UsersAdmin, RoleBadge, PermissionsList, AccessDeniedPage });
