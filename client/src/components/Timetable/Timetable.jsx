import { DAYS_OF_WEEK, getOverlappingClassIds, sortClassesBySchedule } from "../../utils/classUtils.js";
import { formatClassTime } from "../../utils/classUtils.js";
import "./Timetable.css";

function Timetable({ classes, onSelectClass }) {
  const overlapIds = getOverlappingClassIds(classes);
  const sortedClasses = sortClassesBySchedule(classes);

  return (
    <section className="timetable-view" aria-label="Weekly class timetable">
      <div className="timetable-intro">
        <p>Classes repeat each week. Select “Classes” to add or update your schedule.</p>
        {overlapIds.size > 0 && (
          <p className="overlap-warning" role="status">
            <span aria-hidden="true">!</span>
            {overlapIds.size} {overlapIds.size === 1 ? "class is" : "classes are"} in an overlapping time slot. Review the marked sessions.
          </p>
        )}
      </div>

      <div className="week-grid">
        {DAYS_OF_WEEK.map((day) => {
          const dayClasses = sortedClasses.filter((classItem) => classItem.dayOfWeek === day);

          return (
            <section className="day-column" key={day} aria-labelledby={`day-${day}`}>
              <h2 id={`day-${day}`} className="day-heading">{day}</h2>
              {dayClasses.length === 0 ? (
                <p className="empty-day">No classes</p>
              ) : (
                <ol className="day-class-list">
                  {dayClasses.map((classItem) => (
                    <li className={`timetable-class${overlapIds.has(classItem._id) ? " timetable-class--overlap" : ""}`} key={classItem._id}>
                      <time className="timetable-class-time">
                        {formatClassTime(classItem.startTime)}
                        <span>{formatClassTime(classItem.endTime)}</span>
                      </time>
                      <button className="timetable-class-open" type="button" onClick={() => onSelectClass(classItem)}>
                        {classItem.subjectName}
                        <span>View tasks</span>
                      </button>
                      {(classItem.room || classItem.teacher) && (
                        <span className="timetable-class-detail">
                          {[classItem.room, classItem.teacher].filter(Boolean).join(" · ")}
                        </span>
                      )}
                      {overlapIds.has(classItem._id) && <span className="overlap-label">Time overlap</span>}
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}

export default Timetable;