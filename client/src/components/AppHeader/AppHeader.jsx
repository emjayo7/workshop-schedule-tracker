import "./AppHeader.css";

function AppHeader() {
  return (
    <header className="topbar">
      <span className="brand-mark" aria-hidden="true">CP</span>
      <span>Classwork Planner</span>
      <span className="phase-label">Setup phase</span>
    </header>
  );
}

export default AppHeader;