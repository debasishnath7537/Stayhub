const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let admin;
try { admin = require('../config/firebase'); } catch {}

const router = express.Router();

// @route POST api/auth/firebase
// @desc  Sign in / register via Firebase (Google or Phone OTP)
router.post('/firebase', async (req, res) => {
  try {
    if (!admin) return res.status(503).json({ msg: 'Firebase not configured' });

    const { idToken, role = 'customer' } = req.body;
    if (!idToken) return res.status(400).json({ msg: 'ID token required' });

    // 1. Verify token with Firebase Admin
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch {
      return res.status(401).json({ msg: 'Invalid or expired Firebase token' });
    }

    const { uid, email, phone_number, name: fbName, picture } = decoded;
    const displayName = fbName || (email ? email.split('@')[0] : `User_${uid.slice(0, 6)}`);

    // 2. Find or create user
    // Look up by email (Google) or phone (OTP)
    let user = email
      ? await User.findOne({ $or: [{ email }, { firebaseUid: uid }] })
      : await User.findOne({ firebaseUid: uid });

    if (!user) {
      // New user — create with appropriate role
      // Don't allow self-assigning 'admin' via Firebase
      const safeRole = role === 'admin' ? 'customer' : role;
      user = await User.create({
        name: displayName,
        email: email || null,
        phone: phone_number || null,
        password: 'FIREBASE_AUTH', // placeholder, not used for login
        role: safeRole,
        firebaseUid: uid,
        avatar: picture || null,
      });
    } else {
      // Existing user — update uid if missing
      if (!user.firebaseUid) { user.firebaseUid = uid; await user.save(); }

      // Role guard: owner login must match owner role
      if (role === 'owner' && user.role !== 'owner') {
        return res.status(403).json({ msg: 'Access denied. This portal is for property owners only.' });
      }
    }

    // 3. Sign our JWT and return
    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secretToken', { expiresIn: '5d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (err) {
    console.error('Firebase auth error:', err.message);
    res.status(500).send('Server Error');
  }
});



// @route POST api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password, role });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secretToken',
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secretToken',
      { expiresIn: '5d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const crypto = require('crypto');
const { sendPasswordReset } = require('../utils/mailer');

// @route POST api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    await sendPasswordReset(user.email, token);
    res.json({ msg: 'Password reset link sent to email' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route POST api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ msg: 'Password reset token is invalid or has expired.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ msg: 'Password has been updated successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
