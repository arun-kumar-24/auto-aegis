import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigration = async () => {
    console.log("Starting database migration...\n");

    try {
        // Read the schema SQL file
        const schemaPath = path.join(__dirname, "schema.sql");
        const sql = fs.readFileSync(schemaPath, "utf-8");

        // Execute the entire schema
        await pool.query(sql);

        console.log("✅ Migration completed successfully!");
        console.log("\n📋 Tables created:");
        console.log("   1. categories");
        console.log("   2. users");
        console.log("   3. wallet (auto-created on user insert)");
        console.log("   4. products");
        console.log("   5. cart");
        console.log("   6. orders");
        console.log("   7. order_items");
        console.log("\n🔗 Trigger: wallet auto-creates on new user signup");
        console.log("📊 Enum: order_status (pending, processing, shipped, delivered, cancelled)");
    } catch (error) {
        console.error("❌ Migration failed:", error.message);
        console.error(error);
    } finally {
        await pool.end();
        console.log("\n🔌 Database connection closed.");
    }
};

runMigration();
