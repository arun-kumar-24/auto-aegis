import express from "express";
import { login, signup, getMe } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", getMe);

export default router;
