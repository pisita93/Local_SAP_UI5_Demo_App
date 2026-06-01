// Shell.jsx — Story toolbar, Application bar, Side panel

function StoryToolbar({ pageName, pageIndex, pageCount, onPrev, onNext, panelTab, onTogglePanel }) {
  return (
    <div className="toolbar">
      <button className="tb-btn" title="Undo"><Icon name="undo-2" /></button>
      <button className="tb-btn" title="Redo"><Icon name="redo-2" /></button>
      <span className="tb-sep" />
      <button className="tb-btn" title="Edit"><Icon name="pencil" /> <span>Edit</span></button>
      <button className="tb-btn" title="Comment"><Icon name="message-square" /></button>
      <button className="tb-btn" title="Tools"><Icon name="wrench" /></button>
      <span className="tb-sep" />
      <button className={"tb-btn" + (panelTab === "navigation" ? " active" : "")} onClick={() => onTogglePanel("navigation")} title="Navigation"><Icon name="panel-left" /></button>
      <button className={"tb-btn" + (panelTab === "filter" ? " active" : "")} onClick={() => onTogglePanel("filter")} title="Filter"><Icon name="filter" /></button>
      <span className="tb-sep" />
      <span className="tb-page">{pageName}</span>
      <span className="tb-sep" />
      <button className="tb-btn" onClick={onPrev} title="Previous page"><Icon name="chevron-left" /></button>
      <span className="tb-page" style={{ fontVariantNumeric: "tabular-nums" }}>{pageIndex + 1} / {pageCount}</span>
      <button className="tb-btn" onClick={onNext} title="Next page"><Icon name="chevron-right" /></button>
      <span className="tb-spacer" />
      <button className="tb-btn" title="Refresh"><Icon name="refresh-cw" /></button>
      <button className="tb-btn" title="Full screen"><Icon name="maximize" /></button>
      <button className="tb-btn" title="More"><Icon name="more-vertical" /></button>
    </div>
  );
}

function ApplicationBar({ title }) {
  return (
    <div className="appbar">
      <div className="appbar-left">
        <img className="logo" src={(window.__resources && window.__resources.sapLogo) || "assets/sap-logo.png"} alt="SAP" />
        <span className="home"><Icon name="house" /> {title}</span>
      </div>
      <div className="appbar-right">
        <button className="tb-btn" title="Search"><Icon name="search" /></button>
        <button className="tb-btn" title="Notifications"><Icon name="bell" /></button>
        <button className="tb-btn" title="Help"><Icon name="circle-help" /></button>
        <div className="av" title="Account">AK</div>
      </div>
    </div>
  );
}

function SidePanel({ tab, onTab, pages, currentPage, onSelectPage, filters, onFilterClick, pinned, onPin, onClose }) {
  return (
    <div className="side">
      <div className="side-tabs">
        <button className={"side-tab" + (tab === "navigation" ? " on" : "")} onClick={() => onTab("navigation")}>Navigation</button>
        <button className={"side-tab" + (tab === "filter" ? " on" : "")} onClick={() => onTab("filter")}>Filter</button>
        <div className="side-actions">
          <span className={"side-act" + (pinned ? " on" : "")} onClick={onPin} title="Pin"><Icon name="pin" /></span>
          <span className="side-act" title="Pop out"><Icon name="external-link" /></span>
          <span className="side-act" onClick={onClose} title="Close"><Icon name="x" /></span>
        </div>
      </div>
      <div className="side-body">
        {tab === "navigation" ? (
          pages.map((p, i) => (
            <div key={p.id} className={"nav-item" + (p.id === currentPage ? " on" : "")} onClick={() => onSelectPage(i)}>
              {p.id === currentPage && <span className="dot" />}
              <span className="ic"><Icon name="layout-grid" /></span>
              {p.name}
            </div>
          ))
        ) : (
          <React.Fragment>
            <div className="filter-group">
              <div className="filter-group-head">
                <Icon name="chevron-down" />
                <span>Applied to This Page <span className="cnt">({filters.length})</span></span>
                <span className="ic"><Icon name="filter-plus" /></span>
              </div>
              {filters.map((f, i) => (
                <div key={i} className="filter-row" onClick={(e) => onFilterClick(i, e)}>
                  <div>
                    <div className="fl">{f.label}</div>
                    <div className="fv">{f.value}</div>
                  </div>
                  <span className="ic"><Icon name="chevron-right" /></span>
                </div>
              ))}
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { StoryToolbar, ApplicationBar, SidePanel });
