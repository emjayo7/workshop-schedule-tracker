import { useEffect, useState } from "react";
import AppHeader from "./components/AppHeader/AppHeader.jsx";
import ConnectionStatus from "./components/ConnectionStatus/ConnectionStatus.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import Timetable from "./components/Timetable/Timetable.jsx";
import ClassManagement from "./components/ClassManagement/ClassManagement.jsx";
import ClassForm from "./components/ClassForm/ClassForm.jsx";
import ClassDetails from "./components/ClassDetails/ClassDetails.jsx";
import {
  createClass,
  deleteClass,
  fetchClasses,
  fetchCurrentUser,
  fetchHealth,
  loginUser,
  logoutUser,
  registerUser,
  updateClass,
} from "./services/api.js";
import { sortClassesBySchedule } from "./utils/classUtils.js";

const emptyAuthForm = {
  name: "",
  email: "",
  password: "",
};

function App() {
  const [classes, setClasses] = useState([]);
  const [view, setView] = useState("overview");
  const [previousView, setPreviousView] = useState("overview");
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [connection, setConnection] = useState({
    state: "checking",
    message: "Checking the API...",
  });
  const [authUser, setAuthUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [authError, setAuthError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);

  async function loadClasses() {
    setLoading(true);
    setLoadError("");

    try {
      const [classData, health] = await Promise.all([fetchClasses(), fetchHealth()]);
      setClasses(sortClassesBySchedule(classData));
      setConnection({ state: "connected", message: `API ${health.api}` });
    } catch (error) {
      setLoadError(error.message);
      setConnection({ state: "error", message: error.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function restoreSession() {
      try {
        const { user } = await fetchCurrentUser();
        setAuthUser(user);
        setConnection({ state: "connected", message: `Signed in as ${user.name}` });
      } catch {
        setAuthUser(null);
        setConnection({ state: "checking", message: "Checking the API..." });
      } finally {
        setAuthChecking(false);
      }
    }

    restoreSession();
  }, []);

  useEffect(() => {
    if (authUser) {
      loadClasses();
    }
  }, [authUser]);

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setAuthError("");

    try {
      const payload = authMode === "login"
        ? await loginUser(authForm)
        : await registerUser(authForm);
      setAuthUser(payload.user);
      setAuthForm(emptyAuthForm);
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
      setAuthUser(null);
      setAuthMode("login");
      setClasses([]);
      setActionError("");
      setConnection({ state: "checking", message: "Checking the API..." });
    } catch (error) {
      setAuthError(error.message);
    }
  }

  function openCreateForm() {
    setEditingClass(null);
    setFormOpen(true);
    setActionError("");
  }

  function showView(nextView) {
    setSelectedClass(null);
    setView(nextView);
  }

  function openClassDetails(classItem) {
    setPreviousView(view === "class-details" ? previousView : view);
    setSelectedClass(classItem);
    setView("class-details");
    setActionError("");
  }

  function openEditForm(classItem) {
    setEditingClass(classItem);
    setFormOpen(true);
    setActionError("");
  }

  async function saveClass(classData, classToUpdate = editingClass) {
    const savedClass = classToUpdate
      ? await updateClass(classToUpdate._id, classData)
      : await createClass(classData);

    if (classToUpdate && selectedClass?._id === savedClass._id) {
      setSelectedClass(savedClass);
    }

    setClasses((currentClasses) => sortClassesBySchedule(
      classToUpdate
        ? currentClasses.map((classItem) =>
            classItem._id === savedClass._id ? savedClass : classItem,
          )
        : [...currentClasses, savedClass],
    ));
    setFormOpen(false);
    setEditingClass(null);
    setActionError("");
  }

  async function removeClass(classItem) {
    const confirmed = window.confirm(
      `Delete ${classItem.subjectName}? All tasks attached to this class will also be permanently deleted.`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteClass(classItem._id);
      setClasses((currentClasses) =>
        currentClasses.filter((item) => item._id !== classItem._id),
      );
      if (selectedClass?._id === classItem._id) {
        setSelectedClass(null);
        setView("classes");
      }
      setActionError("");
    } catch (error) {
      setActionError(error.message);
    }
  }

  if (authChecking) {
    return (
      <main className="page-shell">
        <div className="page-content">
          <p className="loading-message" role="status">Checking your session...</p>
        </div>
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="page-shell">
        <div className="page-content" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
          <section style={{ width: "min(420px, 100%)", background: "#fff", borderRadius: "16px", padding: "2rem", boxShadow: "0 20px 45px rgba(15, 23, 42, 0.1)" }}>
            <p className="eyebrow">Workshop Schedule</p>
            <h1 style={{ margin: "0 0 1rem" }}>{authMode === "login" ? "Welcome back" : "Create your account"}</h1>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setAuthMode("login")}
                style={{ flex: 1, borderColor: authMode === "login" ? "#3b82f6" : "#d1d5db" }}
              >
                Log in
              </button>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setAuthMode("register")}
                style={{ flex: 1, borderColor: authMode === "register" ? "#3b82f6" : "#d1d5db" }}
              >
                Sign up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} style={{ display: "grid", gap: "1rem" }}>
              {authMode === "register" && (
                <label style={{ display: "grid", gap: "0.4rem" }}>
                  <span>Name</span>
                  <input
                    value={authForm.name}
                    onChange={(event) => setAuthForm((current) => ({ ...current, name: event.target.value }))}
                    type="text"
                    placeholder="Your name"
                    required={authMode === "register"}
                  />
                </label>
              )}

              <label style={{ display: "grid", gap: "0.4rem" }}>
                <span>Email</span>
                <input
                  value={authForm.email}
                  onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label style={{ display: "grid", gap: "0.4rem" }}>
                <span>Password</span>
                <input
                  value={authForm.password}
                  onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </label>

              {authError && <p className="form-error" role="alert">{authError}</p>}

              <button className="button button--primary" type="submit">
                {authMode === "login" ? "Log in" : "Create account"}
              </button>
            </form>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <AppHeader
        activeView={view === "class-details" ? "classes" : view}
        onViewChange={showView}
        onAddClass={openCreateForm}
        onLogout={handleLogout}
      />

      <div className="page-content">
        {view !== "class-details" && (
          <div className="page-heading">
            <div>
              <p className="eyebrow">Class schedule tracker</p>
              <h1>{view === "overview" ? "Your week at a glance" : view === "timetable" ? "Weekly timetable" : "Manage classes"}</h1>
            </div>
            <ConnectionStatus state={connection.state} message={connection.message} />
          </div>
        )}

        {loadError ? (
          <section className="error-panel" role="alert">
            <strong>Classes could not be loaded.</strong>
            <p>{loadError}</p>
            <button className="button button--secondary" type="button" onClick={loadClasses}>
              Try again
            </button>
          </section>
        ) : loading ? (
          <p className="loading-message" role="status">Loading your schedule...</p>
        ) : (
          <>
            {actionError && <p className="form-error" role="alert">{actionError}</p>}
            {view === "overview" && (
              <Dashboard
                classes={classes}
                onAddClass={openCreateForm}
                onSelectClass={openClassDetails}
                onNavigate={showView}
              />
            )}
            {view === "timetable" && (
              <Timetable classes={classes} onSelectClass={openClassDetails} />
            )}
            {view === "classes" && (
              <ClassManagement
                classes={classes}
                onAdd={openCreateForm}
                onEdit={openEditForm}
                onDelete={removeClass}
                onOpenTasks={openClassDetails}
              />
            )}
            {view === "class-details" && selectedClass && (
              <ClassDetails
                classItem={selectedClass}
                onBack={() => setView(previousView)}
                onEditClass={(classData) => saveClass(classData, selectedClass)}
              />
            )}
          </>
        )}
      </div>

      {formOpen && (
        <ClassForm
          classItem={editingClass}
          onClose={() => setFormOpen(false)}
          onSave={saveClass}
        />
      )}
    </main>
  );
}

export default App;
