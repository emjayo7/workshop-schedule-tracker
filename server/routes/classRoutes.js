import { Router } from "express";
import {
  createClass,
  deleteClass,
  getClass,
  getClasses,
  updateClass,
} from "../controllers/classController.js";

const router = Router();

router.get("/", getClasses);
router.get("/:id", getClass);
router.post("/", createClass);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

export default router;