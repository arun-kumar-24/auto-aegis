import { supabase } from '../lib/supabase.js';

export const validateApiKey = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: 'API key is missing' });
    }

    try {
        const { data: monitor, error } = await supabase
            .from('monitors')
            .select('id, user_id')
            .eq('api_key', apiKey)
            .single();

        if (error || !monitor) {
            return res.status(403).json({ error: 'Invalid API key' });
        }

        // Attach monitor info to request for the controller
        req.monitor = monitor;
        next();
    } catch (err) {
        res.status(500).json({ error: 'Server error during API key validation' });
    }
};
