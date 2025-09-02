const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, unique: true },
    filename: { type: String },
    contentType: { type: String },
    data: { type: Buffer },
  },
  { timestamps: true }
);

imageSchema.index({ chat: 1 }, { unique: true });

module.exports = mongoose.model('Image', imageSchema);
