const express = require('express');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendBookingConfirmation, sendOwnerNotification } = require('../utils/mailer');

const router = express.Router();

// @route POST api/bookings
// @desc Create a new booking
router.post('/', auth, async (req, res) => {
  try {
    const { property, roomTypeId, numberOfRooms = 1, checkInDate, checkOutDate, guests, totalAmount, paymentDetails, guestGstNumber, guestCompanyName } = req.body;

    if (!roomTypeId) {
      return res.status(400).json({ msg: 'roomTypeId is required' });
    }

    // Availability validation
    const prop = await Property.findById(property);
    if (!prop) return res.status(404).json({ msg: 'Property not found' });

    const roomType = prop.roomTypes.id(roomTypeId);
    if (!roomType) return res.status(404).json({ msg: 'Room type not found in this property' });

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);

    const overlappingBookings = await Booking.find({
      property,
      roomTypeId,
      status: { $in: ['Pending', 'Confirmed'] },
      $or: [
        { checkInDate: { $lt: outDate }, checkOutDate: { $gt: inDate } }
      ]
    });

    const bookedCount = overlappingBookings.reduce((sum, b) => sum + (b.numberOfRooms || 1), 0);
    
    if (bookedCount + numberOfRooms > roomType.totalInventory) {
      return res.status(400).json({ msg: 'Not enough rooms available for the selected dates' });
    }

    const newBooking = new Booking({
      user: req.user.id,
      property,
      roomTypeId,
      numberOfRooms,
      checkInDate,
      checkOutDate,
      guests,
      totalAmount,
      paymentDetails,
      guestGstNumber,
      guestCompanyName,
      status: 'Confirmed' // Assuming instantly confirmed for MVP
    });

    const booking = await newBooking.save();

    // Send emails
    try {
      const user = await User.findById(req.user.id);
      if (user) await sendBookingConfirmation(user.email, booking);

      if (property.ownedBy) {
        const owner = await User.findById(property.ownedBy);
        if (owner) await sendOwnerNotification(owner.email, booking);
      }
    } catch (emailErr) {
      console.error('Failed to send booking emails:', emailErr);
    }

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET api/bookings/my-bookings
// @desc Get logged in user's bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('property', ['name', 'location', 'images']);
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT api/bookings/:id/cancel
// @desc Cancel a booking (owner only)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });
    if (booking.user.toString() !== req.user.id)
      return res.status(403).json({ msg: 'Not authorised' });
    if (booking.status === 'Cancelled')
      return res.status(400).json({ msg: 'Booking already cancelled' });

    booking.status = 'Cancelled';
    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET api/bookings/all
// @desc Get all bookings (Admin only)
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Access denied. Admin only.' });
    }
    const bookings = await Booking.find()
      .populate('user', ['name', 'email'])
      .populate('property', ['name', 'type', 'roomTypes']);
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
