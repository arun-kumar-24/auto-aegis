import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import pool from "./db/index.js";

// Import Middleware
import chaosMiddleware from "./middleware/chaos.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ───── Standard Middleware ─────
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ───── ☢️ Chaos Engine (Sabotage Middleware) ─────
// You can toggle these values to test frontend resilience
const chaosConfig = {
    errorRate: Math.floor(Math.random()*11)/10,    // Random error rate between 0 and 1.0
    latencyMs: 100,     // 100ms base delay
    isBroken: false     // Set true to kill the whole API
};

app.use("/api", chaosMiddleware(chaosConfig));

// ───── Routes ─────

// Health check
app.get("/", (req, res) => {
    res.json({
        status: "alive",
        message: "Zap server is running modularly!",
        chaosEngine: chaosConfig.isBroken ? "CRITICAL_FAILURE" : "ACTIVE",
        timestamp: new Date().toISOString(),
    });
});

// Modular Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// ───── Start Server ─────
app.listen(PORT, () => {
    console.log(`\nServer running on http://localhost:${PORT}`);
    // console.log(`Chaos Engine active on /api routes (Error Rate: ${chaosConfig.errorRate * 10}%)\n`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\nShutting down gracefully...");
    await pool.end();
    process.exit(0);
});
