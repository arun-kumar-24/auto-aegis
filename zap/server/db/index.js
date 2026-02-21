import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required for Supabase connections
    },
});

// Test the connection on startup
pool.on("connect", () => {
    console.log("✅ Connected to Supabase PostgreSQL");
});

pool.on("error", (err) => {
    console.error("❌ Unexpected database error:", err);
    process.exit(-1);
});

/**
 * Execute a SQL query against the Supabase database.
 * @param {string} text - The SQL query string
 * @param {Array} params - Parameterized query values
 * @returns {Promise<import('pg').QueryResult>}
 */
export const query = async (text, params) => {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("📝 Query executed", { text, duration: `${duration}ms`, rows: result.rowCount });
    return result;
};

export default pool;
