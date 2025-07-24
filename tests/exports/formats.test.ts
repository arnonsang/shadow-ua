import { describe, it, expect } from 'vitest';
import {
  exportUAs,
  exportToBurpSuite,
  exportToK6,
  exportToJMeter,
  exportToLocust,
} from '../../src/exports';
import { ExportFormat } from '../../src/types';

describe('Export Formats', () => {
  const testUAs = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ];

  describe('exportUAs', () => {
    it('should export to TXT format', () => {
      const result = exportUAs(testUAs, { format: ExportFormat.TXT, count: 3 });
      expect(result).toBe(testUAs.join('\n'));
    });

    it('should export to JSON format', () => {
      const result = exportUAs(testUAs, { format: ExportFormat.JSON, count: 3 });
      const parsed = JSON.parse(result);
      
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('count', 3);
      expect(parsed).toHaveProperty('userAgents');
      expect(parsed.userAgents).toEqual(testUAs);
    });

    it('should export to CSV format', () => {
      const result = exportUAs(testUAs, { format: ExportFormat.CSV, count: 3 });
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('id,user_agent');
      expect(lines[1]).toBe(`1,"${testUAs[0]}"`);
      expect(lines[2]).toBe(`2,"${testUAs[1]}"`);
      expect(lines[3]).toBe(`3,"${testUAs[2]}"`);
    });

    it('should export to CURL format', () => {
      const result = exportUAs(testUAs, { format: ExportFormat.CURL, count: 3 });
      
      expect(result).toContain('#!/bin/bash');
      expect(result).toContain('Generated User-Agent cURL Script');
      expect(result).toContain(`curl -H "User-Agent: ${testUAs[0]}" "$URL"`);
      expect(result).toContain(`curl -H "User-Agent: ${testUAs[1]}" "$URL"`);
      expect(result).toContain(`curl -H "User-Agent: ${testUAs[2]}" "$URL"`);
    });

    it('should throw error for unsupported format', () => {
      expect(() => {
        exportUAs(testUAs, { format: 'invalid' as ExportFormat, count: 3 });
      }).toThrow('Unsupported export format');
    });
  });

  describe('CSV Export Edge Cases', () => {
    it('should handle User-Agents with quotes', () => {
      const uaWithQuotes = ['Mozilla/5.0 "Test" Browser'];
      const result = exportUAs(uaWithQuotes, { format: ExportFormat.CSV, count: 1 });
      
      expect(result).toContain('1,"Mozilla/5.0 ""Test"" Browser"');
    });
  });

  describe('Tool-specific Exports', () => {
    it('should export for Burp Suite', () => {
      const result = exportToBurpSuite(testUAs);
      expect(result).toBe(testUAs.join('\n'));
    });

    it('should export for k6', () => {
      const result = exportToK6(testUAs);
      
      expect(result).toContain('import http from \'k6/http\';');
      expect(result).toContain('import { check } from \'k6\';');
      expect(result).toContain('const userAgents = [');
      expect(result).toContain('Math.floor(Math.random() * userAgents.length)');
      
      // Should escape quotes in user agents
      testUAs.forEach(ua => {
        expect(result).toContain(`"${ua.replace(/"/g, '\\"')}"`);
      });
    });

    it('should export for JMeter', () => {
      const result = exportToJMeter(testUAs);
      const lines = result.split('\n');
      
      expect(lines[0]).toBe('user_agent');
      expect(lines[1]).toBe(`"${testUAs[0]}"`);
      expect(lines[2]).toBe(`"${testUAs[1]}"`);
      expect(lines[3]).toBe(`"${testUAs[2]}"`);
    });

    it('should export for Locust', () => {
      const result = exportToLocust(testUAs);
      
      expect(result).toContain('from locust import HttpUser, task, between');
      expect(result).toContain('import random');
      expect(result).toContain('class UserAgentUser(HttpUser):');
      expect(result).toContain('user_agents = [');
      expect(result).toContain('random.choice(self.user_agents)');
      
      // Should escape quotes in user agents
      testUAs.forEach(ua => {
        expect(result).toContain(`"${ua.replace(/"/g, '\\"')}"`);
      });
    });
  });

  describe('Empty Input Handling', () => {
    it('should handle empty UA array', () => {
      const result = exportUAs([], { format: ExportFormat.TXT, count: 0 });
      expect(result).toBe('');
    });

    it('should handle empty UA array for JSON', () => {
      const result = exportUAs([], { format: ExportFormat.JSON, count: 0 });
      const parsed = JSON.parse(result);
      
      expect(parsed.count).toBe(0);
      expect(parsed.userAgents).toEqual([]);
    });

    it('should handle empty UA array for CSV', () => {
      const result = exportUAs([], { format: ExportFormat.CSV, count: 0 });
      expect(result).toBe('id,user_agent\n');
    });
  });

  describe('Large Dataset Handling', () => {
    it('should handle large number of UAs', () => {
      const largeUASet = Array(1000).fill(testUAs[0]);
      const result = exportUAs(largeUASet, { format: ExportFormat.JSON, count: 1000 });
      const parsed = JSON.parse(result);
      
      expect(parsed.count).toBe(1000);
      expect(parsed.userAgents).toHaveLength(1000);
    });
  });
});