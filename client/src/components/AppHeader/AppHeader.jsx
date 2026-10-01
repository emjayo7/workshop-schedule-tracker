import "./AppHeader.css";

const views = [
  { id: "overview", label: "Overview" },
  { id: "timetable", label: "Timetable" },
  { id: "classes", label: "Classes" },
];

function AppHeader({ activeView, onViewChange, onAddClass }) {
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

      <button className="button button--primary header-add" type="button" onClick={onAddClass}>
        <span aria-hidden="true">+</span> Add class
      </button>
    </header>
  );
}

export default AppHeader;