import { query } from "../db/index.js";
import pool from "../db/index.js";

export const getOrderHistory = async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await query(
            "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getOrderDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await query("SELECT * FROM orders WHERE id = $1", [id]);
        if (order.rows.length === 0) return res.status(404).json({ message: "Order not found" });

        const items = await query(
            "SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1",
            [id]
        );

        res.json({ ...order.rows[0], items: items.rows });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const checkout = async (req, res) => {
    const { userId } = req.body;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // 1. Get cart items
        const cartItems = await client.query(
            "SELECT c.*, p.price, p.stock, p.name FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1",
            [userId]
        );

        if (cartItems.rows.length === 0) {
            throw new Error("Cart is empty");
        }

        // 2. Calculate total and check stock
        let totalAmount = 0;
        for (const item of cartItems.rows) {
            if (item.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${item.name}`);
            }
            totalAmount += parseFloat(item.price) * item.quantity;
        }

        // 3. Check wallet balance
        const wallet = await client.query("SELECT money FROM wallet WHERE user_id = $1", [userId]);
        if (wallet.rows.length === 0 || parseFloat(wallet.rows[0].money) < totalAmount) {
            throw new Error("Insufficient wallet balance");
        }

        // 4. Deduct money from wallet
        await client.query(
            "UPDATE wallet SET money = money - $1, updated_at = NOW() WHERE user_id = $2",
            [totalAmount, userId]
        );

        // 5. Create order
        const orderRes = await client.query(
            "INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, 'processing') RETURNING id",
            [userId, totalAmount]
        );
        const orderId = orderRes.rows[0].id;

        // 6. Create order items & Update stock
        for (const item of cartItems.rows) {
            await client.query(
                "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
                [orderId, item.product_id, item.quantity, item.price]
            );

            await client.query(
                "UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2",
                [item.quantity, item.product_id]
            );
        }

        // 7. Clear cart
        await client.query("DELETE FROM cart WHERE user_id = $1", [userId]);

        await client.query("COMMIT");
        res.json({ message: "Checkout successful", orderId, totalAmount });
    } catch (error) {
        await client.query("ROLLBACK");
        res.status(400).json({ message: "Checkout failed", error: error.message });
    } finally {
        client.release();
    }
};
