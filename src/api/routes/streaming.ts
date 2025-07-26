import { Router, Request, Response } from 'express';
import { createStreamingManager, generateClientScript, StreamingConfig } from '../streaming';

const router = Router();

// Default streaming configuration
const streamingConfig: StreamingConfig = {
  maxConnections: 100,
  heartbeatInterval: 30000, // 30 seconds
  uaRotationInterval: 60000, // 1 minute
  bufferSize: 1024,
  compression: true,
  authentication: {
    enabled: process.env.STREAMING_AUTH_ENABLED === 'true',
    apiKey: process.env.STREAMING_API_KEY,
    token: process.env.STREAMING_BEARER_TOKEN
  }
};

// Create streaming manager instance
const streamingManager = createStreamingManager(streamingConfig);

/**
 * @route GET /stream
 * @desc Establish Server-Sent Events connection for real-time UA rotation
 * @query browser - Filter by browser (Chrome, Firefox, Safari, Edge)
 * @query platform - Filter by platform (Windows, macOS, Linux, Android, iOS)
 * @query deviceType - Filter by device type (desktop, mobile, tablet)
 * @query concurrency - Number of concurrent generations
 * @query batchSize - Batch size for generation
 * @headers X-API-Key - API key for authentication (if enabled)
 * @headers Authorization - Bearer token for authentication (if enabled)
 */
router.get('/stream', (req: Request, res: Response) => {
  streamingManager.handleConnection(req, res);
});

/**
 * @route GET /stream/stats
 * @desc Get streaming statistics and performance metrics
 */
router.get('/stream/stats', (req: Request, res: Response) => {
  streamingManager.handleStatsRequest(req, res);
});

/**
 * @route POST /stream/bulk
 * @desc Generate multiple User-Agents in a single request
 * @body count - Number of UAs to generate (max 1000)
 * @body filters - UA filters (browser, platform, deviceType)
 * @body options - Generation options (concurrency, batchSize, etc.)
 */
router.post('/stream/bulk', async (req: Request, res: Response) => {
  await streamingManager.handleBulkRequest(req, res);
});

/**
 * @route GET /stream/client
 * @desc Get JavaScript client library for SSE consumption
 */
router.get('/stream/client', (req: Request, res: Response) => {
  const clientScript = generateClientScript();
  
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  
  res.send(clientScript);
});

/**
 * @route GET /stream/demo
 * @desc Get HTML demo page for testing the streaming API
 */
