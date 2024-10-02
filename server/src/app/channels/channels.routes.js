const express = require('express');
const router = express.Router();
const channelService = require('./channels.service');
const authenticate = require('../../middleware/auth.middleware');


// POST /api/groups/:groupId/channels (Group Admin only)
router.post('/:groupId/channels', authenticate, async (req, res) => {

    const groupId = parseInt(req.params.groupId);
    const { name } = req.body;

    try {
        await channelService.createChannel(groupId, name);
        res.status(201).json({ message: 'Channel created successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;