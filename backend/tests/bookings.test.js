const request = require('supertest');
const app = require('../index');

describe('Bookings API', () => {
  let adminToken;
  let customerToken;
  let propertyId;
  let bookingId;

  const adminUser = { name: 'Admin', email: 'admin_booking@test.com', password: 'password123', role: 'admin' };
  const customerUser = { name: 'Customer', email: 'customer_booking@test.com', password: 'password123', role: 'customer' };

  const sampleProperty = {
    type: 'Hotel',
    name: 'Booking Test Hotel',
    location: { city: 'Test City', address: '123 Test St' },
    basePrice: 100,
    platformPrice: 120,
    description: 'A beautiful test hotel for booking',
    roomTypes: [{
      name: 'Standard Room',
      totalInventory: 5,
      capacity: 2,
      price: 100,
      amenities: ['WiFi']
    }]
  };
  
  let roomTypeId;

  beforeAll(async () => {
    // Register and login Admin
    await request(app).post('/api/auth/register').send(adminUser);
    const adminLogin = await request(app).post('/api/auth/login').send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;

    // Register and login Customer
    await request(app).post('/api/auth/register').send(customerUser);
    const customerLogin = await request(app).post('/api/auth/login').send({ email: customerUser.email, password: customerUser.password });
    customerToken = customerLogin.body.token;

    // Create a property
    const propRes = await request(app)
      .post('/api/properties')
      .set('x-auth-token', adminToken)
      .send(sampleProperty);
    propertyId = propRes.body._id;
    roomTypeId = propRes.body.roomTypes[0]._id;
  });

  describe('POST /api/bookings', () => {
    it('should allow customer to create a booking', async () => {
      const newBooking = {
        property: propertyId,
        roomTypeId: roomTypeId,
        numberOfRooms: 1,
        checkInDate: new Date('2026-07-01'),
        checkOutDate: new Date('2026-07-05'),
        guests: 2,
        totalAmount: 500,
      };

      const res = await request(app)
        .post('/api/bookings')
        .set('x-auth-token', customerToken)
        .send(newBooking);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.property).toEqual(propertyId);
      bookingId = res.body._id;
    });

    it('should deny unauthenticated booking attempt', async () => {
      const newBooking = {
        property: propertyId,
        roomTypeId: roomTypeId,
        numberOfRooms: 1,
        checkInDate: new Date('2026-07-01'),
        checkOutDate: new Date('2026-07-05'),
        guests: 2,
        totalAmount: 500,
      };

      const res = await request(app)
        .post('/api/bookings')
        .send(newBooking); // No token sent

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/bookings/my-bookings', () => {
    it('should fetch the logged-in user\'s bookings', async () => {
      const res = await request(app)
        .get('/api/bookings/my-bookings')
        .set('x-auth-token', customerToken);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
      expect(res.body[0]._id).toEqual(bookingId);
    });
  });

  describe('PUT /api/bookings/:id/cancel', () => {
    it('should allow the user to cancel their booking', async () => {
      const res = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('x-auth-token', customerToken);

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('Cancelled');
    });

    it('should deny canceling an already cancelled booking', async () => {
      const res = await request(app)
        .put(`/api/bookings/${bookingId}/cancel`)
        .set('x-auth-token', customerToken);

      expect(res.statusCode).toEqual(400);
      expect(res.body.msg).toEqual('Booking already cancelled');
    });
  });
});