router.get('/stream/demo', (req: Request, res: Response) => {
  const demoHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShadowUA Streaming Demo</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .header {
            text-align: center;
            color: #333;
            border-bottom: 2px solid #007acc;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .controls {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .control-group {
            display: flex;
            flex-direction: column;
        }
        label {
            font-weight: bold;
            margin-bottom: 5px;
            color: #555;
        }
        select, input, button {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        button {
            background-color: #007acc;
            color: white;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #005a9e;
        }
        button:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        .status {
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 15px;
            font-weight: bold;
        }
        .status.connected {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .status.disconnected {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .status.connecting {
            background-color: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        .ua-display {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            word-break: break-all;
            line-height: 1.4;
            min-height: 100px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            font-size: 14px;
        }
        .stat-item {
            background-color: #f8f9fa;
            padding: 10px;
            border-radius: 4px;
            text-align: center;
        }
        .stat-value {
            font-size: 18px;
            font-weight: bold;
            color: #007acc;
        }
        .log {
            background-color: #000;
            color: #00ff00;
            padding: 15px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            height: 200px;
            overflow-y: auto;
            margin-top: 15px;
        }
        .filter-section {
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .filter-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #555;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🕵️ ShadowUA Streaming Demo</h1>
            <p>Real-time User-Agent rotation with Server-Sent Events</p>
        </div>

        <div class="filter-section">
            <div class="filter-title">Connection Filters</div>
            <div class="controls">
                <div class="control-group">
                    <label for="browser">Browser:</label>
                    <select id="browser">
                        <option value="">Any</option>
                        <option value="Chrome">Chrome</option>
                        <option value="Firefox">Firefox</option>
                        <option value="Safari">Safari</option>
                        <option value="Edge">Edge</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="platform">Platform:</label>
                    <select id="platform">
                        <option value="">Any</option>
                        <option value="Windows">Windows</option>
                        <option value="macOS">macOS</option>
                        <option value="Linux">Linux</option>
                        <option value="Android">Android</option>
                        <option value="iOS">iOS</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="deviceType">Device Type:</label>
                    <select id="deviceType">
                        <option value="">Any</option>
                        <option value="desktop">Desktop</option>
                        <option value="mobile">Mobile</option>
                        <option value="tablet">Tablet</option>
                    </select>
                </div>
                <div class="control-group">
                    <label for="apiKey">API Key (if required):</label>
                    <input type="password" id="apiKey" placeholder="Enter API key">
                </div>
            </div>
        </div>

        <div class="controls">
            <button id="connectBtn">Connect to Stream</button>
            <button id="disconnectBtn" disabled>Disconnect</button>
            <button id="clearLogBtn">Clear Log</button>
            <button id="testBulkBtn">Test Bulk Generation</button>
        </div>

        <div id="status" class="status disconnected">Disconnected</div>

        <div class="container">
            <h3>Current User-Agent</h3>
            <div id="currentUA" class="ua-display">No User-Agent received yet...</div>
        </div>

        <div class="container">
            <h3>Statistics</h3>
            <div class="stats">
                <div class="stat-item">
                    <div class="stat-value" id="uaCount">0</div>
                    <div>UAs Received</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="uptime">0s</div>
                    <div>Connection Time</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="dataTransfer">0 KB</div>
                    <div>Data Transferred</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value" id="activeClients">-</div>
                    <div>Active Clients</div>
                </div>
            </div>
        </div>

        <div class="container">
            <h3>Event Log</h3>
            <div id="log" class="log"></div>
        </div>
    </div>

    <script>
        // Load the ShadowUA streaming client
        const script = document.createElement('script');
        script.src = '/api/stream/client';
        script.onload = initializeDemo;
        document.head.appendChild(script);

        let stream = null;
        let stats = {
            uaCount: 0,
            startTime: null,
            dataTransferred: 0
        };

        function initializeDemo() {
            const connectBtn = document.getElementById('connectBtn');
            const disconnectBtn = document.getElementById('disconnectBtn');
            const clearLogBtn = document.getElementById('clearLogBtn');
            const testBulkBtn = document.getElementById('testBulkBtn');

            connectBtn.addEventListener('click', connect);
            disconnectBtn.addEventListener('click', disconnect);
            clearLogBtn.addEventListener('click', clearLog);
            testBulkBtn.addEventListener('click', testBulkGeneration);

            log('Demo initialized. Ready to connect.');
        }

        function connect() {
            const browser = document.getElementById('browser').value;
            const platform = document.getElementById('platform').value;
            const deviceType = document.getElementById('deviceType').value;
            const apiKey = document.getElementById('apiKey').value;

            const filters = {};
            if (browser) filters.browser = browser;
            if (platform) filters.platform = platform;
            if (deviceType) filters.deviceType = deviceType;

            const options = {
                filters: filters,
                reconnect: true,
                reconnectDelay: 2000,
                maxReconnectAttempts: 5
            };

            // Add authentication headers if provided
            if (apiKey) {
                options.headers = {
                    'X-API-Key': apiKey
                };
            }

            stream = new ShadowUAStream('/api/stream', options);

            stream.on('connect', () => {
                updateStatus('connected', 'Connected to stream');
                document.getElementById('connectBtn').disabled = true;
                document.getElementById('disconnectBtn').disabled = false;
                stats.startTime = Date.now();
                log('✅ Connected to ShadowUA stream');
            });

            stream.on('disconnect', () => {
                updateStatus('disconnected', 'Disconnected');
                document.getElementById('connectBtn').disabled = false;
                document.getElementById('disconnectBtn').disabled = true;
                log('❌ Disconnected from stream');
            });

            stream.on('ua', (data) => {
                stats.uaCount++;
                stats.dataTransferred += JSON.stringify(data).length;
                
                document.getElementById('currentUA').textContent = data.userAgent;
                updateStatistics();
                log(\`🔄 New UA: \${data.userAgent.substring(0, 80)}...\`);
            });

            stream.on('heartbeat', (data) => {
                document.getElementById('activeClients').textContent = data.activeClients;
                log(\`💓 Heartbeat - Active clients: \${data.activeClients}\`);
            });

            stream.on('error', (error) => {
                log(\`❌ Error: \${error.message || 'Unknown error'}\`);
            });

            stream.on('config', (data) => {
                log(\`⚙️ Config: \${JSON.stringify(data)}\`);
            });

            updateStatus('connecting', 'Connecting...');
            stream.connect();
        }

        function disconnect() {
            if (stream) {
                stream.disconnect();
                stream = null;
            }
        }

        function updateStatus(type, message) {
            const statusEl = document.getElementById('status');
            statusEl.className = \`status \${type}\`;
            statusEl.textContent = message;
        }

        function updateStatistics() {
            document.getElementById('uaCount').textContent = stats.uaCount;
            
            if (stats.startTime) {
                const uptime = Math.floor((Date.now() - stats.startTime) / 1000);
                document.getElementById('uptime').textContent = \`\${uptime}s\`;
            }
            
            const dataKB = Math.round(stats.dataTransferred / 1024);
            document.getElementById('dataTransfer').textContent = \`\${dataKB} KB\`;
        }

        function log(message) {
            const logEl = document.getElementById('log');
            const timestamp = new Date().toLocaleTimeString();
            logEl.innerHTML += \`[\${timestamp}] \${message}\\n\`;
            logEl.scrollTop = logEl.scrollHeight;
        }

        function clearLog() {
            document.getElementById('log').innerHTML = '';
        }

        async function testBulkGeneration() {
            try {
                log('🚀 Testing bulk generation...');
                
                const response = await fetch('/api/stream/bulk', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        count: 5,
                        filters: {
                            browser: document.getElementById('browser').value || undefined,
                            platform: document.getElementById('platform').value || undefined
                        }
                    })
                });

                const data = await response.json();
                
                if (data.success) {
                    log(\`✅ Bulk generation completed: \${data.batch.results.length} UAs generated\`);
                    log(\`📊 Success: \${data.batch.statistics.successCount}, Failures: \${data.batch.statistics.failureCount}\`);
                } else {
                    log(\`❌ Bulk generation failed: \${data.error}\`);
                }
            } catch (error) {
                log(\`❌ Bulk generation error: \${error.message}\`);
            }
        }

        // Update statistics every second
        setInterval(updateStatistics, 1000);
    </script>
</body>
</html>
  `.trim();

  res.setHeader('Content-Type', 'text/html');
  res.send(demoHTML);
});

// Cleanup on process termination
process.on('SIGTERM', () => {
  streamingManager.cleanup();
});

process.on('SIGINT', () => {
  streamingManager.cleanup();
});

export default router;