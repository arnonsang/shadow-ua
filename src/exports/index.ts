import { UAString, ExportFormat, ExportOptions } from '../types';

export function exportUAs(userAgents: UAString[], options: ExportOptions): string {
  switch (options.format) {
    case ExportFormat.TXT:
      return exportToTxt(userAgents);
    case ExportFormat.JSON:
      return exportToJson(userAgents);
    case ExportFormat.CSV:
      return exportToCsv(userAgents);
    case ExportFormat.CURL:
      return exportToCurl(userAgents);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

function exportToTxt(userAgents: UAString[]): string {
  return userAgents.join('\n');
}

function exportToJson(userAgents: UAString[]): string {
  const exportData = {
    timestamp: new Date().toISOString(),
    count: userAgents.length,
    userAgents: userAgents,
  };
  return JSON.stringify(exportData, null, 2);
}

function exportToCsv(userAgents: UAString[]): string {
  const header = 'id,user_agent\n';
  const rows = userAgents.map((ua, index) => `${index + 1},"${ua.replace(/"/g, '""')}"`);
  return header + rows.join('\n');
}

function exportToCurl(userAgents: UAString[]): string {
  const curlCommands = userAgents.map((ua, index) => {
    return `# User-Agent ${index + 1}\ncurl -H "User-Agent: ${ua}" "$URL"`;
  });
  
  const script = `#!/bin/bash
# Generated User-Agent cURL Script
# Set your target URL by replacing $URL or setting the URL environment variable
# Usage: URL="https://example.com" ./ua-curl-script.sh

if [ -z "$URL" ]; then
  echo "Error: Please set the URL environment variable or replace $URL in the script"
  echo "Usage: URL=\"https://example.com\" ./ua-curl-script.sh"
  exit 1
fi

echo "Testing ${userAgents.length} User-Agent strings against: $URL"
echo "----------------------------------------"

${curlCommands.join('\n\n')}

echo "----------------------------------------"
echo "Completed testing ${userAgents.length} User-Agent strings"`;

  return script;
}

export function exportToBurpSuite(userAgents: UAString[]): string {
  // Export format for Burp Suite Intruder
  return userAgents.join('\n');
}

export function exportToK6(userAgents: UAString[]): string {
  const k6Script = `import http from 'k6/http';
import { check } from 'k6';

const userAgents = [
${userAgents.map(ua => `  "${ua.replace(/"/g, '\\"')}"`).join(',\n')}
];

export let options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
  
  const params = {
    headers: {
      'User-Agent': randomUA,
    },
  };
  
  const response = http.get('https://httpbin.org/user-agent', params);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
  });
}`;

  return k6Script;
}

export function exportToJMeter(userAgents: UAString[]): string {
  // CSV format for JMeter CSV Data Set Config
  const header = 'user_agent\n';
  const rows = userAgents.map(ua => `"${ua.replace(/"/g, '""')}"`);
  return header + rows.join('\n');
}

export function exportToLocust(userAgents: UAString[]): string {
  const locustScript = `# Locust load testing script with User-Agent rotation
from locust import HttpUser, task, between
import random

class UserAgentUser(HttpUser):
    wait_time = between(1, 3)
    
    user_agents = [
${userAgents.map(ua => `        "${ua.replace(/"/g, '\\"')}"`).join(',\n')}
    ]
    
    def on_start(self):
        """Called when a user starts"""
        pass
    
    @task
    def test_with_random_ua(self):
        """Test endpoint with random User-Agent"""
        headers = {
            'User-Agent': random.choice(self.user_agents)
        }
        
        # Replace '/endpoint' with your actual endpoint
        self.client.get('/endpoint', headers=headers)`;

  return locustScript;
}