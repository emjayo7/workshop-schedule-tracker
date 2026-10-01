import { getDueDateKey, getLocalDateKey, isValidDateOnly } from "./taskUtils.js";

export function validateTaskInput(input, {
  partial = false,
  createdAt = new Date(),
  creationDateKey,
} = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return "Task details are required.";
  }

  if (!partial || Object.hasOwn(input, "title")) {
    if (typeof input.title !== "string" || !input.title.trim()) {
      return "Task title is required.";
    }
  }

  if (Object.hasOwn(input, "description") && typeof input.description !== "string") {
    return "Description must be text.";
  }

  if (Object.hasOwn(input, "dueDate") && input.dueDate !== null && input.dueDate !== "") {
    if (typeof input.dueDate !== "string" || !isValidDateOnly(input.dueDate)) {
      return "Due date must be a valid calendar date.";
    }

    const creationDate = creationDateKey || getLocalDateKey(new Date(createdAt));
    if (!isValidDateOnly(creationDate)) {
      return "Task creation date must be a valid calendar date.";
    }

    if (getDueDateKey(input.dueDate) < creationDate) {
      return "Due date cannot be before the task was created.";
    }
  }

  if (partial && !["title", "description", "dueDate"].some((field) => Object.hasOwn(input, field))) {
    return "Include a task field to update.";
  }

  return null;
}