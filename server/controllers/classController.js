import mongoose from "mongoose";
import Class, { weekdays } from "../models/Class.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { validateClassInput } from "../utils/classValidation.js";

async function findDemoUser() {
  const email = process.env.DEMO_USER_EMAIL || "student@example.com";
  return User.findOne({ email });
}

async function getRequestUser(request) {
  return request.user || findDemoUser();
}

function sendServerError(response, error) {
  console.error("Class request failed:", error);
  return response.status(500).json({
    success: false,
    message: "Something went wrong while handling the class request.",
  });
}

function getClassData(input) {
  return {
    subjectName: input.subjectName.trim(),
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    room: input.room?.trim() || "",
    teacher: input.teacher?.trim() || "",
  };
}

export async function getClasses(request, response) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const classes = await Class.find({ userId: user._id });
    classes.sort((first, second) => {
      const dayDifference = weekdays.indexOf(first.dayOfWeek) - weekdays.indexOf(second.dayOfWeek);
      return dayDifference || first.startTime.localeCompare(second.startTime);
    });

    return response.json({ success: true, data: classes });
  } catch (error) {
    return sendServerError(response, error);
  }
}

export async function getClass(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ success: false, message: "Invalid class ID." });
  }

  try {
    const user = await getRequestUser(request);
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const classItem = await Class.findOne({ _id: request.params.id, userId: user._id });
    if (!classItem) {
      return response.status(404).json({ success: false, message: "Class not found." });
    }

    return response.json({ success: true, data: classItem });
  } catch (error) {
    return sendServerError(response, error);
  }
}

export async function createClass(request, response) {
  const validationMessage = validateClassInput(request.body);
  if (validationMessage) {
    return response.status(400).json({ success: false, message: validationMessage });
  }

  try {
    const user = await getRequestUser(request);
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const classItem = await Class.create({ ...getClassData(request.body), userId: user._id });
    return response.status(201).json({ success: true, data: classItem });
  } catch (error) {
    return sendServerError(response, error);
  }
}

export async function updateClass(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ success: false, message: "Invalid class ID." });
  }

  const validationMessage = validateClassInput(request.body);
  if (validationMessage) {
    return response.status(400).json({ success: false, message: validationMessage });
  }

  try {
    const user = await getRequestUser(request);
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const classItem = await Class.findOne({ _id: request.params.id, userId: user._id });
    if (!classItem) {
      return response.status(404).json({ success: false, message: "Class not found." });
    }

    Object.assign(classItem, getClassData(request.body));
    await classItem.save();
    return response.json({ success: true, data: classItem });
  } catch (error) {
    return sendServerError(response, error);
  }
}

export async function deleteClass(request, response) {
  if (!mongoose.isValidObjectId(request.params.id)) {
    return response.status(400).json({ success: false, message: "Invalid class ID." });
  }

  try {
    const user = await getRequestUser(request);
    if (!user) {
      return response.status(500).json({ success: false, message: "Development user is missing." });
    }

    const classItem = await Class.findOneAndDelete({ _id: request.params.id, userId: user._id });
    if (!classItem) {
      return response.status(404).json({ success: false, message: "Class not found." });
    }

    await Task.deleteMany({ userId: user._id, classId: classItem._id });
    return response.json({ success: true, data: { id: classItem._id } });
  } catch (error) {
    return sendServerError(response, error);
  }
}