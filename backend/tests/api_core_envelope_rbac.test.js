const request = require('supertest');
const express = require('express');
const responseEnvelope = require('../middleware/responseEnvelope');
const { errorHandler, notFound } = require('../middleware/errorMiddleware');
const { requireRoles, requirePermission, normalizeRole } = require('../middleware/rbacMiddleware');

describe('API Core Infrastructure & RBAC Middleware Test Suite', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use(responseEnvelope);

    // Mock test routes
    app.get('/test/success', (req, res) => {
      res.success({ message: 'Operation completed' }, { customMeta: 123 });
    });

    app.get('/test/error', (req, res) => {
      res.error('BAD_REQUEST', 'Validation failed on query params', 400, ['param1 is required']);
    });

    app.get('/test/throw', (req, res, next) => {
      next(new Error('Unexpected runtime exception'));
    });

    // Mock authenticated user injector
    const mockAuthAs = (role) => (req, res, next) => {
      req.user = { _id: '507f1f77bcf86cd799439011', name: 'Test User', role };
      next();
    };

    // RBAC routes
    app.get('/test/admin-only', requireRoles('super_admin'), (req, res) => {
      res.success({ authorized: true });
    });

    app.get(
      '/test/store-manager',
      mockAuthAs('store_manager'),
      requireRoles('store_manager', 'super_admin'),
      (req, res) => {
        res.success({ role: req.user.role });
      }
    );

    app.get(
      '/test/forbidden-role',
      mockAuthAs('support'),
      requireRoles('finance'),
      (req, res) => {
        res.success({ status: 'ok' });
      }
    );

    app.get(
      '/test/permission-catalog',
      mockAuthAs('store_manager'),
      requirePermission('catalog:manage'),
      (req, res) => {
        res.success({ canManageCatalog: true });
      }
    );

    app.get(
      '/test/permission-denied',
      mockAuthAs('support'),
      requirePermission('system:manage'),
      (req, res) => {
        res.success({ ok: true });
      }
    );

    app.use(notFound);
    app.use(errorHandler);
  });

  describe('1. Response Envelope & Request-ID Tracing', () => {
    it('should inject X-Request-ID header and wrap output in { data, meta: { requestId } }', async () => {
      const res = await request(app).get('/test/success');

      expect(res.status).toBe(200);
      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.headers['x-request-id']).toMatch(/^req_/);
      expect(res.body.data).toEqual({ message: 'Operation completed' });
      expect(res.body.meta.requestId).toBe(res.headers['x-request-id']);
      expect(res.body.meta.timestamp).toBeDefined();
      expect(res.body.meta.customMeta).toBe(123);
    });

    it('should propagate client-supplied X-Request-ID throughout the lifecycle', async () => {
      const customRequestId = 'req_custom_trace_98765';
      const res = await request(app)
        .get('/test/success')
        .set('x-request-id', customRequestId);

      expect(res.status).toBe(200);
      expect(res.headers['x-request-id']).toBe(customRequestId);
      expect(res.body.meta.requestId).toBe(customRequestId);
    });

    it('should format deliberate errors using { error: { code, message, requestId } }', async () => {
      const res = await request(app).get('/test/error');

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('BAD_REQUEST');
      expect(res.body.error.message).toBe('Validation failed on query params');
      expect(res.body.error.requestId).toBeDefined();
      expect(res.body.error.details).toEqual(['param1 is required']);
    });

    it('should catch unhandled exceptions and format them with 500 error envelope', async () => {
      const res = await request(app).get('/test/throw');

      expect(res.status).toBe(500);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(res.body.error.message).toBe('Unexpected runtime exception');
      expect(res.body.error.requestId).toBeDefined();
    });

    it('should return 404 error envelope for nonexistent endpoints', async () => {
      const res = await request(app).get('/nonexistent-path-abc');

      expect(res.status).toBe(404);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.message).toContain('Endpoint Not Found');
    });
  });

  describe('2. Role-Based Access Control (RBAC) & Capabilities', () => {
    it('should normalize legacy admin to super_admin', () => {
      expect(normalizeRole('admin')).toBe('super_admin');
      expect(normalizeRole('ADMIN')).toBe('super_admin');
      expect(normalizeRole('Store_Manager')).toBe('store_manager');
      expect(normalizeRole(null)).toBe('customer');
    });

    it('should reject unauthenticated requests with 401 UNAUTHORIZED', async () => {
      const res = await request(app).get('/test/admin-only');

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should permit authorized role requests', async () => {
      const res = await request(app).get('/test/store-manager');

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe('store_manager');
    });

    it('should reject unauthorized role requests with 403 FORBIDDEN', async () => {
      const res = await request(app).get('/test/forbidden-role');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain("Role 'support' does not have permission");
    });

    it('should grant access when user role holds required capability permission', async () => {
      const res = await request(app).get('/test/permission-catalog');

      expect(res.status).toBe(200);
      expect(res.body.data.canManageCatalog).toBe(true);
    });

    it('should deny access when user role lacks capability permission', async () => {
      const res = await request(app).get('/test/permission-denied');

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('FORBIDDEN');
      expect(res.body.error.message).toContain("lacks the required 'system:manage' permission");
    });
  });
});
