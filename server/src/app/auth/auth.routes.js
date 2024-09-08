const express = require('express');
const router = express.Router();
const authService = require('./auth.service');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await authService.login(username, password);
        res.json({ message: 'Login successful', user }); // Include user data in the response if needed
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        await authService.register(username, email, password);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;