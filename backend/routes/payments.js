const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const auth = require('../middleware/auth');

const router = express.Router();

const getRazorpay = () => new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route POST /api/payments/create-order
// @desc  Create a Razorpay order — called before opening the payment modal
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount } = req.body; // amount in rupees

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await getRazorpay().orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay create-order error:', err.message);
    res.status(500).json({ msg: 'Failed to create payment order', error: err.message });
  }
});

// @route POST /api/payments/verify
// @desc  Verify Razorpay payment signature after modal closes
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ msg: 'Payment verification failed — invalid signature' });
    }

    res.json({ verified: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error('Razorpay verify error:', err.message);
    res.status(500).json({ msg: 'Verification error', error: err.message });
  }
});

module.exports = router;
