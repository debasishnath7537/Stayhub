const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Property = require('../models/Property');
const auth = require('../middleware/auth');

// @route   POST /api/reviews
// @desc    Add a review for a property after checkout
router.post('/', auth, async (req, res) => {
  try {
    const { propertyId, bookingId, rating, comment } = req.body;
    
    // 1. Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // 2. Validate booking exists, belongs to user, and is eligible for review
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to review this booking' });
    }
    
    if (booking.property.toString() !== propertyId) {
      return res.status(400).json({ message: 'Booking does not match this property' });
    }
    
    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ message: 'Only confirmed stays can be reviewed' });
    }

    if (new Date(booking.checkOutDate) > new Date()) {
      return res.status(400).json({ message: 'You can only review after checkout date has passed' });
    }

    // 3. Prevent duplicate reviews for same booking
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this stay' });
    }

    // 4. Create review
    const newReview = new Review({
      user: req.user.id,
      property: propertyId,
      booking: bookingId,
      rating,
      comment
    });
    
    await newReview.save();

    // 5. Update Property's average rating and total reviews
    const allReviews = await Review.find({ property: propertyId });
    const totalReviews = allReviews.length;
    const avgRating = totalReviews > 0 
      ? allReviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
      : rating; // Fallback
      
    await Property.findByIdAndUpdate(propertyId, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviews: totalReviews
    });

    res.status(201).json(newReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/reviews/property/:propertyId
// @desc    Get all reviews for a specific property
// @access  Public
router.get('/property/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
      
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/reviews/my-reviews
// @desc    Get all reviews made by logged-in user
router.get('/my-reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('property', 'name location images')
      .sort({ createdAt: -1 });
      
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
