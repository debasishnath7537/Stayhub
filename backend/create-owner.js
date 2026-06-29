require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Property = require('./models/Property');

// ── Configure here ────────────────────────────────────────────────────────
const OWNER_NAME     = 'Property Owner';
const OWNER_EMAIL    = 'owner@stayhub.com';
const OWNER_PASSWORD = 'Owner@123';

// Optional: comma-separated property names to assign to this owner
// Leave empty [] to skip auto-assignment
const ASSIGN_PROPERTY_NAMES = []; // e.g. ['Grand Horizon Hotel', 'Oceanview Homestay']
// ─────────────────────────────────────────────────────────────────────────

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  let owner = await User.findOne({ email: OWNER_EMAIL });
  if (owner) {
    owner.role = 'owner';
    await owner.save();
    console.log(`✅ Existing user "${OWNER_EMAIL}" upgraded to owner role.`);
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(OWNER_PASSWORD, salt);
    owner = await User.create({ name: OWNER_NAME, email: OWNER_EMAIL, password: hashed, role: 'owner' });
    console.log(`✅ Owner account created!`);
    console.log(`   Email:    ${OWNER_EMAIL}`);
    console.log(`   Password: ${OWNER_PASSWORD}`);
  }

  // Optionally assign properties to this owner
  if (ASSIGN_PROPERTY_NAMES.length > 0) {
    const result = await Property.updateMany(
      { name: { $in: ASSIGN_PROPERTY_NAMES } },
      { $set: { ownedBy: owner._id } }
    );
    console.log(`   ↳ Assigned ${result.modifiedCount} properties to this owner.`);
  }

  await mongoose.disconnect();
  console.log('Done.');
})();
