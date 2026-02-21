import express from "express";
import { getCategories, getProducts, getProductById } from "../controllers/productController.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/", getProducts);
router.get("/:id", getProductById);

export default router;
