const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  type: { type: String, enum: ['Hotel', 'Homestay'], required: true },
  name: { type: String, required: true },
  location: {
    city: { type: String, required: true },
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    }
  },
  images: [{ type: String }],
  basePrice: { type: Number, required: true },
  platformPrice: { type: Number, required: true },
  amenities: [{ type: String }],
  description: { type: String, required: true },
  roomTypes: [{
    name: { type: String, required: true },
    totalInventory: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    amenities: [{ type: String }],
    description: { type: String }
  }],
  rating: { type: Number, default: null },
  reviews: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  ownedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  ownerContact: {
    name: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  ownerNote: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
