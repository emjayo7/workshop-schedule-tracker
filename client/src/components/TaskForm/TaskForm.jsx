import { useState } from "react";
import {
  getCreatedDateKey,
  getLocalTodayKey,
  getTaskDueDateKey,
  validateTaskInput,
} from "../../utils/taskUtils.js";
import "./TaskForm.css";

function TaskForm({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    dueDate: getTaskDueDateKey(task?.dueDate),
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const earliestDueDate = task?.createdAt
    ? getCreatedDateKey(task.createdAt)
    : getLocalTodayKey();

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateTaskInput(form, task?.createdAt);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate || null,
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="task-form-dialog" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Classwork</p>
            <h2 id="task-form-title">{task ? "Edit task" : "Add a task"}</h2>
          </div>
          <button className="close-button" type="button" aria-label="Close form" onClick={onClose}>×</button>
        </div>

        <form className="task-form" onSubmit={handleSubmit}>
          <label>
            Task title
            <input autoFocus name="title" value={form.title} onChange={updateField} required maxLength={160} />
          </label>

          <label>
            Description <span>(optional)</span>
            <textarea name="description" value={form.description} onChange={updateField} rows="4" maxLength={2000} />
          </label>

          <label>
            Due date <span>(optional)</span>
            <input type="date" name="dueDate" value={form.dueDate} min={earliestDueDate} onChange={updateField} />
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-actions">
            <button className="button button--secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button button--primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : task ? "Save changes" : "Add task"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default TaskForm;