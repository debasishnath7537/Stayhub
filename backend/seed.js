require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Property = require('./models/Property');
const Booking = require('./models/Booking');

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // 1. Clear Existing Data
    console.log('Clearing old data...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});

    // 2. Create Users
    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const admin = await User.create({ name: 'System Admin', email: 'admin@example.com', password, role: 'admin' });
    const owner = await User.create({ name: 'Hotel Owner', email: 'owner@example.com', password, role: 'owner' });
    const customer = await User.create({ name: 'Regular Customer', email: 'customer@example.com', password, role: 'customer' });

    console.log(`Created Users: admin@example.com, owner@example.com, customer@example.com (Password: password123)`);

    // 3. Create Properties with Room Types
    console.log('Creating properties & room types...');
    const propertiesData = [
      {
        type: 'Hotel',
        name: 'Grand Horizon Hotel',
        location: { city: 'Goa', address: '123 Beachfront Avenue, North Goa' },
        images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
        basePrice: 1400, platformPrice: 1650,
        amenities: ['Free Wifi', 'AC', 'Breakfast Included', 'Pool', 'Spa', 'Gym'],
        description: 'Experience luxury at the Grand Horizon Hotel. Located right on the beach.',
        rating: 4.8, reviews: 124, isActive: true,
        roomTypes: [
          { name: 'Standard Room', capacity: 2, price: 1650, totalInventory: 10, amenities: ['AC', 'Wifi'] },
          { name: 'Ocean View Suite', capacity: 3, price: 2500, totalInventory: 5, amenities: ['AC', 'Wifi', 'Balcony'] }
        ]
      },
      {
        type: 'Homestay',
        name: 'Oceanview Homestay',
        location: { city: 'Kerala', address: 'Lighthouse Beach Road, Kovalam, Kerala' },
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'],
        basePrice: 1050, platformPrice: 1250,
        amenities: ['Free Wifi', 'AC', 'Breakfast Included', 'Parking'],
        description: 'Wake up to the sound of waves at this charming beachside homestay.',
        rating: 4.9, reviews: 89, isActive: true,
        roomTypes: [
          { name: '1 BHK Villa', capacity: 2, price: 1250, totalInventory: 2, amenities: ['Kitchen', 'Wifi'] },
          { name: '2 BHK Family Suite', capacity: 4, price: 2200, totalInventory: 1, amenities: ['Kitchen', 'Wifi', 'Living Room'] }
        ]
      },
      {
        type: 'Hotel',
        name: 'City Center Inn',
        location: { city: 'Mumbai', address: '42 Marine Lines, South Mumbai' },
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'],
        basePrice: 1600, platformPrice: 1850,
        amenities: ['Free Wifi', 'AC', 'Restaurant', 'Parking'],
        description: 'A sleek business-friendly hotel in the heart of South Mumbai.',
        rating: 4.5, reviews: 201, isActive: true,
        roomTypes: [
          { name: 'Deluxe Room', capacity: 2, price: 1850, totalInventory: 20, amenities: ['AC', 'Wifi'] },
          { name: 'Executive Suite', capacity: 2, price: 3000, totalInventory: 4, amenities: ['AC', 'Wifi', 'Work Desk'] }
        ]
      }
    ];

    const insertedProps = await Property.insertMany(propertiesData);

    // 4. Create Bookings
    console.log('Creating mock bookings...');
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnd = new Date(today); nextWeekEnd.setDate(nextWeekEnd.getDate() + 10);

    const prop1 = insertedProps[0];
    const prop2 = insertedProps[1];

    await Booking.create([
      {
        user: customer._id,
        property: prop1._id,
        roomTypeId: prop1.roomTypes[0]._id, // Standard Room
        numberOfRooms: 1,
        checkInDate: today,
        checkOutDate: tomorrow,
        guests: 2,
        totalAmount: prop1.roomTypes[0].price,
        status: 'Confirmed',
        paymentDetails: { method: 'Razorpay', transactionId: 'pay_mock123' }
      },
      {
        user: customer._id,
        property: prop2._id,
        roomTypeId: prop2.roomTypes[1]._id, // 2 BHK
        numberOfRooms: 1,
        checkInDate: nextWeek,
        checkOutDate: nextWeekEnd,
        guests: 4,
        totalAmount: prop2.roomTypes[1].price * 3, // 3 nights
        status: 'Confirmed',
        paymentDetails: { method: 'PayAtHotel' }
      }
    ]);

    console.log('✅ All mock data seeded successfully!');

  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

seedData();
