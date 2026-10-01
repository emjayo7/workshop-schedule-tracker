import test from "node:test";
import assert from "node:assert/strict";
import {
  filterTasksByStatus,
  getDueDateKey,
  getLocalDateKey,
  getTaskStatus,
  isValidDateOnly,
  toggleTaskCompletion,
} from "../utils/taskUtils.js";

test("validates date-only due dates as real calendar days", () => {
  assert.equal(isValidDateOnly("2024-02-29"), true);
  assert.equal(isValidDateOnly("2025-02-29"), false);
  assert.equal(isValidDateOnly("2025-13-01"), false);
});

test("treats due dates as calendar dates without local timezone shifts", () => {
  assert.equal(getDueDateKey(new Date("2025-03-01T00:00:00.000Z")), "2025-03-01");
  assert.equal(getDueDateKey(null), null);
});

const today = "2026-10-01";

test("uses the local calendar fields for today's key", () => {
  assert.equal(getLocalDateKey(new Date(2026, 9, 1, 12, 0)), today);
});

test("classifies yesterday, today, tomorrow, and no due date", () => {
  assert.equal(getTaskStatus({ completed: false, dueDate: "2026-09-30" }, today), "overdue");
  assert.equal(getTaskStatus({ completed: false, dueDate: "2026-10-01" }, today), "pending");
  assert.equal(getTaskStatus({ completed: false, dueDate: "2026-10-02" }, today), "pending");
  assert.equal(getTaskStatus({ completed: false, dueDate: null }, today), "pending");
});

test("completed tasks stay completed regardless of due date", () => {
  for (const dueDate of ["2026-09-20", today, "2026-10-10"]) {
    assert.equal(getTaskStatus({ completed: true, dueDate }, today), "completed");
  }
});

test("classifies UTC-midnight due dates by their calendar day", () => {
  assert.equal(getTaskStatus({ completed: false, dueDate: new Date("2026-09-30T00:00:00.000Z") }, today), "overdue");
  assert.equal(getTaskStatus({ completed: false, dueDate: new Date("2026-10-01T00:00:00.000Z") }, today), "pending");
});

test("filters pending, overdue, and completed tasks using the supplied local date", () => {
  const tasks = [
    { _id: "yesterday", completed: false, dueDate: "2026-09-30" },
    { _id: "today", completed: false, dueDate: today },
    { _id: "no-date", completed: false, dueDate: null },
    { _id: "completed-past", completed: true, dueDate: "2026-09-20" },
    { _id: "completed-today", completed: true, dueDate: today },
    { _id: "completed-future", completed: true, dueDate: "2026-10-10" },
  ];

  assert.deepEqual(filterTasksByStatus(tasks, "pending", today).map((task) => task._id), ["today", "no-date"]);
  assert.deepEqual(filterTasksByStatus(tasks, "overdue", today).map((task) => task._id), ["yesterday"]);
  assert.deepEqual(filterTasksByStatus(tasks, "completed", today).map((task) => task._id), [
    "completed-past",
    "completed-today",
    "completed-future",
  ]);
  assert.deepEqual(filterTasksByStatus(tasks, undefined, today).map((task) => task._id), [
    "yesterday",
    "today",
    "no-date",
  ]);
});

test("completing records the supplied timestamp and uncompleting clears it", () => {
  const task = { completed: false, completedAt: null };
  const completedAt = new Date("2026-10-01T12:30:00.000Z");

  toggleTaskCompletion(task, completedAt);
  assert.equal(task.completed, true);
  assert.equal(task.completedAt, completedAt);

  toggleTaskCompletion(task, new Date("2026-10-01T12:31:00.000Z"));
  assert.equal(task.completed, false);
  assert.equal(task.completedAt, null);
});

test("reading task status does not modify completion timestamps", () => {
  const task = {
    completed: true,
    completedAt: new Date("2026-10-01T12:30:00.000Z"),
    dueDate: "2026-09-20",
  };
  const completedAt = task.completedAt;

  assert.equal(getTaskStatus(task, today), "completed");
  assert.equal(task.completedAt, completedAt);
});