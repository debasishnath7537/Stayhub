const express = require('express');
const bcrypt = require('bcryptjs');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { sendWelcomeEmail } = require('../utils/mailer');

const router = express.Router();

// Middleware to check for Admin role
const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Access denied. Admin only.' });
  }
};

// @route GET api/properties
// @desc Get all properties (public, with filters)
router.get('/', async (req, res) => {
  try {
    const { type, city, search, all } = req.query;
    // When admin requests all=1, skip isActive filter
    let query = all === '1' ? {} : { isActive: true };
    
    if (type) query.type = type;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [
        { 'location.city': re },
        { 'location.address': re },
        { name: re }
      ];
    }

    const properties = await Property.find(query).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET api/properties/cities
// @desc  Get unique city list for autocomplete (must be before /:id)
router.get('/cities', async (req, res) => {
  try {
    const cities = await Property.distinct('location.city', { isActive: true });
    res.json(cities.filter(Boolean).sort());
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route GET api/properties/:id/availability
// @desc Get availability for property room types
router.get('/:id/availability', async (req, res) => {
  try {
    const { checkInDate, checkOutDate } = req.query;
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ msg: 'Please provide checkInDate and checkOutDate' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });

    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);

    const overlappingBookings = await Booking.find({
      property: property._id,
      status: { $in: ['Pending', 'Confirmed'] },
      $or: [
        { checkInDate: { $lt: outDate }, checkOutDate: { $gt: inDate } }
      ]
    });

    const bookedCounts = {};
    overlappingBookings.forEach(booking => {
      const rtId = booking.roomTypeId.toString();
      bookedCounts[rtId] = (bookedCounts[rtId] || 0) + (booking.numberOfRooms || 1);
    });

    const availability = property.roomTypes.map(rt => {
      const booked = bookedCounts[rt._id.toString()] || 0;
      return {
        ...rt.toObject(),
        availableInventory: Math.max(0, rt.totalInventory - booked)
      };
    });

    res.json(availability);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Property not found' });
    res.status(500).send('Server Error');
  }
});

// @route GET api/properties/:id
// @desc Get single property
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });
    res.json(property);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Property not found' });
    res.status(500).send('Server Error');
  }
});

// @route POST api/properties/enquiry
// @desc Submit a property enquiry (Public)
router.post('/enquiry', async (req, res) => {
  try {
    const { name, type, location, basePrice, platformPrice, description, amenities, images, ownerContact, ownerNote } = req.body;
    
    // Ensure the property is strictly inactive and unassigned
    const newProperty = new Property({
      name, type, location, basePrice, platformPrice, description, amenities, images, ownerContact, ownerNote,
      isActive: false,
      ownedBy: null,
      roomTypes: []
    });

    const property = await newProperty.save();
    res.json({ msg: 'Enquiry submitted successfully', property });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST api/properties/:id/onboard
// @desc Onboard a property and create owner (Admin only)
router.post('/:id/onboard', [auth, adminAuth], async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });
    if (!property.ownerContact || !property.ownerContact.email) {
      return res.status(400).json({ msg: 'No owner contact email found on this property' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: property.ownerContact.email });
    const generatedPassword = 'Welcome123!';

    if (!user) {
      // Create new owner user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);
      
      user = new User({
        name: property.ownerContact.name || 'Property Owner',
        email: property.ownerContact.email,
        password: hashedPassword,
        phone: property.ownerContact.phone,
        role: 'owner'
      });
      await user.save();
    }

    // Assign property and activate
    property.ownedBy = user._id;
    property.isActive = true;
    await property.save();

    // Send Welcome Email
    try {
      await sendWelcomeEmail(user.email, generatedPassword);
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr);
    }

    res.json({ 
      msg: 'Property approved and owner onboarded successfully.',
      property,
      owner: { email: user.email, password: generatedPassword, isNew: !user }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST api/properties
// @desc Create a property (Admin only)
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const newProperty = new Property(req.body);
    const property = await newProperty.save();
    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route PUT api/properties/:id
// @desc Update a property (Admin only)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ msg: 'Property not found' });

    property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json(property);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route DELETE api/properties/:id
// @desc  Deactivate a property (Admin only)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!property) return res.status(404).json({ msg: 'Property not found' });
    res.json({ msg: 'Property deactivated', property });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
