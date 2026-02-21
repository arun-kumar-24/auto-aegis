import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "zap_secret_key_2026";

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
            expiresIn: "24h",
        });

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
