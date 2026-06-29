require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// ── Change these ──────────────────────────────
const ADMIN_NAME     = 'Admin';
const ADMIN_EMAIL    = 'admin@stayhub.com';
const ADMIN_PASSWORD = 'Admin@123';
// ─────────────────────────────────────────────

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    // If user exists, just upgrade to admin
    existing.role = 'admin';
    await existing.save();
    console.log(`✅ Existing user "${ADMIN_EMAIL}" upgraded to admin.`);
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, salt);
    await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: hashed, role: 'admin' });
    console.log(`✅ Admin account created!`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
  }

  await mongoose.disconnect();
})();
