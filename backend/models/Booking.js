const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  roomTypeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  numberOfRooms: { type: Number, required: true, min: 1, default: 1 },
  checkInDate: { type: Date, required: true },
  checkOutDate: { type: Date, required: true },
  guests: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Pending' },
  paymentDetails: {
    method: { type: String }, // 'Razorpay', 'Stripe', 'PayAtHotel'
    transactionId: { type: String }
  },
  guestGstNumber: { type: String, trim: true },
  guestCompanyName: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
