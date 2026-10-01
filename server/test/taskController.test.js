import test from "node:test";
import assert from "node:assert/strict";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { getTasks } from "../controllers/taskController.js";

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("task status endpoint filters against its supplied local date", async (context) => {
  const user = { _id: "user-id" };
  const tasks = [
    { _id: "overdue", completed: false, dueDate: new Date("2026-09-20T00:00:00.000Z") },
    { _id: "completed-overdue", completed: true, dueDate: new Date("2026-09-20T00:00:00.000Z") },
    { _id: "completed-today", completed: true, dueDate: new Date("2026-10-01T00:00:00.000Z") },
  ];

  context.mock.method(User, "findOne", async () => user);
  context.mock.method(Task, "find", (filter) => {
    assert.deepEqual(filter, { userId: user._id });
    return {
      sort(sortOrder) {
        assert.deepEqual(sortOrder, { dueDate: 1, createdAt: -1 });
        return Promise.resolve(tasks);
      },
    };
  });

  const response = createResponse();
  await getTasks({ query: { status: "completed", today: "2026-10-01" } }, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body.data.map((task) => task._id), ["completed-overdue", "completed-today"]);
});

test("task status endpoint rejects an invalid date key", async () => {
  const response = createResponse();
  await getTasks({ query: { status: "overdue", today: "2026-02-30" } }, response);

  assert.equal(response.statusCode, 400);
  assert.match(response.body.message, /valid YYYY-MM-DD/);
});