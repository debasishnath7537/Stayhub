const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, unique: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 }
}, { timestamps: true });

// Prevent duplicate reviews from same user for same property (though the unique booking index generally handles this per-stay)
reviewSchema.index({ user: 1, property: 1, booking: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
