import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import { supabase } from './lib/supabase.js';
import authRoutes from './routes/authRoutes.js';
import monitorRoutes from './routes/monitorRoutes.js';
import ingestRoutes from './routes/ingestRoutes.js';
import alertRoutes from './routes/alertRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Setup Multer (InMemory)
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173', // Vite default
        'https://auto-aegis.vercel.app',
        'https://zap-texus.vercel.app' // User's zap client
    ],
    credentials: true // Required for cookies
}));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Registration of modular routes
app.use('/api/auth', authRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/ingest', ingestRoutes);
app.use('/api/alerts', alertRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', services: 'Express + Supabase' });
});

// Route: Upload file to Supabase Storage
app.post('/api/storage/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const bucketName = req.body.bucketName || 'avatars'; // Change as needed

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const fileName = `${Date.now()}-${file.originalname}`;

        const { data, error } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) throw error;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        res.json({
            message: 'File uploaded successfully',
            path: data.path,
            url: publicUrl
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Demo route: List files in a bucket
app.get('/api/storage/list', async (req, res) => {
    const { bucketName } = req.query;

    if (!bucketName) {
        return res.status(400).json({ error: 'bucketName is required' });
    }

    try {
        const { data, error } = await supabase
            .storage
            .from(bucketName)
            .list('', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`✨ Connected to Supabase (URL: ${process.env.SUPABASE_URL})`);
});

// Handle server errors (e.g., port already in use)
server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
        console.error(`\n❌ Error: Port ${PORT} is already in use.`);
        console.error(`   A previous instance of the server might still be running.`);
        process.exit(1);
    } else {
        console.error("\n❌ Server error:", err);
        process.exit(1);
    }
});
