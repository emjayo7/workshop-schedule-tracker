import { formatClassTime, getOverlappingClassIds, sortClassesBySchedule } from "../../utils/classUtils.js";
import "./ClassManagement.css";

function ClassManagement({ classes, onAdd, onEdit, onDelete }) {
  const overlapIds = getOverlappingClassIds(classes);
  const sortedClasses = sortClassesBySchedule(classes);

  return (
    <section className="class-management" aria-label="Manage classes">
      <div className="management-heading">
        <div>
          <p className="management-summary">
            {classes.length === 1 ? "1 class repeats" : `${classes.length} classes repeat`} every week.
          </p>
          {overlapIds.size > 0 && (
            <p className="management-overlap" role="status">
              {overlapIds.size} scheduled classes overlap. You can edit their times below.
            </p>
          )}
        </div>
        <button className="button button--primary" type="button" onClick={onAdd}>Add a class</button>
      </div>

      {sortedClasses.length === 0 ? (
        <div className="management-empty">
          <h2>No classes yet</h2>
          <p>Add a class to start building your weekly schedule.</p>
        </div>
      ) : (
        <ul className="class-list">
          {sortedClasses.map((classItem) => (
            <li className="class-row" key={classItem._id}>
              <div className="class-row-time">
                <strong>{classItem.dayOfWeek}</strong>
                <span>{formatClassTime(classItem.startTime)}–{formatClassTime(classItem.endTime)}</span>
              </div>
              <div className="class-row-subject">
                <strong>{classItem.subjectName}</strong>
                <span>{[classItem.room, classItem.teacher].filter(Boolean).join(" · ") || "No room or teacher added"}</span>
                {overlapIds.has(classItem._id) && <span className="overlap-inline">Overlapping time</span>}
              </div>
              <div className="class-row-actions">
                <button className="button button--secondary" type="button" onClick={() => onEdit(classItem)}>Edit</button>
                <button className="button button--danger" type="button" onClick={() => onDelete(classItem)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default ClassManagement;