import { formatClassTime } from "../../utils/classUtils.js";
import "./ClassScheduleList.css";

function ClassScheduleList({ classes, emptyMessage, showDay = false, onSelectClass }) {
  if (classes.length === 0) {
    return <p className="schedule-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="schedule-list">
      {classes.map((classItem) => (
        <li className="schedule-item" key={classItem._id}>
          <time className="schedule-time">
            {formatClassTime(classItem.startTime)}
            <span>{formatClassTime(classItem.endTime)}</span>
          </time>
          <div className="schedule-info">
            <button className="schedule-class-open" type="button" onClick={() => onSelectClass(classItem)}>
              {classItem.subjectName}
              <span>View tasks</span>
            </button>
            <span>
              {showDay ? `${classItem.dayOfWeek} · ` : ""}
              {[classItem.room, classItem.teacher].filter(Boolean).join(" · ") || "Class session"}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default ClassScheduleList;