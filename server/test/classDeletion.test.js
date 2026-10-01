import test from "node:test";
import assert from "node:assert/strict";
import Class from "../models/Class.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { deleteClass } from "../controllers/classController.js";

test("deleting a class also deletes its associated task records", async (context) => {
  const user = { _id: "user-id" };
  const classItem = { _id: "class-id" };
  const classId = "507f1f77bcf86cd799439011";
  let taskDeleteFilter;

  context.mock.method(User, "findOne", async () => user);
  context.mock.method(Class, "findOneAndDelete", async (filter) => {
    assert.deepEqual(filter, { _id: classId, userId: user._id });
    return classItem;
  });
  context.mock.method(Task, "deleteMany", async (filter) => {
    taskDeleteFilter = filter;
    return { deletedCount: 2 };
  });

  const response = {
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

  await deleteClass({ params: { id: classId } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
  assert.deepEqual(taskDeleteFilter, { userId: user._id, classId: classItem._id });
});