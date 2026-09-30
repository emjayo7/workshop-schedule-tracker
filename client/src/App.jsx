import { useEffect, useState } from "react";

function App() {
  const [connection, setConnection] = useState({
    state: "checking",
    message: "Checking the API and database...",
  });

  useEffect(() => {
    fetch("/api/health")
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "The server returned an error.");
        }

        return result.data;
      })
      .then((health) => {
        setConnection({
          state: "connected",
          message: `API ${health.api} · Database ${health.database}`,
        });
      })
      .catch((error) => {
        setConnection({ state: "error", message: error.message });
      });
  }, []);

  return (
    <main className="page-shell">
      <header className="topbar">
        <span className="brand-mark" aria-hidden="true">CP</span>
        <span>Classwork Planner</span>
        <span className="phase-label">Setup phase</span>
      </header>

      <section className="welcome" aria-labelledby="page-title">
        <p className="eyebrow">A clear week starts here</p>
        <h1 id="page-title">Your classes and coursework, in one place.</h1>
        <p className="intro">
          The project foundation is ready. This first screen checks that the
          React app can reach its Express server and MongoDB database.
        </p>

        <div className={`connection connection--${connection.state}`} role="status">
          <span className="connection-indicator" aria-hidden="true" />
          <div>
            <strong>Development connection</strong>
            <p>{connection.message}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
