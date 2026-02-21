import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool, { query } from "./db/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ───── Middleware ─────
app.use(cors());
app.use(express.json());

// ───── Routes ─────

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "alive",
        message: "⚡ Zap server is running!",
        timestamp: new Date().toISOString(),
    });
});

// Test Supabase DB connection
app.get("/db-test", async (req, res) => {
    try {
        const result = await query("SELECT NOW() AS current_time");
        res.json({
            status: "connected",
            message: "Supabase database connection successful!",
            serverTime: result.rows[0].current_time,
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        res.status(500).json({
            status: "error",
            message: "Failed to connect to Supabase database",
            error: error.message,
        });
    }
});

// ───── Start Server ─────
app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    console.log(`DB test endpoint: http://localhost:${PORT}/db-test\n`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await pool.end();
    process.exit(0);
});
