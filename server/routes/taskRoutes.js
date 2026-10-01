import { Router } from "express";
import {
  createTask,
  deleteTask,
  getClassTasks,
  getTask,
  getTasks,
  toggleTask,
  updateTask,
} from "../controllers/taskController.js";

const router = Router();

router.get("/classes/:classId/tasks", getClassTasks);
router.post("/classes/:classId/tasks", createTask);
router.get("/tasks", getTasks);
router.get("/tasks/:id", getTask);
router.put("/tasks/:id", updateTask);
router.patch("/tasks/:id/toggle", toggleTask);
router.delete("/tasks/:id", deleteTask);

export default router;