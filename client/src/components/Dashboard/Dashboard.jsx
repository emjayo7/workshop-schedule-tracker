import { useEffect, useState } from "react";
import ClassScheduleList from "../ClassScheduleList/ClassScheduleList.jsx";
import { fetchTasks, toggleTask } from "../../services/api.js";
import { formatTaskDueDate, getTaskStatus } from "../../utils/taskUtils.js";
import { deriveDashboardData } from "../../utils/dashboardUtils.js";
import "./Dashboard.css";

function Dashboard({ classes, onAddClass, onSelectClass, onNavigate }) {
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState("");
  const [busyTaskId, setBusyTaskId] = useState("");
  const [reloadTasks, setReloadTasks] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setTasksLoading(true);
    setTasksError("");

    Promise.all([fetchTasks(), fetchTasks("completed")])
      .then(([activeTasks, completedTasks]) => {
        if (isMounted) {
          setTasks([...activeTasks, ...completedTasks]);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setTasksError(error.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setTasksLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [reloadTasks]);

  const now = new Date();
  const data = deriveDashboardData(classes, tasks, now);
  const todayLabel = now.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const classById = new Map(classes.map((classItem) => [String(classItem._id), classItem]));

  async function completeTask(task) {
    setBusyTaskId(task._id);
    setTasksError("");

    try {
      const updatedTask = await toggleTask(task._id);
      setTasks((currentTasks) => currentTasks.map((currentTask) =>
        currentTask._id === updatedTask._id ? updatedTask : currentTask,
      ));
    } catch (error) {
      setTasksError(error.message);
    } finally {
      setBusyTaskId("");
    }
  }

  function retryTasks() {
    setReloadTasks((currentAttempt) => currentAttempt + 1);
  }

  return (
    <div className="dashboard-view">
      <section className="dashboard-intro">
        <div>
          <p className="today-date">{todayLabel}</p>
          <h2>Make room for what matters.</h2>
        </div>
        <button className="button button--primary" type="button" onClick={onAddClass}>
          <span aria-hidden="true">+</span> Add a class
        </button>
      </section>

      <nav className="dashboard-quick-actions" aria-label="Schedule shortcuts">
        <span>Go to</span>
        <button className="button button--secondary" type="button" onClick={() => onNavigate("timetable")}>
          View timetable
        </button>
        <button className="button button--secondary" type="button" onClick={() => onNavigate("classes")}>
          View classes
        </button>
      </nav>

      <section className="dashboard-class-grid" aria-label="Today's and upcoming classes">
        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Today</p>
              <h2>Today's classes</h2>
            </div>
            <span className="count-label">{data.todayClasses.length}</span>
          </div>
          <ClassScheduleList
            classes={data.todayClasses}
            emptyMessage="No classes scheduled for today."
            highlightClassId={data.currentClass?._id}
            highlightLabel="Happening now"
            onSelectClass={onSelectClass}
          />
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Coming up</p>
              <h2>Upcoming classes</h2>
            </div>
          </div>
          <ClassScheduleList
            classes={data.upcomingClasses}
            emptyMessage="No upcoming classes in your weekly schedule."
            showDay
            highlightClassId={data.upcomingClasses[0]?._id}
            highlightLabel="Next up"
            onSelectClass={onSelectClass}
          />
        </section>
      </section>

      <section className="dashboard-section task-overview-section" aria-labelledby="task-overview-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Classwork</p>
            <h2 id="task-overview-title">Task overview</h2>
          </div>
        </div>

        {tasksError && (
          <div className="dashboard-error" role="alert">
            <p>Task information could not be loaded: {tasksError}</p>
            <button className="button button--secondary" type="button" onClick={retryTasks}>Try again</button>
          </div>
        )}

        {tasksLoading ? (
          <p className="dashboard-loading" role="status">Loading task information...</p>
        ) : !tasksError && (
          <>
            <div className="task-counts" aria-label="Task counts">
              <div className="task-count task-count--pending">
                <span>Pending</span>
                <strong>{data.taskCounts.pending}</strong>
              </div>
              <div className="task-count task-count--overdue">
                <span>Overdue</span>
                <strong>{data.taskCounts.overdue}</strong>
              </div>
              <div className="task-count task-count--completed">
                <span>Completed</span>
                <strong>{data.taskCounts.completed}</strong>
              </div>
              <div className="task-count task-count--completed-today">
                <span>Completed today</span>
                <strong>{data.taskCounts.completedToday}</strong>
              </div>
            </div>

            <div className="dashboard-lower-grid">
              <section className="attention-section" aria-labelledby="attention-title">
                <div className="section-heading section-heading--compact">
                  <div>
                    <p className="eyebrow">Action needed</p>
                    <h3 id="attention-title">Tasks requiring attention</h3>
                  </div>
                  <span className="count-label">{data.attentionTasks.length}</span>
                </div>

                {data.attentionTasks.length === 0 ? (
                  <p className="dashboard-empty-tasks">
                    {data.taskCounts.total === 0
                      ? "No tasks yet. Add tasks from a class to see them here."
                      : "Nothing needs your attention right now."}
                  </p>
                ) : (
                  <ul className="attention-list">
                    {data.attentionTasks.map((task) => {
                      const classItem = classById.get(String(task.classId));
                      const taskStatus = getTaskStatus(task, data.today);

                      return (
                        <li className={`attention-task attention-task--${taskStatus}`} key={task._id}>
                          <input
                            className="attention-checkbox"
                            type="checkbox"
                            checked={task.completed}
                            disabled={busyTaskId === task._id}
                            aria-label={`Mark complete: ${task.title}`}
                            onChange={() => completeTask(task)}
                          />
                          <div className="attention-task-info">
                            {classItem ? (
                              <button className="attention-task-title" type="button" onClick={() => onSelectClass(classItem)}>
                                {task.title}
                              </button>
                            ) : (
                              <strong className="attention-task-title-text">{task.title}</strong>
                            )}
                            <span className="attention-task-class">{classItem?.subjectName || "Class unavailable"}</span>
                            <span className={`attention-task-status attention-task-status--${taskStatus}`}>
                              {taskStatus === "overdue" ? "Overdue" : "Pending"}
                              {task.dueDate ? ` · Due ${formatTaskDueDate(task.dueDate)}` : " · No due date"}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="weekly-progress" aria-labelledby="weekly-progress-title">
                <div className="section-heading section-heading--compact">
                  <div>
                    <p className="eyebrow">Across your classes</p>
                    <h3 id="weekly-progress-title">Weekly progress</h3>
                  </div>
                </div>
                {data.taskCounts.total === 0 ? (
                  <p className="dashboard-empty-tasks">Add class tasks to see your progress.</p>
                ) : (
                  <>
                    <div className="progress-label">
                      <strong>{data.taskCounts.completed} of {data.taskCounts.total} completed</strong>
                      <span>{Math.round(data.taskCounts.completionRatio * 100)}%</span>
                    </div>
                    <progress
                      className="weekly-progress-bar"
                      value={data.taskCounts.completed}
                      max={data.taskCounts.total}
                      aria-label={`${data.taskCounts.completed} of ${data.taskCounts.total} tasks completed`}
                    />
                    <dl className="progress-breakdown">
                      <div><dt>Remaining</dt><dd>{data.taskCounts.remaining}</dd></div>
                      <div><dt>Overdue</dt><dd>{data.taskCounts.overdue}</dd></div>
                      <div><dt>Classes this week</dt><dd>{classes.length}</dd></div>
                    </dl>
                  </>
                )}
              </section>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Dashboard;