/**
 * Chaos Middleware
 * Simulates real-world backend issues: Latency and Random Errors.
 */
const chaosMiddleware = (options = {}) => {
    const {
        errorRate = 0,    // 0.0 to 1.0
        latencyMs = 0,    // Base latency in ms
        isBroken = false  // Forced failure
    } = options;

    return async (req, res, next) => {
        // 1. Simulate "Completely Broken" state
        if (isBroken) {
            return res.status(503).json({
                status: "chaos",
                message: "SYSTEM_FAILURE: Service temporarily unavailable (Chaos Engine)",
            });
        }

        // 2. Simulate Random Latency
        if (latencyMs > 0) {
            const jitter = Math.random() * 200; // Add some randomness to latency
            await new Promise(resolve => setTimeout(resolve, latencyMs + jitter));
        }

        // 3. Simulate Random Errors
        if (errorRate > 0 && Math.random() < errorRate) {
            const errors = [
                { status: 500, message: "Internal Server Error (Simulated)" },
                { status: 502, message: "Bad Gateway (Simulated)" },
                { status: 504, message: "Gateway Timeout (Simulated)" },
                { status: 429, message: "Too Many Requests (Simulated)" }
            ];
            const picked = errors[Math.floor(Math.random() * errors.length)];
            return res.status(picked.status).json({
                status: "chaos",
                message: picked.message,
            });
        }

        next();
    };
};

export default chaosMiddleware;
