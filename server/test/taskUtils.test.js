import test from "node:test";
import assert from "node:assert/strict";
import { getDueDateKey, getTaskStatus, isValidDateOnly } from "../utils/taskUtils.js";

test("validates date-only due dates as real calendar days", () => {
  assert.equal(isValidDateOnly("2024-02-29"), true);
  assert.equal(isValidDateOnly("2025-02-29"), false);
  assert.equal(isValidDateOnly("2025-13-01"), false);
});

test("treats due dates as calendar dates without local timezone shifts", () => {
  assert.equal(getDueDateKey(new Date("2025-03-01T00:00:00.000Z")), "2025-03-01");
  assert.equal(getDueDateKey(null), null);
});

test("returns completed before checking the due date", () => {
  assert.equal(
    getTaskStatus({ completed: true, dueDate: "2025-02-28" }, "2025-03-01"),
    "completed",
  );
});

test("calculates pending, overdue, and no-due-date states", () => {
  assert.equal(getTaskStatus({ completed: false, dueDate: "2025-03-01" }, "2025-03-01"), "pending");
  assert.equal(getTaskStatus({ completed: false, dueDate: "2025-02-28" }, "2025-03-01"), "overdue");
  assert.equal(getTaskStatus({ completed: false, dueDate: null }, "2025-03-01"), "pending");
});