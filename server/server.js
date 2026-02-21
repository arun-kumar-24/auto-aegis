import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { supabase } from './lib/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Setup Multer (InMemory for easy forwarding to Supabase)
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`✨ Connected to Supabase (URL: ${process.env.SUPABASE_URL})`);
});
