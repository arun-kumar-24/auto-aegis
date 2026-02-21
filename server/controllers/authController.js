import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../lib/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived
const REFRESH_TOKEN_EXPIRY = '7d';  // Long-lived

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

const setCookies = (res, accessToken, refreshToken) => {
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    };

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); // 15 mins
    res.cookie('refreshToken', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 days
};

export const signup = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert into Supabase
        const { data, error } = await supabase
            .from('users')
            .insert([{ email, password_hash: passwordHash }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') return res.status(400).json({ error: 'User already exists' });
            throw error;
        }

        res.status(201).json({ message: 'User created successfully', user: { id: data.id, email: data.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        setCookies(res, accessToken, refreshToken);

        res.json({ message: 'Login successful', user: { id: user.id, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const logout = (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
};

export const refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;

    if (!token) return res.status(401).json({ error: 'No refresh token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (error || !user) return res.status(401).json({ error: 'User not found' });

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        setCookies(res, newAccessToken, newRefreshToken);

        res.json({ message: 'Token refreshed' });
    } catch (err) {
        res.status(403).json({ error: 'Invalid refresh token' });
    }
};

export const getMe = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, email, created_at')
            .eq('id', req.user.id)
            .single();

        if (error) throw error;
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
