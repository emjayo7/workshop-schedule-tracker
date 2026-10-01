const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export function getLocalTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTaskDueDateKey(dueDate) {
  if (!dueDate) {
    return "";
  }

  if (typeof dueDate === "string" && dateOnlyPattern.test(dueDate)) {
    return dueDate;
  }

  const parsedDate = new Date(dueDate);
  return Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString().slice(0, 10);
}

export function getTaskStatus(task, today = getLocalTodayKey()) {
  if (task.completed) {
    return "completed";
  }

  const dueDate = getTaskDueDateKey(task.dueDate);
  return dueDate && dueDate < today ? "overdue" : "pending";
}

export function getTaskGroups(tasks, today = getLocalTodayKey()) {
  const groups = { overdue: [], pending: [], completed: [] };

  for (const task of tasks) {
    groups[getTaskStatus(task, today)].push(task);
  }

  for (const group of Object.values(groups)) {
    group.sort((first, second) => {
      const firstDueDate = getTaskDueDateKey(first.dueDate) || "9999-12-31";
      const secondDueDate = getTaskDueDateKey(second.dueDate) || "9999-12-31";
      return firstDueDate.localeCompare(secondDueDate)
        || first.createdAt.localeCompare(second.createdAt);
    });
  }

  return groups;
}

export function getCreatedDateKey(createdAt) {
  if (!createdAt) {
    return getLocalTodayKey();
  }

  return getLocalTodayKey(new Date(createdAt));
}

export function getTaskCompletedDateKey(completedAt) {
  if (!completedAt) {
    return "";
  }

  const completionDate = new Date(completedAt);
  return Number.isNaN(completionDate.getTime()) ? "" : getLocalTodayKey(completionDate);
}

export function formatTaskDueDate(dueDate) {
  const dateKey = getTaskDueDateKey(dueDate);
  if (!dateKey) {
    return "No due date";
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function validateTaskInput(taskData, createdAt) {
  if (typeof taskData.title !== "string" || !taskData.title.trim()) {
    return "Task title is required.";
  }

  if (typeof taskData.description !== "string") {
    return "Description must be text.";
  }

  if (taskData.dueDate && !dateOnlyPattern.test(taskData.dueDate)) {
    return "Enter a valid due date.";
  }

  if (taskData.dueDate && taskData.dueDate < getCreatedDateKey(createdAt)) {
    return "Due date cannot be before the task was created.";
  }

  return "";
}