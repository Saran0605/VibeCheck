const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const PromptHistory = require('../models/PromptHistory');

// GET user history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const history = await PromptHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();

    return res.json({ history });
  } catch (error) {
    console.error(`[HistoryRoutes] Error fetching history: ${error.message}`);
    return res.status(500).json({ error: 'Failed to fetch prompt history' });
  }
});

// PATCH prompt history feedback (toggle success)
router.patch('/history/:id/feedback', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { success } = req.body;

    const doc = await PromptHistory.findOne({ _id: id, userId: req.user.id });
    if (!doc) {
      return res.status(404).json({ error: 'Prompt history record not found' });
    }

    doc.success = typeof success === 'boolean' ? success : !doc.success;
    await doc.save();

    console.log(`[PROMPT_FEEDBACK] prompt feedback updated id=${doc._id} success=${doc.success} traceId=${doc.traceId}`);

    return res.json({ message: 'Feedback updated', success: doc.success, doc });
  } catch (error) {
    console.error(`[HistoryRoutes] Error updating feedback: ${error.message}`);
    return res.status(500).json({ error: 'Failed to update feedback' });
  }
});

module.exports = router;
