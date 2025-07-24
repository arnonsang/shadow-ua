import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createConfig } from './config';
import { createRateLimiter } from './middleware/rateLimit';
import { requestLogger } from './middleware/logging';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import uaRoutes from './routes/ua';
import systemRoutes from './routes/system';
import { ServerConfig } from './types/api';

export class ShadowUAServer {
  private app: express.Application;
  private config: ServerConfig;
  private server?: any;

  constructor(config: Partial<ServerConfig> = {}) {
    this.config = createConfig(config);
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Trust proxy if configured
    if (this.config.security.trustProxy) {
      this.app.set('trust proxy', true);
    }

    // Security middleware
    if (this.config.security.helmet) {
      this.app.use(helmet());
    }

    // CORS
    if (this.config.cors.enabled) {
      this.app.use(cors({
        origin: this.config.cors.origins,
        credentials: true,
      }));
    }

    // Rate limiting
    this.app.use(createRateLimiter(this.config.rateLimit));

    // Body parsing
    this.app.use(express.json({ limit: '1mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // Request logging
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api', uaRoutes);
    this.app.use('/api', systemRoutes);

    // Root level routes (for convenience)
    this.app.use('/', uaRoutes);
    this.app.use('/', systemRoutes);

    // API info endpoint
    this.app.get('/', (_, res) => {
      res.json({
        name: 'ShadowUA API',
        version: process.env.npm_package_version || '1.0.0',
        description: 'REST API for generating realistic User-Agent strings',
        endpoints: [
          'GET /ua - Generate single user agent',
          'GET /uas - Generate multiple user agents',
          'POST /ua/export - Export user agents in specified format',
          'GET /health - Health check',
          'GET /stats - API usage statistics',
          'GET /components - Available components and combinations',
        ],
        documentation: 'https://github.com/arnonsang/shadow-ua',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, this.config.host, () => {
          console.log(`🚀 ShadowUA API server started`);
          console.log(`📍 Server: http://${this.config.host}:${this.config.port}`);
          console.log(`🔒 Security: ${this.config.security.helmet ? 'Helmet enabled' : 'Basic security'}`);
          console.log(`🌐 CORS: ${this.config.cors.enabled ? 'Enabled' : 'Disabled'}`);
          console.log(`⏱️  Rate limit: ${this.config.rateLimit.max} requests per ${this.config.rateLimit.windowMs / 1000}s`);
          console.log(`📊 Endpoints: /ua, /uas, /ua/export, /health, /stats, /components`);
          resolve();
        });

        this.server.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            console.error(`❌ Port ${this.config.port} is already in use`);
            reject(new Error(`Port ${this.config.port} is already in use`));
          } else {
            console.error('❌ Server error:', error);
            reject(error);
          }
        });
      } catch (error) {
        console.error('❌ Failed to start server:', error);
        reject(error);
      }
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('🛑 Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getConfig(): ServerConfig {
    return this.config;
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new ShadowUAServer();
  
  server.start().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await server.stop();
    process.exit(0);
  });
}

export default ShadowUAServer;