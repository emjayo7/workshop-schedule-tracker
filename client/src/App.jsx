import { useEffect, useState } from "react";
import AppHeader from "./components/AppHeader/AppHeader.jsx";
import ConnectionStatus from "./components/ConnectionStatus/ConnectionStatus.jsx";
import Dashboard from "./components/Dashboard/Dashboard.jsx";
import Timetable from "./components/Timetable/Timetable.jsx";
import ClassManagement from "./components/ClassManagement/ClassManagement.jsx";
import ClassForm from "./components/ClassForm/ClassForm.jsx";
import {
  createClass,
  deleteClass,
  fetchClasses,
  fetchHealth,
  updateClass,
} from "./services/api.js";
import { sortClassesBySchedule } from "./utils/classUtils.js";

function App() {
  const [classes, setClasses] = useState([]);
  const [view, setView] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [connection, setConnection] = useState({
    state: "checking",
    message: "Checking the API...",
  });

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
    loadClasses();
  }, []);

  function openCreateForm() {
    setEditingClass(null);
    setFormOpen(true);
    setActionError("");
  }

  function openEditForm(classItem) {
    setEditingClass(classItem);
    setFormOpen(true);
    setActionError("");
  }

  async function saveClass(classData) {
    const savedClass = editingClass
      ? await updateClass(editingClass._id, classData)
      : await createClass(classData);

    setClasses((currentClasses) => sortClassesBySchedule(
      editingClass
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
      `Delete ${classItem.subjectName} from your weekly schedule?`,
    );
    if (!confirmed) {
      return;
    }

    try {
      await deleteClass(classItem._id);
      setClasses((currentClasses) =>
        currentClasses.filter((item) => item._id !== classItem._id),
      );
      setActionError("");
    } catch (error) {
      setActionError(error.message);
    }
  }

  return (
    <main className="page-shell">
      <AppHeader activeView={view} onViewChange={setView} onAddClass={openCreateForm} />

      <div className="page-content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Class schedule tracker</p>
            <h1>{view === "overview" ? "Your week at a glance" : view === "timetable" ? "Weekly timetable" : "Manage classes"}</h1>
          </div>
          <ConnectionStatus state={connection.state} message={connection.message} />
        </div>

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
            {view === "overview" && <Dashboard classes={classes} onAddClass={openCreateForm} />}
            {view === "timetable" && <Timetable classes={classes} />}
            {view === "classes" && (
              <ClassManagement
                classes={classes}
                onAdd={openCreateForm}
                onEdit={openEditForm}
                onDelete={removeClass}
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
