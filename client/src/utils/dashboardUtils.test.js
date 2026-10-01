import test from "node:test";
import assert from "node:assert/strict";
import { deriveDashboardData } from "./dashboardUtils.js";

test("sorts today's classes and upcoming sessions by local weekday and time", () => {
  const now = new Date(2026, 8, 24, 14, 0);
  const classes = [
    { _id: "later", dayOfWeek: "Thursday", startTime: "17:00", endTime: "18:00" },
    { _id: "today-first", dayOfWeek: "Thursday", startTime: "15:00", endTime: "16:00" },
    { _id: "today-past", dayOfWeek: "Thursday", startTime: "09:00", endTime: "10:00" },
    { _id: "friday", dayOfWeek: "Friday", startTime: "08:00", endTime: "09:00" },
  ];

  const data = deriveDashboardData(classes, [], now);

  assert.deepEqual(data.todayClasses.map((classItem) => classItem._id), [
    "today-past",
    "today-first",
    "later",
  ]);
  assert.deepEqual(data.upcomingClasses.map((classItem) => classItem._id), [
    "today-first",
    "later",
    "friday",
  ]);
});

test("finds Monday sessions after Sunday evening", () => {
  const sundayEvening = new Date(2026, 9, 4, 20, 0);
  const classes = [
    { _id: "sunday-past", dayOfWeek: "Sunday", startTime: "09:00", endTime: "10:00" },
    { _id: "monday", dayOfWeek: "Monday", startTime: "08:00", endTime: "09:00" },
    { _id: "tuesday", dayOfWeek: "Tuesday", startTime: "08:00", endTime: "09:00" },
  ];

  const data = deriveDashboardData(classes, [], sundayEvening);

  assert.deepEqual(data.todayClasses.map((classItem) => classItem._id), ["sunday-past"]);
  assert.deepEqual(data.upcomingClasses.map((classItem) => classItem._id), ["monday", "tuesday"]);
});

test("counts pending, overdue, and completed tasks from shared task status logic", () => {
  const now = new Date(2026, 9, 1, 12, 0);
  const tasks = [
    { _id: "due-yesterday", completed: false, dueDate: "2026-09-30", createdAt: "2026-09-01T12:00:00.000Z" },
    { _id: "due-today", completed: false, dueDate: "2026-10-01", createdAt: "2026-09-01T12:00:00.000Z" },
    { _id: "no-due-date", completed: false, dueDate: null, createdAt: "2026-09-01T12:00:00.000Z" },
    { _id: "completed-overdue", completed: true, dueDate: "2026-09-20", createdAt: "2026-09-01T12:00:00.000Z" },
    { _id: "completed-today", completed: true, dueDate: "2026-10-01", createdAt: "2026-09-01T12:00:00.000Z" },
  ];

  const data = deriveDashboardData([], tasks, now);

  assert.deepEqual(data.taskCounts, {
    pending: 2,
    overdue: 1,
    completed: 2,
    total: 5,
    remaining: 3,
    completionRatio: 0.4,
  });
});

test("prioritizes overdue, due-date pending, then no-date tasks", () => {
  const now = new Date(2026, 9, 1, 12, 0);
  const tasks = [
    { _id: "no-date", completed: false, dueDate: null, createdAt: "2026-09-01T12:00:00.000Z" },
    { _id: "due-tomorrow", completed: false, dueDate: "2026-10-02", createdAt: "2026-09-01T12:00:00.000Z" },
    { _id: "overdue", completed: false, dueDate: "2026-09-30", createdAt: "2026-09-01T12:00:00.000Z" },
    { _id: "due-today", completed: false, dueDate: "2026-10-01", createdAt: "2026-09-01T12:00:00.000Z" },
    { _id: "completed", completed: true, dueDate: "2026-09-20", createdAt: "2026-09-01T12:00:00.000Z" },
  ];

  const data = deriveDashboardData([], tasks, now);

  assert.deepEqual(data.attentionTasks.map((task) => task._id), [
    "overdue",
    "due-today",
    "due-tomorrow",
    "no-date",
  ]);
});

test("handles no classes and no tasks without inventing progress", () => {
  const data = deriveDashboardData([], [], new Date(2026, 9, 1, 12, 0));

  assert.deepEqual(data.todayClasses, []);
  assert.deepEqual(data.upcomingClasses, []);
  assert.deepEqual(data.attentionTasks, []);
  assert.equal(data.taskCounts.total, 0);
  assert.equal(data.taskCounts.completionRatio, null);
});