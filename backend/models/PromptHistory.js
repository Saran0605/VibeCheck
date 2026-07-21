const mongoose = require('mongoose');

const promptHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rawPrompt: {
    type: String,
    required: true,
  },
  chosenPrompt: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['vague', 'underspecified', 'well-scoped'],
    default: 'underspecified',
  },
  embedding: {
    type: [Number],
    default: [],
  },
  tokensInput: {
    type: Number,
    default: 0,
  },
  tokensOutput: {
    type: Number,
    default: 0,
  },
  costUsd: {
    type: Number,
    default: 0,
  },
  latencyMs: {
    type: Number,
    default: 0,
  },
  success: {
    type: Boolean,
    default: true,
  },
  generatedCode: {
    type: String,
    default: '',
  },
  traceId: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('PromptHistory', promptHistorySchema);
