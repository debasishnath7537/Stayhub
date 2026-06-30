const express = require('express');
const auth = require('../middleware/auth');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

const router = express.Router();

// Middleware: owner-only check
const ownerOnly = (req, res, next) => {
  if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Owner access only' });
  next();
};

// @route GET /api/owner/my-properties
// @desc  All properties assigned to the logged-in owner
router.get('/my-properties', auth, ownerOnly, async (req, res) => {
  try {
    const properties = await Property.find({ ownedBy: req.user.id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/owner/my-bookings
// @desc  All bookings for the owner's properties
router.get('/my-bookings', auth, ownerOnly, async (req, res) => {
  try {
    const myProperties = await Property.find({ ownedBy: req.user.id }).select('_id');
    const propertyIds = myProperties.map(p => p._id);

    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('property', 'name type location images platformPrice basePrice')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET /api/owner/stats
// @desc  Aggregated stats for the owner's portfolio
router.get('/stats', auth, ownerOnly, async (req, res) => {
  try {
    const myProperties = await Property.find({ ownedBy: req.user.id }).select('_id platformPrice basePrice isActive');
    const propertyIds = myProperties.map(p => p._id);

    const bookings = await Booking.find({ property: { $in: propertyIds } });

    const now = new Date();
    const totalRevenue = bookings
      .filter(b => b.status === 'Confirmed')
      .reduce((s, b) => s + (b.totalAmount || 0), 0);

    // Owner profit = basePrice portion only (net rate × nights)
    // Approximate: ratio of basePrice/platformPrice applied to totalAmount
    const payoutRatios = {};
    myProperties.forEach(p => { payoutRatios[p._id.toString()] = p.basePrice / p.platformPrice; });

    const estimatedPayout = bookings
      .filter(b => b.status === 'Confirmed')
      .reduce((s, b) => {
        const ratio = payoutRatios[b.property?.toString()] ?? 0.85;
        return s + (b.totalAmount || 0) * ratio;
      }, 0);

    res.json({
      totalProperties: myProperties.length,
      activeProperties: myProperties.filter(p => p.isActive).length,
      totalBookings: bookings.length,
      upcomingBookings: bookings.filter(b => b.status === 'Confirmed' && new Date(b.checkOutDate) >= now).length,
      checkedOutBookings: bookings.filter(b => b.status === 'Confirmed' && new Date(b.checkOutDate) < now).length,
      cancelledBookings: bookings.filter(b => b.status === 'Cancelled').length,
      totalRevenue: Math.round(totalRevenue),
      estimatedPayout: Math.round(estimatedPayout),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT /api/owner/properties/:id/inventory
// @desc  Update total inventory for a specific room type
router.put('/properties/:id/inventory', auth, ownerOnly, async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, ownedBy: req.user.id });
    if (!property) return res.status(404).json({ msg: 'Property not found' });
    
    const { roomTypeId, totalInventory } = req.body;
    const room = property.roomTypes.id(roomTypeId);
    if (!room) return res.status(404).json({ msg: 'Room type not found' });
    
    // Ensure inventory is at least 0
    room.totalInventory = Math.max(0, parseInt(totalInventory, 10));
    await property.save();
    
    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
