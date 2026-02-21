import { supabase } from '../lib/supabase.js';

// Helper to validate URL
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

export const createMonitor = async (req, res) => {
    const { name, target_url } = req.body;
    const userId = req.user.id;

    if (!name || !target_url) {
        return res.status(400).json({ error: 'Name and target_url are required' });
    }

    if (!isValidUrl(target_url)) {
        return res.status(400).json({ error: 'Invalid target_url format' });
    }

    try {
        const { data, error } = await supabase
            .from('monitors')
            .insert([{
                name,
                target_url,
                user_id: userId
            }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') return res.status(400).json({ error: 'A monitor with this name already exists for this user' });
            throw error;
        }

        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMonitors = async (req, res) => {
    const userId = req.user.id;

    try {
        const { data, error } = await supabase
            .from('monitors')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMonitorById = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const { data, error } = await supabase
            .from('monitors')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Monitor not found' });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateMonitor = async (req, res) => {
    const { id } = req.params;
    const { name, target_url, is_active } = req.body;
    const userId = req.user.id;

    if (target_url && !isValidUrl(target_url)) {
        return res.status(400).json({ error: 'Invalid target_url format' });
    }

    try {
        const { data, error } = await supabase
            .from('monitors')
            .update({ name, target_url, is_active })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') return res.status(400).json({ error: 'A monitor with this name already exists' });
            throw error;
        }

        if (!data) return res.status(404).json({ error: 'Monitor not found' });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteMonitor = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const { data, error } = await supabase
            .from('monitors')
            .delete()
            .eq('id', id)
            .eq('user_id', userId)
            .select();

        if (error) throw error;
        if (!data || data.length === 0) return res.status(404).json({ error: 'Monitor not found' });

        res.json({ message: 'Monitor deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const rotateApiKey = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        // Supabase/Postgres specific: to generate a new UUID in JS we use crypto.randomUUID()
        // or we could let the DB do it, but update expects values.
        const newApiKey = crypto.randomUUID();

        const { data, error } = await supabase
            .from('monitors')
            .update({ api_key: newApiKey })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Monitor not found' });

        res.json({ message: 'API key rotated successfully', api_key: data.api_key });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
