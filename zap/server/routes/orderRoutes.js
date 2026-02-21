import express from "express";
import { getOrderHistory, getOrderDetails, checkout } from "../controllers/orderController.js";

const router = express.Router();

router.get("/user/:userId", getOrderHistory);
router.get("/:id", getOrderDetails);
router.post("/checkout", checkout);

export default router;
