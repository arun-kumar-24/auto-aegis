import bcrypt from "bcryptjs";
import pool from "./index.js";

const SALT_ROUNDS = 10;

/**
 * Generate user data
 * @param {string} prefix - "user" or "testuser"
 * @param {number} index - user number
 */
const generateUser = (prefix, index) => ({
    name: `${prefix}${index}`,
    email: `${prefix}${index}@zap.com`,
    password: `${prefix}${index}pass`,
    address: `${index}, ${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Street, Block ${Math.ceil(index / 5)}, Zap City`,
});

/**
 * Generate a random wallet balance between min and max (2 decimal places)
 */
const randomBalance = (min = 0, max = 1000) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
};

/**
 * Edge-case wallet balances for test users
 * These test boundary conditions in payment/checkout flows
 */
const EDGE_CASE_BALANCES = [
    0.00,     // testuser1  — completely broke
    0.01,     // testuser2  — smallest possible amount
    0.50,     // testuser3  — half a rupee
    0.99,     // testuser4  — just under ₹1
    1.00,     // testuser5  — exactly ₹1
    10.00,    // testuser6  — round small amount
    49.99,    // testuser7  — just under ₹50
    50.00,    // testuser8  — exactly ₹50
    99.99,    // testuser9  — just under ₹100
    100.00,   // testuser10 — exactly ₹100
    250.00,   // testuser11 — mid range
    499.99,   // testuser12 — just under ₹500
    500.00,   // testuser13 — exactly ₹500
    750.50,   // testuser14 — odd decimal mid-high
    999.99,   // testuser15 — just under ₹1000
    1000.00,  // testuser16 — max balance
];

/**
 * 10 Categories for the store
 */
const CATEGORIES = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Kitchen",
    "Sports & Fitness",
    "Beauty & Health",
    "Toys & Games",
    "Grocery & Gourmet",
    "Stationery & Office",
    "Footwear",
];

/**
 * 100 Products — 10 per category
 * { name, price (INR), stock, categoryIndex (0-9) }
 */
