import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import ShadowUAServer from '../api/server';
import { Platform, Browser, DeviceType, ExportFormat } from '../types';

describe('ShadowUA API Server', () => {
  let server: ShadowUAServer;
  let app: any;

  beforeAll(async () => {
    server = new ShadowUAServer({
      port: 0, // Use random available port for testing
      cors: { enabled: false },
      security: { helmet: false, trustProxy: false },
      rateLimit: { windowMs: 60000, max: 1000, standardHeaders: true, legacyHeaders: false },
    });
    app = server.getApp();
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('Root endpoint', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');
      
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('ShadowUA API');
      expect(response.body.endpoints).toBeInstanceOf(Array);
      expect(response.body.endpoints.length).toBeGreaterThan(0);
    });
  });

  describe('Health check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.uptime).toBeTypeOf('number');
      expect(response.body.version).toBeTypeOf('string');
      expect(response.body.node).toBeTypeOf('string');
    });
  });

  describe('Single User-Agent generation', () => {
    it('should generate a user agent without filters', async () => {
      const response = await request(app).get('/ua');
      
      expect(response.status).toBe(200);
      expect(response.body.userAgent).toBeTypeOf('string');
      expect(response.body.components).toBeDefined();
      expect(response.body.components.platform).toBeDefined();
      expect(response.body.components.browser).toBeDefined();
      expect(response.body.timestamp).toBeTypeOf('string');
    });

    it('should generate a user agent with platform filter', async () => {
      const response = await request(app)
        .get('/ua')
        .query({ platform: Platform.Windows });
      
      expect(response.status).toBe(200);
      expect(response.body.components.platform).toBe(Platform.Windows);
    });

    it('should generate a user agent with browser filter', async () => {
      const response = await request(app)
        .get('/ua')
        .query({ browser: Browser.Chrome });
      
      expect(response.status).toBe(200);
      expect(response.body.components.browser).toBe(Browser.Chrome);
    });

    it('should return 400 for invalid platform', async () => {
      const response = await request(app)
        .get('/ua')
        .query({ platform: 'invalid-platform' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Multiple User-Agent generation', () => {
    it('should generate multiple user agents', async () => {
      const response = await request(app)
        .get('/uas')
        .query({ count: '3' });
      
      expect(response.status).toBe(200);
      expect(response.body.userAgents).toBeInstanceOf(Array);
      expect(response.body.userAgents.length).toBe(3);
      expect(response.body.count).toBe(3);
      expect(response.body.components).toBeInstanceOf(Array);
      expect(response.body.components.length).toBe(3);
    });

    it('should limit count to maximum allowed', async () => {
      const response = await request(app)
        .get('/uas')
        .query({ count: '2000' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle invalid count', async () => {
      const response = await request(app)
        .get('/uas')
        .query({ count: 'invalid' });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Export functionality', () => {
    it('should export user agents in JSON format', async () => {
      const response = await request(app)
        .post('/ua/export')
        .send({
          count: 2,
          format: ExportFormat.JSON,
          platform: Platform.Windows,
        });
      
      expect(response.status).toBe(200);
      expect(response.body.format).toBe(ExportFormat.JSON);
      expect(response.body.count).toBe(2);
      expect(response.body.content).toBeTypeOf('string');
      expect(response.body.parameters.platform).toBe(Platform.Windows);
    });

    it('should export user agents in CSV format', async () => {
      const response = await request(app)
        .post('/ua/export')
        .send({
          count: 2,
          format: ExportFormat.CSV,
        });
      
      expect(response.status).toBe(200);
      expect(response.body.format).toBe(ExportFormat.CSV);
      expect(response.body.content).toContain('user_agent');
    });

    it('should require format field', async () => {
      const response = await request(app)
        .post('/ua/export')
        .send({
          count: 2,
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Stats endpoint', () => {
    it('should return API usage statistics', async () => {
      // Make a few requests first
      await request(app).get('/ua');
      await request(app).get('/uas').query({ count: '2' });
      
      const response = await request(app).get('/stats');
      
      expect(response.status).toBe(200);
      expect(response.body.totalRequests).toBeTypeOf('number');
      expect(response.body.requestsByEndpoint).toBeTypeOf('object');
      expect(response.body.uptime).toBeTypeOf('number');
    });
  });

  describe('Components endpoint', () => {
    it('should return available components', async () => {
      const response = await request(app).get('/components');
      
      expect(response.status).toBe(200);
      expect(response.body.platforms).toBeInstanceOf(Array);
      expect(response.body.browsers).toBeInstanceOf(Array);
      expect(response.body.deviceTypes).toBeInstanceOf(Array);
      expect(response.body.exportFormats).toBeInstanceOf(Array);
      expect(response.body.combinations.totalPossible).toBeTypeOf('number');
      expect(response.body.combinations.platformBrowserMatrix).toBeTypeOf('object');
    });
  });

  describe('Error handling', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app).get('/unknown-endpoint');
      
      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.details.availableEndpoints).toBeInstanceOf(Array);
    });
  });
});