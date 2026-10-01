import { useEffect, useState } from "react";
import ClassForm from "../ClassForm/ClassForm.jsx";
import TaskForm from "../TaskForm/TaskForm.jsx";
import TaskList from "../TaskList/TaskList.jsx";
import {
  createTask,
  deleteTask,
  fetchClassTasks,
  toggleTask,
  updateTask,
} from "../../services/api.js";
import { formatClassTime } from "../../utils/classUtils.js";
import { getTaskGroups } from "../../utils/taskUtils.js";
import "./ClassDetails.css";

function ClassDetails({ classItem, onBack, onEditClass }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingClass, setEditingClass] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState("");

  useEffect(() => {
    let isCurrentClass = true;
    setLoading(true);
    setLoadError("");

    fetchClassTasks(classItem._id)
      .then((taskData) => {
        if (isCurrentClass) {
          setTasks(taskData);
        }
      })
      .catch((error) => {
        if (isCurrentClass) {
          setLoadError(error.message);
        }
      })
      .finally(() => {
        if (isCurrentClass) {
          setLoading(false);
        }
      });

    return () => {
      isCurrentClass = false;
    };
  }, [classItem._id]);

  const taskGroups = getTaskGroups(tasks);
  const activeTaskCount = taskGroups.pending.length + taskGroups.overdue.length;

  function openCreateTask() {
    setEditingTask(null);
    setFormOpen(true);
    setActionError("");
  }

  function openEditTask(task) {
    setEditingTask(task);
    setFormOpen(true);
    setActionError("");
  }

  async function saveTask(taskData) {
    const savedTask = editingTask
      ? await updateTask(editingTask._id, taskData, editingTask.createdAt)
      : await createTask(classItem._id, taskData);

    setTasks((currentTasks) => editingTask
      ? currentTasks.map((task) => task._id === savedTask._id ? savedTask : task)
      : [savedTask, ...currentTasks]);
    setFormOpen(false);
    setEditingTask(null);
    setActionError("");
  }

  async function changeTaskCompletion(task) {
    setBusyTaskId(task._id);
    setActionError("");
    try {
      const updatedTask = await toggleTask(task._id);
      setTasks((currentTasks) => currentTasks.map((item) =>
        item._id === updatedTask._id ? updatedTask : item,
      ));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyTaskId("");
    }
  }

  async function removeTask(task) {
    if (!window.confirm(`Delete “${task.title}”?`)) {
      return;
    }

    setBusyTaskId(task._id);
    setActionError("");
    try {
      await deleteTask(task._id);
      setTasks((currentTasks) => currentTasks.filter((item) => item._id !== task._id));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setBusyTaskId("");
    }
  }

  return (
    <section className="class-details-view">
      <button className="back-link" type="button" onClick={onBack}>← Back to schedule</button>

      <header className="class-details-heading">
        <div>
          <p className="eyebrow">Class details</p>
          <h1>{classItem.subjectName}</h1>
          <p className="class-details-time">
            {classItem.dayOfWeek} · {formatClassTime(classItem.startTime)}–{formatClassTime(classItem.endTime)}
          </p>
        </div>
        <button className="button button--secondary" type="button" onClick={() => setEditingClass(true)}>
          Edit class
        </button>
      </header>

      <div className="class-details-meta">
        <span><strong>Room</strong>{classItem.room || "Not set"}</span>
        <span><strong>Teacher</strong>{classItem.teacher || "Not set"}</span>
      </div>

      <section className="class-tasks-section" aria-labelledby="class-tasks-title">
        <div className="class-tasks-heading">
          <div>
            <p className="eyebrow">Coursework</p>
            <h2 id="class-tasks-title">Tasks</h2>
            <p>{activeTaskCount} active · {taskGroups.completed.length} completed</p>
          </div>
          <button className="button button--primary" type="button" onClick={openCreateTask}>
            <span aria-hidden="true">+</span> Add task
          </button>
        </div>

        {actionError && <p className="form-error task-action-error" role="alert">{actionError}</p>}
        {loadError && (
          <div className="task-load-error" role="alert">
            <p>{loadError}</p>
            <button className="button button--secondary" type="button" onClick={() => window.location.reload()}>
              Reload class details
            </button>
          </div>
        )}
        {loading ? (
          <p className="task-loading" role="status">Loading tasks...</p>
        ) : !loadError && tasks.length === 0 ? (
          <div className="task-empty-state">
            <h3>No tasks for this class yet</h3>
            <p>Homework stays attached to this class until you complete or delete it.</p>
            <button className="button button--secondary" type="button" onClick={openCreateTask}>Add the first task</button>
          </div>
        ) : !loadError && (
          <div className="task-groups">
            <TaskList title="Overdue" status="overdue" tasks={taskGroups.overdue} busyTaskId={busyTaskId} onToggle={changeTaskCompletion} onEdit={openEditTask} onDelete={removeTask} />
            <TaskList title="Pending" status="pending" tasks={taskGroups.pending} busyTaskId={busyTaskId} onToggle={changeTaskCompletion} onEdit={openEditTask} onDelete={removeTask} />
            <TaskList title="Completed" status="completed" tasks={taskGroups.completed} busyTaskId={busyTaskId} onToggle={changeTaskCompletion} onEdit={openEditTask} onDelete={removeTask} />
          </div>
        )}
      </section>

      {formOpen && (
        <TaskForm
          task={editingTask}
          onClose={() => setFormOpen(false)}
          onSave={saveTask}
        />
      )}
      {editingClass && (
        <ClassForm
          classItem={classItem}
          onClose={() => setEditingClass(false)}
          onSave={async (classData) => {
            await onEditClass(classData);
            setEditingClass(false);
          }}
        />
      )}
    </section>
  );
}

export default ClassDetails;