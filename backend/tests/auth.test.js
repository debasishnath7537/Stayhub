const request = require('supertest');
const app = require('../index'); // We exported the app instance

describe('Auth API', () => {
  const user = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'customer'
  };

  describe('POST /api/auth/register', () => {
    it('should register a user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(user);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', user.email);
    });

    it('should fail if user already exists', async () => {
      await request(app).post('/api/auth/register').send(user); // First registration
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(user); // Second registration should fail

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: user.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'Invalid Credentials');
    });
  });
});
