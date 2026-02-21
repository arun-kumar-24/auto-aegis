import express from "express";
import { getProfile, getWallet, addMoney } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile/:id", getProfile);
router.get("/wallet/:id", getWallet);
router.post("/wallet/add", addMoney);

export default router;
