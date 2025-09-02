const mongoose = require('mongoose');

const chatSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    messages: [
      {
        sender: { type: String, enum: ['user', 'bot'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
