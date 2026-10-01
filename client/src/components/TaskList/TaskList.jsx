import { formatTaskDueDate } from "../../utils/taskUtils.js";
import "./TaskList.css";

function TaskList({ title, status, tasks, busyTaskId, onToggle, onEdit, onDelete }) {
  return (
    <section className={`task-group task-group--${status}`}>
      <div className="task-group-heading">
        <h3>{title}</h3>
        <span>{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p className="task-group-empty">Nothing here.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li className={`task-row task-row--${status}`} key={task._id}>
              <input
                className="task-checkbox"
                type="checkbox"
                checked={task.completed}
                disabled={busyTaskId === task._id}
                aria-label={`${task.completed ? "Mark incomplete" : "Mark complete"}: ${task.title}`}
                onChange={() => onToggle(task)}
              />
              <div className="task-row-content">
                <strong>{task.title}</strong>
                <span className="task-due-date">
                  {status === "overdue" ? "Overdue · " : "Due · "}{formatTaskDueDate(task.dueDate)}
                </span>
                {task.description && <p>{task.description}</p>}
              </div>
              <div className="task-row-actions">
                <button className="task-action" type="button" disabled={busyTaskId === task._id} onClick={() => onEdit(task)}>Edit</button>
                <button className="task-action task-action--delete" type="button" disabled={busyTaskId === task._id} onClick={() => onDelete(task)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default TaskList;