import express from "express";
import { getCart, addToCart, removeFromCart } from "../controllers/cartController.js";

const router = express.Router();

router.get("/:userId", getCart);
router.post("/", addToCart);
router.delete("/:id", removeFromCart);

export default router;
