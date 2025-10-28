import axios, { AxiosInstance } from 'axios';
import { config } from '../src/config.js';

const BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${config.server.port}`;
const AUTH_USERNAME = process.env.E2E_AUTH_USERNAME || '';
const AUTH_PASSWORD = process.env.E2E_AUTH_PASSWORD || '';

describe('API E2E Tests', () => {
  let client: AxiosInstance;
  let authToken: string;

  beforeAll(() => {
    client = axios.create({
      baseURL: BASE_URL,
      validateStatus: () => true, // Don't throw on any status code
    });

    console.log(`Running E2E tests against: ${BASE_URL}`);
  });

  describe('Status Endpoints', () => {
    it('GET /status should return app status', async () => {
      const response = await client.get('/status');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('git');
      expect(response.data.git).toHaveProperty('commit');
      expect(response.data).toHaveProperty('config');
      expect(response.data.config).toHaveProperty('cacheTTL');
    });

    it('GET /metrics should return metrics', async () => {
      const response = await client.get('/metrics');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('uptimeSeconds');
      expect(response.data).toHaveProperty('requests');
      expect(response.data.requests).toHaveProperty('total');
      expect(typeof response.data.uptimeSeconds).toBe('number');
    });
  });

  describe('Authentication', () => {
    it('POST /get-token should return 400 when credentials are missing', async () => {
      const response = await client.post('/get-token', {});

      expect(response.status).toBe(400);
      expect(response.data).toHaveProperty('error');
      expect(response.data.error).toBe('Username and password are required');
    });

    it('POST /get-token should return 401 with invalid credentials', async () => {
      const response = await client.post('/get-token', {
        username: 'wrong',
        password: 'wrong',
      });

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
      expect(response.data.error).toBe('Invalid credentials');
    });

    it('POST /get-token should return token with valid credentials', async () => {
      if (!AUTH_USERNAME || !AUTH_PASSWORD) {
        console.warn('Skipping auth test: E2E_AUTH_USERNAME/PASSWORD not set');
        return;
      }

      const response = await client.post('/get-token', {
        username: AUTH_USERNAME,
        password: AUTH_PASSWORD,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(typeof response.data.token).toBe('string');
      expect(response.data.token.length).toBeGreaterThan(0);

      // Save token for subsequent tests
      authToken = response.data.token;
    });
  });

  describe('Weather API', () => {
    beforeAll(async () => {
      // Get auth token if not already set
      if (!authToken && AUTH_USERNAME && AUTH_PASSWORD) {
        const response = await client.post('/get-token', {
          username: AUTH_USERNAME,
          password: AUTH_PASSWORD,
        });
        authToken = response.data.token;
      }
    });

    it('GET /weather/:city should return 401 without authentication', async () => {
      const response = await client.get('/weather/london');

      expect(response.status).toBe(401);
      expect(response.data).toHaveProperty('error');
    });

    it('GET /weather/:city should return 401 or 403 with invalid token', async () => {
      const response = await client.get('/weather/london', {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect([401, 403]).toContain(response.status);
      expect(response.data).toHaveProperty('error');
    });

    it('GET /weather/:city should return weather data with valid token', async () => {
      if (!authToken) {
        console.warn('Skipping weather test: No auth token available');
        return;
      }

      const response = await client.get('/weather/london', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('city');
      expect(response.data).toHaveProperty('weather');
      expect(response.data).toHaveProperty('temperature');
      expect(typeof response.data.temperature).toBe('number');
      expect(response.headers['x-cache-status']).toMatch(/HIT|MISS/);
    });

    it('GET /weather/:city should return cached data on second request', async () => {
      if (!authToken) {
        console.warn('Skipping cache test: No auth token available');
        return;
      }

      // Use a unique city to avoid cache from previous test runs
      const testCity = `tokyo`;

      // First request
      const response1 = await client.get(`/weather/${testCity}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response1.status).toBe(200);

      // Second request should hit cache (if first was MISS) or stay cached (if first was HIT)
      const response2 = await client.get(`/weather/${testCity}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      expect(response2.status).toBe(200);
      expect(response2.headers['x-cache-status']).toBe('HIT');
      expect(response2.data.city).toBe(response1.data.city);
      expect(response2.data.temperature).toBe(response1.data.temperature);
    });
  });
});
