const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateOnly(value) {
  if (typeof value !== "string" || !dateOnlyPattern.test(value)) {
    return false;
  }

  const parsedDate = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === value;
}

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDueDateKey(dueDate) {
  if (!dueDate) {
    return null;
  }

  if (dueDate instanceof Date) {
    return Number.isNaN(dueDate.getTime()) ? null : dueDate.toISOString().slice(0, 10);
  }

  if (typeof dueDate === "string" && isValidDateOnly(dueDate)) {
    return dueDate;
  }

  const parsedDate = new Date(dueDate);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString().slice(0, 10);
}

export function getTaskStatus(task, today = getLocalDateKey()) {
  if (task.completed) {
    return "completed";
  }

  const dueDateKey = getDueDateKey(task.dueDate);
  return dueDateKey && dueDateKey < today ? "overdue" : "pending";
}

export function filterTasksByStatus(tasks, status, today = getLocalDateKey()) {
  return tasks.filter((task) => {
    const taskStatus = getTaskStatus(task, today);
    return status ? taskStatus === status : taskStatus !== "completed";
  });
}

export function toggleTaskCompletion(task, completedAt = new Date()) {
  task.completed = !task.completed;
  task.completedAt = task.completed ? completedAt : null;
  return task;
}