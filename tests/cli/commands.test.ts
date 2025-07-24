import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

const CLI_PATH = join(process.cwd(), 'dist/cli/index.js');

// Helper function to run CLI commands
function runCLI(args: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`node ${CLI_PATH} ${args}`, { 
      encoding: 'utf8', 
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (error: any) {
    return { 
      stdout: error.stdout || '', 
      stderr: error.stderr || '', 
      exitCode: error.status || 1 
    };
  }
}

describe('CLI Commands', () => {
  // Clean up test files
  const testFiles = ['test-output.txt', 'test-export.js', 'test-custom.txt', 'custom-uas.txt'];
  
  afterEach(() => {
    testFiles.forEach(file => {
      if (existsSync(file)) {
        unlinkSync(file);
      }
    });
  });

  describe('Help and Version', () => {
    it('should show help when no arguments provided', () => {
      const result = runCLI('');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('ShadowUA');
      expect(result.stdout).toContain('generate');
      expect(result.stdout).toContain('export');
      expect(result.stdout).toContain('custom');
    });

    it('should show version information', () => {
      const result = runCLI('--version');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should show help for generate command', () => {
      const result = runCLI('generate --help');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Generate User-Agent strings');
      expect(result.stdout).toContain('--browser');
      expect(result.stdout).toContain('--platform');
      expect(result.stdout).toContain('--count');
    });
  });

  describe('Generate Command', () => {
    it('should generate a single random UA', () => {
      const result = runCLI('generate --random');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/Mozilla\/5\.0/);
      expect(result.stdout.split('\n').filter(line => line.trim()).length).toBe(1);
    });

    it('should generate multiple UAs', () => {
      const result = runCLI('generate --count 3');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(3);
      lines.forEach(line => {
        expect(line).toMatch(/Mozilla\/5\.0/);
      });
    });

    it('should filter by browser', () => {
      const result = runCLI('generate --browser Chrome --count 2');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(2);
      lines.forEach(line => {
        expect(line).toMatch(/Chrome/);
      });
    });

    it('should filter by platform', () => {
      const result = runCLI('generate --platform Windows --count 2');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(2);
      lines.forEach(line => {
        expect(line).toMatch(/Windows/);
      });
    });

    it('should use short aliases', () => {
      const result = runCLI('g -c 2 -b Chrome -p Windows');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(2);
      lines.forEach(line => {
        expect(line).toMatch(/Chrome/);
        expect(line).toMatch(/Windows/);
      });
    });

    it('should use alternative aliases', () => {
      const result = runCLI('gen -n 2 --os Windows');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(2);
      lines.forEach(line => {
        expect(line).toMatch(/Windows/);
      });
    });

    it('should save to file', () => {
      const result = runCLI('generate --count 2 --output test-output.txt');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('saved to test-output.txt');
      expect(existsSync('test-output.txt')).toBe(true);
    });

    it('should use save alias', () => {
      const result = runCLI('generate -c 2 -s test-output.txt');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('saved to test-output.txt');
      expect(existsSync('test-output.txt')).toBe(true);
    });

    it('should export in JSON format', () => {
      const result = runCLI('generate --count 2 --format json');
      
      expect(result.exitCode).toBe(0);
      expect(() => JSON.parse(result.stdout)).not.toThrow();
      
      const parsed = JSON.parse(result.stdout);
      expect(parsed).toHaveProperty('count', 2);
      expect(parsed).toHaveProperty('userAgents');
      expect(Array.isArray(parsed.userAgents)).toBe(true);
      expect(parsed.userAgents.length).toBe(2);
    });

    it('should handle invalid browser', () => {
      const result = runCLI('generate --browser InvalidBrowser');
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid browser');
    });

    it('should handle invalid platform', () => {
      const result = runCLI('generate --platform InvalidPlatform');
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid platform');
    });

    it('should handle invalid count', () => {
      const result = runCLI('generate --count invalid');
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Count must be a positive integer');
    });
  });

  describe('Export Command', () => {
    it('should export UAs for k6', () => {
      const result = runCLI('export --format k6 --count 3 --output test-export.js');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Exported 3 User-Agent(s) in k6 format');
      expect(existsSync('test-export.js')).toBe(true);
    });

    it('should use export aliases', () => {
      const result = runCLI('e -f k6 -n 3 -s test-export.js');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Exported 3 User-Agent(s) in k6 format');
      expect(existsSync('test-export.js')).toBe(true);
    });

    it('should export for Burp Suite', () => {
      const result = runCLI('export --format burp --count 5');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Exported 5 User-Agent(s) in burp format');
    });

    it('should filter during export', () => {
      const result = runCLI('export --format k6 --browser Firefox --count 2 --output test-export.js');
      
      expect(result.exitCode).toBe(0);
      expect(existsSync('test-export.js')).toBe(true);
    });
  });

  describe('Custom Command', () => {
    beforeEach(() => {
      // Create a test custom UA file
      const customUAs = [
        'Mozilla/5.0 (Test) CustomBrowser/1.0',
        'Mozilla/5.0 (Another Test) AnotherBrowser/2.0',
        'Custom User Agent String'
      ];
      writeFileSync('custom-uas.txt', customUAs.join('\n'));
    });

    it('should load and use custom UA pool', () => {
      const result = runCLI('custom --load custom-uas.txt --count 2');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(2);
    });

    it('should use custom command aliases', () => {
      const result = runCLI('c -i custom-uas.txt -n 2');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(2);
    });

    it('should save custom UA output', () => {
      const result = runCLI('custom --load custom-uas.txt --count 2 --save test-custom.txt');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('saved to test-custom.txt');
      expect(existsSync('test-custom.txt')).toBe(true);
    });

    it('should handle missing custom file', () => {
      const result = runCLI('custom --load non-existent.txt');
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Error:');
    });

    it('should require load parameter', () => {
      const result = runCLI('custom --count 2');
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Please specify a file to load');
    });
  });

  describe('Combined Filters', () => {
    it('should handle multiple filters together', () => {
      const result = runCLI('generate --browser Chrome --platform Android --device mobile --count 3');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(3);
      lines.forEach(line => {
        expect(line).toMatch(/Chrome/);
        expect(line).toMatch(/Android/);
        expect(line).toMatch(/Mobile/);
      });
    });

    it('should handle weighted generation', () => {
      const result = runCLI('generate --weighted --count 5');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(5);
      lines.forEach(line => {
        expect(line).toMatch(/Mozilla\/5\.0/);
      });
    });
  });

  describe('Output Formats', () => {
    it('should generate CSV format', () => {
      const result = runCLI('generate --count 2 --format csv');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('id,user_agent');
      expect(result.stdout).toMatch(/1,"Mozilla/);
      expect(result.stdout).toMatch(/2,"Mozilla/);
    });

    it('should generate cURL format', () => {
      const result = runCLI('generate --count 2 --format curl');
      
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('#!/bin/bash');
      expect(result.stdout).toContain('curl -H "User-Agent:');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid command', () => {
      const result = runCLI('invalid-command');
      
      expect(result.exitCode).toBe(1);
    });

    it('should handle invalid format', () => {
      const result = runCLI('generate --format invalid');
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid format');
    });

    it('should handle negative count', () => {
      const result = runCLI('generate --count -1');
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Count must be a positive integer');
    });

    it('should handle zero count', () => {
      const result = runCLI('generate --count 0');
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Count must be a positive integer');
    });
  });

  describe('Edge Cases', () => {
    it('should handle large count requests', () => {
      const result = runCLI('generate --count 100');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(100);
    });

    it('should handle device type filtering', () => {
      const result = runCLI('generate --device mobile --count 3');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(3);
      lines.forEach(line => {
        expect(line).toMatch(/Mobile|iPhone|Android/);
      });
    });

    it('should use type alias for device', () => {
      const result = runCLI('generate --type tablet --count 2');
      
      expect(result.exitCode).toBe(0);
      const lines = result.stdout.split('\n').filter(line => line.trim());
      expect(lines.length).toBe(2);
      lines.forEach(line => {
        // Check for tablet indicators: iPad, "Tablet" keyword, or common Android tablet models
        expect(line).toMatch(/iPad|Tablet|SM-[TP]\d+|Tab S\d+|MatePad|Pixel Tablet/);
      });
    });
  });
});