import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, registerUser, updateUserTheme } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/theme", authMiddleware, updateUserTheme);

export default router;
