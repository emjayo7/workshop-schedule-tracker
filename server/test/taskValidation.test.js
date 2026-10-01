import test from "node:test";
import assert from "node:assert/strict";
import { validateTaskInput } from "../utils/taskValidation.js";

const createdAt = new Date(2025, 2, 1, 12, 0);

test("requires a task title", () => {
  assert.equal(validateTaskInput({ title: " " }, { createdAt }), "Task title is required.");
});

test("accepts a title with an optional description and no due date", () => {
  assert.equal(validateTaskInput({ title: "Read chapter", description: "Notes", dueDate: null }, { createdAt }), null);
});

test("accepts a due date on or after the creation date", () => {
  assert.equal(validateTaskInput({ title: "Read chapter", dueDate: "2025-03-01" }, { createdAt }), null);
  assert.equal(validateTaskInput({ title: "Read chapter", dueDate: "2025-03-02" }, { createdAt }), null);
});

test("rejects invalid calendar dates and due dates before creation", () => {
  assert.equal(validateTaskInput({ title: "Read chapter", dueDate: "2025-02-29" }, { createdAt }), "Due date must be a valid calendar date.");
  assert.equal(validateTaskInput({ title: "Read chapter", dueDate: "2025-02-28" }, { createdAt }), "Due date cannot be before the task was created.");
});