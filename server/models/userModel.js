const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    googleId: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    expertAnalysisCount: { type: Number, default: 0 },
    expertAnalysisResetDate: { type: Date, default: Date.now },
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String, default: '' },
    timeoutUntil: { type: Date, default: null },
    timeoutReason: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'en' },
  },
  { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

module.exports = User;
