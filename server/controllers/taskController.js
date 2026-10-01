import mongoose from "mongoose";
import Class from "../models/Class.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import {
  filterTasksByStatus,
  getLocalDateKey,
  isValidDateOnly,
  toggleTaskCompletion,
} from "../utils/taskUtils.js";
import { validateTaskInput } from "../utils/taskValidation.js";

async function findDemoUser() {
  const email = process.env.DEMO_USER_EMAIL || "student@example.com";
  return User.findOne({ email });
}

function sendServerError(response, error) {
  console.error("Task request failed:", error);
  return response.status(500).json({
    success: false,
    message: "Something went wrong while handling the task request.",
  });
}

function taskDataFromInput(input) {
  return {
    title: input.title.trim(),
    description: input.description?.trim() || "",
    dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00.000Z`) : null,
  };
}

export async function getClassTasks(request, response) {
  if (!mongoose.isValidObjectId(request.params.classId)) {
    return response.status(400).json({ success: false, message: "Invalid class ID." });
  }

  try {
    const user = await findDemoUser();
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const classItem = await Class.findOne({ _id: request.params.classId, userId: user._id });
    if (!classItem) {
      return response.status(404).json({ success: false, message: "Class not found." });
    }

    const tasks = await Task.find({ userId: user._id, classId: classItem._id }).sort({ createdAt: -1 });
    return response.json({ success: true, data: tasks });
  } catch (error) {
    return sendServerError(response, error);
  }
}

export async function getTasks(request, response) {
  const { status } = request.query;
  const today = request.query.today || getLocalDateKey();

  if (status && !["pending", "overdue", "completed"].includes(status)) {
    return response.status(400).json({ success: false, message: "Status must be pending, overdue, or completed." });
  }
  if (!isValidDateOnly(today)) {
    return response.status(400).json({ success: false, message: "Today must be a valid YYYY-MM-DD value." });
  }

  try {
    const user = await findDemoUser();
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const tasks = await Task.find({ userId: user._id }).sort({ dueDate: 1, createdAt: -1 });
    const selectedTasks = filterTasksByStatus(tasks, status, today);

    return response.json({ success: true, data: selectedTasks });
  } catch (error) {
    return sendServerError(response, error);
  }
}

export async function getTask(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ success: false, message: "Invalid task ID." });
  }

  try {
    const user = await findDemoUser();
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const task = await Task.findOne({ _id: request.params.id, userId: user._id });
    if (!task) {
      return response.status(404).json({ success: false, message: "Task not found." });
    }

    return response.json({ success: true, data: task });
  } catch (error) {
    return sendServerError(response, error);
  }
}

export async function createTask(request, response) {
  if (!mongoose.isValidObjectId(request.params.classId)) {
    return response.status(400).json({ success: false, message: "Invalid class ID." });
  }

  const creationDateKey = request.query.createdDate;
  if (creationDateKey && !isValidDateOnly(creationDateKey)) {
    return response.status(400).json({ success: false, message: "Creation date must be a valid YYYY-MM-DD value." });
  }

  const validationMessage = validateTaskInput(request.body, { creationDateKey });
  if (validationMessage) {
    return response.status(400).json({ success: false, message: validationMessage });
  }

  try {
    const user = await findDemoUser();
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const classItem = await Class.findOne({ _id: request.params.classId, userId: user._id });
    if (!classItem) {
      return response.status(404).json({ success: false, message: "Class not found." });
    }

    const task = await Task.create({
      ...taskDataFromInput(request.body),
      userId: user._id,
      classId: classItem._id,
    });

    return response.status(201).json({ success: true, data: task });
  } catch (error) {
    return sendServerError(response, error);
  }
}

export async function updateTask(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ success: false, message: "Invalid task ID." });
  }

  try {
    const user = await findDemoUser();
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const task = await Task.findOne({ _id: request.params.id, userId: user._id });
    if (!task) {
      return response.status(404).json({ success: false, message: "Task not found." });
    }

    const creationDateKey = request.query.createdDate;
    if (creationDateKey && !isValidDateOnly(creationDateKey)) {
      return response.status(400).json({ success: false, message: "Creation date must be a valid YYYY-MM-DD value." });
    }

    const validationMessage = validateTaskInput(request.body, {
      createdAt: task.createdAt,
      creationDateKey,
    });
    if (validationMessage) {
      return response.status(400).json({ success: false, message: validationMessage });
    }

    Object.assign(task, taskDataFromInput(request.body));
    await task.save();
    return response.json({ success: true, data: task });
  } catch (error) {
    return sendServerError(response, error);
  }
}

export async function toggleTask(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ success: false, message: "Invalid task ID." });
  }

  try {
    const user = await findDemoUser();
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const task = await Task.findOne({ _id: request.params.id, userId: user._id });
    if (!task) {
      return response.status(404).json({ success: false, message: "Task not found." });
    }

    toggleTaskCompletion(task);
    await task.save();
    return response.json({ success: true, data: task });
  } catch (error) {
    return sendServerError(response, error);
  }
}

export async function deleteTask(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ success: false, message: "Invalid task ID." });
  }

  try {
    const user = await findDemoUser();
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const task = await Task.findOneAndDelete({ _id: request.params.id, userId: user._id });
    if (!task) {
      return response.status(404).json({ success: false, message: "Task not found." });
    }

    return response.json({ success: true, data: { id: task._id } });
  } catch (error) {
    return sendServerError(response, error);
  }
}