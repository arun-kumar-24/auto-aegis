import { supabase } from '../lib/supabase.js';

export const ingestJourney = async (req, res) => {
    const { payload } = req.body;
    const monitorId = req.monitor.id;

    if (!payload) {
        return res.status(400).json({ error: 'Payload is required' });
    }

    try {
        const { data, error } = await supabase
            .from('journey_logs')
            .insert([{
                monitor_id: monitorId,
                payload
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Journey log captured', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const ingestSynthetic = async (req, res) => {
    const { status, response_time_ms, evidence, error_message } = req.body;
    const monitorId = req.monitor.id;

    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['PASS', 'FAIL', 'DEGRADED'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status. Must be PASS, FAIL, or DEGRADED' });
    }

    try {
        const { data, error } = await supabase
            .from('synthetic_results')
            .insert([{
                monitor_id: monitorId,
                status,
                response_time_ms,
                evidence,
                error_message
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json({ message: 'Synthetic result logged', id: data.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
