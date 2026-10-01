import ClassScheduleList from "../ClassScheduleList/ClassScheduleList.jsx";
import { getTodayClasses, getUpcomingClasses } from "../../utils/classUtils.js";
import "./Dashboard.css";

function Dashboard({ classes, onAddClass, onSelectClass }) {
  const now = new Date();
  const todayClasses = getTodayClasses(classes, now);
  const upcomingClasses = getUpcomingClasses(classes, now);
  const dateLabel = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="dashboard-view">
      <section className="dashboard-intro">
        <div>
          <p className="today-date">{dateLabel}</p>
          <h2>Make room for what matters.</h2>
        </div>
        <button className="button button--primary" type="button" onClick={onAddClass}>
          <span aria-hidden="true">+</span> Add a class
        </button>
      </section>

      <section className="dashboard-stats" aria-label="Schedule summary">
        <div className="stat-item">
          <span>Classes today</span>
          <strong>{todayClasses.length}</strong>
        </div>
        <div className="stat-item">
          <span>Classes this week</span>
          <strong>{classes.length}</strong>
        </div>
        <div className="stat-item">
          <span>Next session</span>
          <strong className="stat-next">{upcomingClasses[0]?.subjectName || "None scheduled"}</strong>
        </div>
      </section>

      {classes.length === 0 ? (
        <section className="empty-schedule">
          <p className="eyebrow">Start with one class</p>
          <h2>Your weekly schedule is empty.</h2>
          <p>Add a recurring class to see today’s sessions and your week ahead.</p>
          <button className="button button--primary" type="button" onClick={onAddClass}>Add your first class</button>
        </section>
      ) : (
        <div className="dashboard-columns">
          <section className="schedule-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Today</p>
                <h2>Today's classes</h2>
              </div>
              <span className="count-label">{todayClasses.length}</span>
            </div>
            <ClassScheduleList classes={todayClasses} emptyMessage="No classes scheduled for today." onSelectClass={onSelectClass} />
          </section>

          <section className="schedule-section">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Coming up</p>
                <h2>Next sessions</h2>
              </div>
            </div>
            <ClassScheduleList classes={upcomingClasses} emptyMessage="No upcoming classes in your weekly schedule." showDay onSelectClass={onSelectClass} />
          </section>
        </div>
      )}
    </div>
  );
}

export default Dashboard;