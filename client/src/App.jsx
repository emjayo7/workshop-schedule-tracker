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
  fetchHealth,
  updateClass,
} from "./services/api.js";
import { sortClassesBySchedule } from "./utils/classUtils.js";

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

  return (
    <main className="page-shell">
      <AppHeader
        activeView={view === "class-details" ? "classes" : view}
        onViewChange={showView}
        onAddClass={openCreateForm}
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