const PRODUCTS = [
    // ── Electronics (0) ──
    { name: "Wireless Bluetooth Earbuds", price: 1299.00, stock: 150, cat: 0 },
    { name: "USB-C Fast Charger 65W", price: 899.00, stock: 200, cat: 0 },
    { name: "Portable Power Bank 10000mAh", price: 749.00, stock: 120, cat: 0 },
    { name: "Mechanical Keyboard RGB", price: 2499.00, stock: 75, cat: 0 },
    { name: "Wireless Mouse Ergonomic", price: 599.00, stock: 180, cat: 0 },
    { name: "Webcam 1080p HD", price: 1899.00, stock: 60, cat: 0 },
    { name: "USB Hub 7-Port", price: 449.00, stock: 300, cat: 0 },
    { name: "Smart LED Desk Lamp", price: 1199.00, stock: 90, cat: 0 },
    { name: "Noise Cancelling Headphones", price: 3499.00, stock: 45, cat: 0 },
    { name: "32GB USB 3.0 Flash Drive", price: 349.00, stock: 500, cat: 0 },

    // ── Clothing (1) ──
    { name: "Cotton Round Neck T-Shirt", price: 399.00, stock: 300, cat: 1 },
    { name: "Slim Fit Denim Jeans", price: 1299.00, stock: 150, cat: 1 },
    { name: "Casual Checked Shirt", price: 799.00, stock: 200, cat: 1 },
    { name: "Hooded Sweatshirt", price: 999.00, stock: 120, cat: 1 },
    { name: "Formal Cotton Trousers", price: 1499.00, stock: 80, cat: 1 },
    { name: "Polo T-Shirt", price: 599.00, stock: 250, cat: 1 },
    { name: "Winter Jacket Padded", price: 2199.00, stock: 60, cat: 1 },
    { name: "Track Pants Joggers", price: 649.00, stock: 180, cat: 1 },
    { name: "Kurta Pajama Set", price: 899.00, stock: 100, cat: 1 },
    { name: "Cotton Boxer Shorts (Pack of 3)", price: 499.00, stock: 400, cat: 1 },

    // ── Books (2) ──
    { name: "Atomic Habits", price: 349.00, stock: 200, cat: 2 },
    { name: "The Psychology of Money", price: 299.00, stock: 180, cat: 2 },
    { name: "Rich Dad Poor Dad", price: 259.00, stock: 220, cat: 2 },
    { name: "Ikigai", price: 249.00, stock: 160, cat: 2 },
    { name: "Deep Work", price: 319.00, stock: 140, cat: 2 },
    { name: "Sapiens", price: 399.00, stock: 130, cat: 2 },
    { name: "The Alchemist", price: 199.00, stock: 300, cat: 2 },
    { name: "Zero to One", price: 279.00, stock: 110, cat: 2 },
    { name: "Thinking Fast and Slow", price: 449.00, stock: 90, cat: 2 },
    { name: "The Lean Startup", price: 329.00, stock: 100, cat: 2 },

    // ── Home & Kitchen (3) ──
    { name: "Stainless Steel Water Bottle 1L", price: 499.00, stock: 250, cat: 3 },
    { name: "Non-Stick Frying Pan 24cm", price: 699.00, stock: 120, cat: 3 },
    { name: "Glass Storage Containers Set", price: 599.00, stock: 100, cat: 3 },
    { name: "Bamboo Cutting Board", price: 349.00, stock: 150, cat: 3 },
    { name: "Electric Kettle 1.5L", price: 899.00, stock: 80, cat: 3 },
    { name: "Cotton Bath Towel Set (4pc)", price: 749.00, stock: 200, cat: 3 },
    { name: "Wall Clock Minimalist", price: 449.00, stock: 90, cat: 3 },
    { name: "Bedsheet King Size Cotton", price: 999.00, stock: 70, cat: 3 },
    { name: "Cushion Covers Set (5pc)", price: 399.00, stock: 160, cat: 3 },
    { name: "Ceramic Coffee Mugs Set (6pc)", price: 549.00, stock: 130, cat: 3 },

    // ── Sports & Fitness (4) ──
    { name: "Yoga Mat 6mm Anti-Slip", price: 599.00, stock: 200, cat: 4 },
    { name: "Resistance Bands Set (5pc)", price: 449.00, stock: 180, cat: 4 },
    { name: "Skipping Rope Adjustable", price: 199.00, stock: 300, cat: 4 },
    { name: "Dumbbells 5kg Pair", price: 899.00, stock: 100, cat: 4 },
    { name: "Cricket Tennis Ball (Pack of 6)", price: 249.00, stock: 400, cat: 4 },
    { name: "Badminton Racket Set", price: 799.00, stock: 80, cat: 4 },
    { name: "Gym Gloves with Wrist Support", price: 349.00, stock: 150, cat: 4 },
    { name: "Sports Shaker Bottle 700ml", price: 299.00, stock: 220, cat: 4 },
    { name: "Football Size 5", price: 649.00, stock: 90, cat: 4 },
    { name: "Wrist Watch Sports Digital", price: 1199.00, stock: 60, cat: 4 },

    // ── Beauty & Health (5) ──
    { name: "Sunscreen SPF 50 100ml", price: 349.00, stock: 250, cat: 5 },
    { name: "Face Wash Charcoal 150ml", price: 199.00, stock: 300, cat: 5 },
    { name: "Hair Oil Coconut 200ml", price: 149.00, stock: 400, cat: 5 },
    { name: "Lip Balm Moisturizing (Pack of 3)", price: 249.00, stock: 200, cat: 5 },
    { name: "Beard Grooming Kit", price: 599.00, stock: 100, cat: 5 },
    { name: "Hand Sanitizer 500ml", price: 129.00, stock: 500, cat: 5 },
    { name: "Body Lotion Aloe Vera 400ml", price: 279.00, stock: 180, cat: 5 },
    { name: "Multivitamin Tablets (60 tabs)", price: 449.00, stock: 150, cat: 5 },
    { name: "Protein Powder Whey 1kg", price: 1499.00, stock: 80, cat: 5 },
    { name: "Electric Toothbrush", price: 899.00, stock: 70, cat: 5 },

    // ── Toys & Games (6) ──
    { name: "Rubik's Cube 3x3", price: 199.00, stock: 300, cat: 6 },
    { name: "UNO Card Game", price: 149.00, stock: 400, cat: 6 },
    { name: "Chess Board Magnetic Foldable", price: 449.00, stock: 120, cat: 6 },
    { name: "Remote Control Car Off-Road", price: 999.00, stock: 80, cat: 6 },
    { name: "Building Blocks Set 200pc", price: 699.00, stock: 100, cat: 6 },
    { name: "Monopoly Board Game", price: 549.00, stock: 90, cat: 6 },
    { name: "Dart Board Set with 6 Darts", price: 399.00, stock: 110, cat: 6 },
    { name: "Puzzle 1000 Pieces Landscape", price: 349.00, stock: 70, cat: 6 },
    { name: "Nerf Blaster Elite", price: 1299.00, stock: 50, cat: 6 },
    { name: "Carrom Board Full Size", price: 1599.00, stock: 40, cat: 6 },

    // ── Grocery & Gourmet (7) ──
    { name: "Basmati Rice Premium 5kg", price: 549.00, stock: 200, cat: 7 },
    { name: "Cold Pressed Olive Oil 1L", price: 699.00, stock: 150, cat: 7 },
    { name: "Organic Honey 500g", price: 349.00, stock: 180, cat: 7 },
    { name: "Green Tea Bags (100 bags)", price: 299.00, stock: 250, cat: 7 },
    { name: "Dark Chocolate 72% (Pack of 4)", price: 399.00, stock: 200, cat: 7 },
    { name: "Instant Coffee Jar 200g", price: 449.00, stock: 160, cat: 7 },
    { name: "Almonds Premium 500g", price: 599.00, stock: 130, cat: 7 },
    { name: "Peanut Butter Crunchy 1kg", price: 349.00, stock: 170, cat: 7 },
    { name: "Oats Rolled Whole Grain 1kg", price: 199.00, stock: 300, cat: 7 },
    { name: "Mixed Spices Gift Box", price: 799.00, stock: 80, cat: 7 },

    // ── Stationery & Office (8) ──
    { name: "Notebook A5 Ruled (Pack of 5)", price: 249.00, stock: 400, cat: 8 },
    { name: "Ball Pen Blue (Pack of 10)", price: 99.00, stock: 500, cat: 8 },
    { name: "Highlighter Set Neon (6 colors)", price: 149.00, stock: 300, cat: 8 },
    { name: "Desk Organizer Wooden", price: 599.00, stock: 90, cat: 8 },
    { name: "Sticky Notes 3x3 (Pack of 5)", price: 129.00, stock: 350, cat: 8 },
    { name: "Whiteboard Marker Set (4pc)", price: 179.00, stock: 200, cat: 8 },
    { name: "Paper Shredder Mini", price: 1999.00, stock: 30, cat: 8 },
    { name: "Stapler with 1000 Pins", price: 149.00, stock: 250, cat: 8 },
    { name: "A4 Printing Paper 500 Sheets", price: 349.00, stock: 180, cat: 8 },
    { name: "Scientific Calculator", price: 599.00, stock: 120, cat: 8 },

    // ── Footwear (9) ──
    { name: "Running Shoes Lightweight", price: 1799.00, stock: 100, cat: 9 },
    { name: "Casual Sneakers White", price: 1299.00, stock: 120, cat: 9 },
    { name: "Leather Formal Shoes", price: 2499.00, stock: 60, cat: 9 },
    { name: "Flip Flops Daily Wear", price: 249.00, stock: 400, cat: 9 },
    { name: "Sports Sandals Velcro", price: 599.00, stock: 150, cat: 9 },
    { name: "Loafers Suede Brown", price: 1499.00, stock: 80, cat: 9 },
    { name: "Ankle Boots Black", price: 1999.00, stock: 50, cat: 9 },
    { name: "Slippers Memory Foam", price: 399.00, stock: 200, cat: 9 },
    { name: "Canvas Shoes Classic", price: 899.00, stock: 130, cat: 9 },
    { name: "Trekking Shoes Waterproof", price: 2999.00, stock: 40, cat: 9 },
];

