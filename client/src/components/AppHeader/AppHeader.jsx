import "./AppHeader.css";

const views = [
  { id: "overview", label: "Overview" },
  { id: "timetable", label: "Timetable" },
  { id: "classes", label: "Classes" },
];

function AppHeader({ activeView, onViewChange, onAddClass, onLogout, userName, theme, themeSaving, onThemeChange }) {
  return (
    <header className="topbar">
      <a className="brand" href="#overview" onClick={() => onViewChange("overview")}>
        <span className="brand-mark" aria-hidden="true">WS</span>
        <span>Workshop Schedule</span>
      </a>

      <nav className="main-nav" aria-label="Main navigation">
        {views.map((view) => (
          <button
            key={view.id}
            className={`nav-button${activeView === view.id ? " nav-button--active" : ""}`}
            type="button"
            aria-current={activeView === view.id ? "page" : undefined}
            onClick={() => onViewChange(view.id)}
          >
            {view.label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <label className="theme-picker">
          <span>Theme</span>
          <select value={theme} disabled={themeSaving} onChange={(event) => onThemeChange(event.target.value)} aria-label="Color theme">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
            <option value="pink">Pink</option>
          </select>
        </label>
        <span className="header-user" title={userName}>{userName}</span>
        {onLogout && (
          <button className="button button--secondary" type="button" disabled={themeSaving} onClick={onLogout}>
            Log out
          </button>
        )}
        <button className="button button--primary header-add" type="button" onClick={onAddClass}>
          <span aria-hidden="true">+</span> Add class
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
