const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    messages: [
      {
        sender: { type: String, enum: ['user', 'bot'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    topics: [{ type: String }], // Track crops, diseases, etc.
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
