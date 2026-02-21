import { query } from "../db/index.js";

export const getCart = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await query(
            "SELECT c.*, p.name, p.price, p.stock FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1",
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addToCart = async (req, res) => {
    const { userId, productId, quantity } = req.body;
    try {
        const result = await query(
            `INSERT INTO cart (user_id, product_id, quantity) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET quantity = cart.quantity + $3, updated_at = NOW()
       RETURNING *`,
            [userId, productId, quantity || 1]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeFromCart = async (req, res) => {
    const { id } = req.params;
    try {
        await query("DELETE FROM cart WHERE id = $1", [id]);
        res.json({ message: "Item removed from cart" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
