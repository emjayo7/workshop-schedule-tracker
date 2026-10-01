import { useState } from "react";
import { DAYS_OF_WEEK, validateClassInput } from "../../utils/classUtils.js";
import "./ClassForm.css";

function ClassForm({ classItem, onClose, onSave }) {
  const [form, setForm] = useState({
    subjectName: classItem?.subjectName || "",
    dayOfWeek: classItem?.dayOfWeek || "Monday",
    startTime: classItem?.startTime || "09:00",
    endTime: classItem?.endTime || "10:00",
    room: classItem?.room || "",
    teacher: classItem?.teacher || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateClassInput(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({
        ...form,
        subjectName: form.subjectName.trim(),
        room: form.room.trim(),
        teacher: form.teacher.trim(),
      });
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <section className="class-form-dialog" role="dialog" aria-modal="true" aria-labelledby="class-form-title">
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Weekly schedule</p>
            <h2 id="class-form-title">{classItem ? "Edit class" : "Add a class"}</h2>
          </div>
          <button className="close-button" type="button" aria-label="Close form" onClick={onClose}>×</button>
        </div>

        <form className="class-form" onSubmit={handleSubmit}>
          <label>
            Subject name
            <input autoFocus name="subjectName" value={form.subjectName} onChange={updateField} required maxLength={100} />
          </label>

          <label>
            Day of the week
            <select name="dayOfWeek" value={form.dayOfWeek} onChange={updateField} required>
              {DAYS_OF_WEEK.map((day) => <option key={day}>{day}</option>)}
            </select>
          </label>

          <div className="time-fields">
            <label>
              Starts
              <input type="time" name="startTime" value={form.startTime} onChange={updateField} required />
            </label>
            <label>
              Ends
              <input type="time" name="endTime" value={form.endTime} onChange={updateField} required />
            </label>
          </div>

          <div className="optional-fields">
            <label>
              Room <span>(optional)</span>
              <input name="room" value={form.room} onChange={updateField} maxLength={80} />
            </label>
            <label>
              Teacher <span>(optional)</span>
              <input name="teacher" value={form.teacher} onChange={updateField} maxLength={100} />
            </label>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}

          <div className="form-actions">
            <button className="button button--secondary" type="button" onClick={onClose}>Cancel</button>
            <button className="button button--primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : classItem ? "Save changes" : "Add class"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default ClassForm;