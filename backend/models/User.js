const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, sparse: true, default: null },
  password: { type: String, required: true },
  phone: { type: String, sparse: true, default: null },
  role: { type: String, enum: ['customer', 'admin', 'owner'], default: 'customer' },
  firebaseUid: { type: String, sparse: true, default: null },
  avatar: { type: String, default: null },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
