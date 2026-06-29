const request = require('supertest');
const app = require('../index');

describe('Properties API', () => {
  let adminToken;
  let customerToken;
  let propertyId;

  const adminUser = { name: 'Admin', email: 'admin@test.com', password: 'password123', role: 'admin' };
  const customerUser = { name: 'Customer', email: 'customer@test.com', password: 'password123', role: 'customer' };

  const sampleProperty = {
    type: 'Hotel',
    name: 'Test Hotel',
    location: { city: 'Test City', address: '123 Test St' },
    basePrice: 100,
    platformPrice: 120,
    description: 'A beautiful test hotel'
  };

  beforeAll(async () => {
    // Register and login Admin
    await request(app).post('/api/auth/register').send(adminUser);
    const adminLogin = await request(app).post('/api/auth/login').send({ email: adminUser.email, password: adminUser.password });
    adminToken = adminLogin.body.token;

    // Register and login Customer
    await request(app).post('/api/auth/register').send(customerUser);
    const customerLogin = await request(app).post('/api/auth/login').send({ email: customerUser.email, password: customerUser.password });
    customerToken = customerLogin.body.token;
  });

  describe('POST /api/properties', () => {
    it('should allow admin to create a property', async () => {
      const res = await request(app)
        .post('/api/properties')
        .set('x-auth-token', adminToken)
        .send(sampleProperty);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toEqual(sampleProperty.name);
      propertyId = res.body._id; // Save for later tests
    });

    it('should reject property creation by non-admin', async () => {
      const res = await request(app)
        .post('/api/properties')
        .set('x-auth-token', customerToken)
        .send(sampleProperty);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('msg', 'Access denied. Admin only.');
    });

    it('should fail if required fields are missing', async () => {
      const invalidProperty = { name: 'Incomplete Hotel' };
      const res = await request(app)
        .post('/api/properties')
        .set('x-auth-token', adminToken)
        .send(invalidProperty);

      expect(res.statusCode).toEqual(500); // Mongoose validation error results in 500 in current code
    });
  });

  describe('GET /api/properties', () => {
    it('should fetch all active properties', async () => {
      const res = await request(app).get('/api/properties');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('should fetch a single property by ID', async () => {
      const res = await request(app).get(`/api/properties/${propertyId}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('_id', propertyId);
    });
  });
});