const seed = async () => {
    console.log("🌱 Starting database seeding...\n");

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // ────────────────────────────────────────────────
        // 0. Seed Categories
        // ────────────────────────────────────────────────
        console.log("📁 Creating 10 categories...");
        const categoryIds = [];
        for (const catName of CATEGORIES) {
            const result = await client.query(
                `INSERT INTO categories (name)
                 VALUES ($1)
                 ON CONFLICT DO NOTHING
                 RETURNING id`,
                [catName]
            );
            if (result.rows.length > 0) {
                categoryIds.push(result.rows[0].id);
            } else {
                // Already exists, fetch the id
                const existing = await client.query(
                    "SELECT id FROM categories WHERE name = $1", [catName]
                );
                categoryIds.push(existing.rows[0].id);
            }
        }
        console.log(`   ✅ ${CATEGORIES.length} categories created`);

        // ────────────────────────────────────────────────
        // 1. Seed Products (10 per category = 100 total)
        // ────────────────────────────────────────────────
        console.log("📦 Creating 100 products (10 per category)...");
        for (const product of PRODUCTS) {
            await client.query(
                `INSERT INTO products (name, price, stock, category_id)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT DO NOTHING`,
                [product.name, product.price, product.stock, categoryIds[product.cat]]
            );
        }
        console.log("   ✅ 100 products created");

        let totalInserted = 0;

        // ────────────────────────────────────────────────
        // 2. Seed Users & Wallets
        // ────────────────────────────────────────────────

        // --- Regular Users (user1-20) ---
        console.log("👤 Creating user1 to user20...");
        for (let i = 1; i <= 20; i++) {
            const { name, email, password, address } = generateUser("user", i);
            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

            await client.query(
                `INSERT INTO users (name, email, password_hash, address)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (email) DO NOTHING`,
                [name, email, passwordHash, address]
            );

            const balance = randomBalance();
            await client.query(
                `UPDATE wallet SET money = $1, updated_at = NOW()
                 WHERE user_id = (SELECT id FROM users WHERE email = $2)`,
                [balance, email]
            );
            totalInserted++;
        }

        // --- Test Users (testuser1-100) ---
        console.log("🧪 Creating testuser1 to testuser100...");
        for (let i = 1; i <= 100; i++) {
            const { name, email, password, address } = generateUser("testuser", i);
            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

            await client.query(
                `INSERT INTO users (name, email, password_hash, address)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (email) DO NOTHING`,
                [name, email, passwordHash, address]
            );

            const balance = i <= EDGE_CASE_BALANCES.length ? EDGE_CASE_BALANCES[i - 1] : randomBalance();
            await client.query(
                `UPDATE wallet SET money = $1, updated_at = NOW()
                 WHERE user_id = (SELECT id FROM users WHERE email = $2)`,
                [balance, email]
            );

            totalInserted++;
            if (i % 25 === 0) console.log(`   ... ${i}/100 test users created`);
        }
        console.log("   ✅ 120 users created (with wallet balances)");

        // ────────────────────────────────────────────────
        // 3. Seed Cart, Orders, and Order Items
        // ────────────────────────────────────────────────
        console.log("🛒 Seeding Cart, Orders, and Order Items...");

        const { rows: users } = await client.query("SELECT id FROM users");
        const { rows: productRows } = await client.query("SELECT id, price FROM products");

        // --- Seed Cart (some users) ---
        console.log("   ... Adding items to carts");
        for (let i = 0; i < 15; i++) {
            const userId = users[i].id;
            const numItems = Math.floor(Math.random() * 3) + 1;
            const shuffled = [...productRows].sort(() => 0.5 - Math.random());

            for (let j = 0; j < numItems; j++) {
                await client.query(
                    `INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
                    [userId, shuffled[j].id, Math.floor(Math.random() * 3) + 1]
                );
            }
        }

        // --- Seed Orders ---
        console.log("   ... Creating historical orders");
        const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

        for (let i = 15; i < 45; i++) {
            const userId = users[i].id;
            const numOrders = Math.floor(Math.random() * 2) + 1;

            for (let j = 0; j < numOrders; j++) {
                const numItems = Math.floor(Math.random() * 4) + 1;
                const shuffled = [...productRows].sort(() => 0.5 - Math.random()).slice(0, numItems);

                let total = 0;
                const items = shuffled.map(p => {
                    const qty = Math.floor(Math.random() * 2) + 1;
                    const price = parseFloat(p.price);
                    total += price * qty;
                    return { id: p.id, qty, price };
                });

                const res = await client.query(
                    `INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, $3) RETURNING id`,
                    [userId, total.toFixed(2), statuses[Math.floor(Math.random() * statuses.length)]]
                );
                const orderId = res.rows[0].id;

                for (const item of items) {
                    await client.query(
                        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)`,
                        [orderId, item.id, item.qty, item.price]
                    );
                }
            }
        }
        console.log("   ✅ Cart, Orders, and Order Items seeded");

        await client.query("COMMIT");

        // ────────────────────────────────────────────────
        // Verify
        // ────────────────────────────────────────────────
        const metrics = await Promise.all([
            pool.query("SELECT COUNT(*) FROM users"),
            pool.query("SELECT COUNT(*) FROM wallet"),
            pool.query("SELECT COUNT(*) FROM categories"),
            pool.query("SELECT COUNT(*) FROM products"),
            pool.query("SELECT COUNT(*) FROM cart"),
            pool.query("SELECT COUNT(*) FROM orders"),
            pool.query("SELECT COUNT(*) FROM order_items")
        ]);

        console.log(`\n🎉 Seeding complete!`);
        console.log(`   📁 Categories: ${metrics[2].rows[0].count}`);
        console.log(`   📦 Products:   ${metrics[3].rows[0].count}`);
        console.log(`   👤 Users:      ${metrics[0].rows[0].count}`);
        console.log(`   💰 Wallets:    ${metrics[1].rows[0].count}`);
        console.log(`   🛒 Cart:       ${metrics[4].rows[0].count} items`);
        console.log(`   📦 Orders:     ${metrics[5].rows[0].count}`);
        console.log(`   📄 Items:      ${metrics[6].rows[0].count} total items in orders`);

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Seeding failed:", error.message);
        console.error(error);
    } finally {
        client.release();
        await pool.end();
        console.log("\n🔌 Database connection closed.");
    }
};

seed();
