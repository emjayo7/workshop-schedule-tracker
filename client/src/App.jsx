import { useEffect, useState } from "react";
import AppHeader from "./components/AppHeader/AppHeader.jsx";
import ConnectionStatus from "./components/ConnectionStatus/ConnectionStatus.jsx";

const apiBaseUrl = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL || ""
  : "";

function App() {
  const [connection, setConnection] = useState({
    state: "checking",
    message: "Checking the API and database...",
  });

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/health`)
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
      <AppHeader />

      <section className="welcome" aria-labelledby="page-title">
        <p className="eyebrow">A clear week starts here</p>
        <h1 id="page-title">Your classes and coursework, in one place.</h1>
        <p className="intro">
          The project foundation is ready. This first screen checks that the
          React app can reach its Express server and MongoDB database.
        </p>

        <ConnectionStatus state={connection.state} message={connection.message} />
      </section>
    </main>
  );
}

export default App;
