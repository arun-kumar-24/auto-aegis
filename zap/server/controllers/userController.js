import { query } from "../db/index.js";

export const getProfile = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query("SELECT id, name, email, address, created_at FROM users WHERE id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getWallet = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await query("SELECT money, updated_at FROM wallet WHERE user_id = $1", [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: "Wallet not found" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addMoney = async (req, res) => {
    const { userId, amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    try {
        const result = await query(
            "UPDATE wallet SET money = money + $1, updated_at = NOW() WHERE user_id = $2 RETURNING money",
            [amount, userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: "Wallet not found" });
        res.json({ message: "Money added successfully", balance: result.rows[0].money });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
