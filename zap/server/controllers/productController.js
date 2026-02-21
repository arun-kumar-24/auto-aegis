import { query } from "../db/index.js";

export const getCategories = async (req, res) => {
    try {
        const result = await query("SELECT * FROM categories ORDER BY name ASC");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getProducts = async (req, res) => {
    const { categoryId, minPrice, maxPrice } = req.query;
    let sql = "SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE 1=1";
    const params = [];

    if (categoryId) {
        params.push(categoryId);
        sql += ` AND category_id = $${params.length}`;
    }
    if (minPrice) {
        params.push(minPrice);
        sql += ` AND price >= $${params.length}`;
    }
    if (maxPrice) {
        params.push(maxPrice);
        sql += ` AND price <= $${params.length}`;
    }

    sql += " ORDER BY created_at DESC";

    try {
        const result = await query(sql, params);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query(
            "SELECT p.*, c.name as category_name FROM products p JOIN categories c ON p.category_id = c.id WHERE p.id = $1",
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
