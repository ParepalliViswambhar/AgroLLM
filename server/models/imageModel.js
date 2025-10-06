const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    filename: { type: String },
    contentType: { type: String },
    data: { type: Buffer },
  },
  { timestamps: true }
);


module.exports = mongoose.model('Image', imageSchema);
