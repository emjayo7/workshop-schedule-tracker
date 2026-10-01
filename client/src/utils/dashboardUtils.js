import {
  getCurrentClass,
  getTodayClasses,
  getUpcomingClasses,
} from "./classUtils.js";
import {
  getLocalTodayKey,
  getTaskCompletedDateKey,
  getTaskGroups,
} from "./taskUtils.js";

export function deriveDashboardData(classes, tasks, now = new Date()) {
  const today = getLocalTodayKey(now);
  const taskGroups = getTaskGroups(tasks, today);
  const remainingTasks = taskGroups.pending.length + taskGroups.overdue.length;
  const totalTasks = tasks.length;
  const completedToday = tasks.filter((task) =>
    task.completed && getTaskCompletedDateKey(task.completedAt) === today,
  ).length;

  return {
    today,
    currentClass: getCurrentClass(classes, now),
    todayClasses: getTodayClasses(classes, now),
    upcomingClasses: getUpcomingClasses(classes, now),
    taskGroups,
    attentionTasks: [...taskGroups.overdue, ...taskGroups.pending].slice(0, 5),
    taskCounts: {
      pending: taskGroups.pending.length,
      overdue: taskGroups.overdue.length,
      completed: taskGroups.completed.length,
      completedToday,
      total: totalTasks,
      remaining: remainingTasks,
      completionRatio: totalTasks === 0 ? null : taskGroups.completed.length / totalTasks,
    },
  };
}