const request = require('supertest');
const express = require('express');
const responseEnvelope = require('../middleware/responseEnvelope');
const v1Router = require('../routes/v1Router');

describe('API Versioning & App Version Endpoint', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(responseEnvelope);
    app.use('/api/v1', v1Router);
    app.get('/api/app-version', (req, res) => {
      return res.redirect(307, '/api/v1/app-version');
    });
  });

  it('should return app version metadata with standardized envelope on /api/v1/app-version', async () => {
    const res = await request(app).get('/api/v1/app-version');

    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(res.body.data).toBeDefined();
    expect(res.body.data.currentVersion).toBe('1.0.0');
    expect(res.body.data.minSupportedVersion).toBe('0.1.0');
    expect(res.body.data.forceUpdate).toBe(false);
    expect(res.body.meta.requestId).toBeDefined();
  });

  it('should redirect legacy /api/app-version to /api/v1/app-version', async () => {
    const res = await request(app).get('/api/app-version');

    expect(res.status).toBe(307);
    expect(res.headers.location).toBe('/api/v1/app-version');
  });
});
