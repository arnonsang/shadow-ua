#!/usr/bin/env node

import { Command } from 'commander';
import { writeFileSync } from 'fs';
import { join } from 'path';
import {
  generateRandomUA,
  loadCustomUAPool,
  generateFromCustomPool,
} from '../core/generator';
import { generateMultipleModularUAStrings } from '../core/modular-generator';
import { exportUAs, exportToBurpSuite, exportToK6, exportToJMeter, exportToLocust } from '../exports';
import { Platform, Browser, DeviceType, ExportFormat, UAFilter } from '../types';
import { startInteractiveMode } from './interactive';

const program = new Command();

program
  .name('shua')
  .description('ShadowUA - Generate realistic User-Agent strings for defensive security testing')
  .version('1.0.0');

program
  .command('generate')
  .alias('gen')
  .alias('g')
  .description('Generate User-Agent strings')
  .option('-r, --random', 'Generate a random User-Agent')
  .option('-c, --count <number>', 'Number of User-Agents to generate', '1')
  .option('-n, --number <number>', 'Alias for --count')
  .option('-b, --browser <browser>', 'Filter by browser (Chrome, Firefox, Safari, Edge)')
  .option('-p, --platform <platform>', 'Filter by platform (Windows, macOS, Linux, Android, iOS)')
  .option('--os, --operating-system <os>', 'Alias for --platform')
  .option('-d, --device <device>', 'Filter by device type (desktop, mobile, tablet)')
  .option('-t, --type <type>', 'Alias for --device type')
  .option('-w, --weighted', 'Use weighted random generation based on market share')
  .option('-o, --output <file>', 'Output file path')
  .option('-s, --save <file>', 'Alias for --output')
  .option('-f, --format <format>', 'Output format (txt, json, csv, curl)', 'txt')
  .action((options) => {
    try {
      // Handle aliases for count - check for any explicit flag first, then default
      const countValue = options.number !== undefined ? options.number : 
                         options.count !== undefined ? options.count : '1';
      const count = parseInt(countValue);
      
      if (isNaN(count) || count < 1) {
        console.error('Error: Count must be a positive integer');
        process.exit(1);
      }

      let userAgents: string[] = [];
      
      if (options.random && count === 1) {
        userAgents = [generateRandomUA()];
      } else {
        const filter: UAFilter = {};
        
        if (options.browser) {
          if (!Object.values(Browser).includes(options.browser as Browser)) {
            console.error(`Error: Invalid browser. Available: ${Object.values(Browser).join(', ')}`);
            process.exit(1);
          }
          filter.browser = options.browser as Browser;
        }
        
        // Handle aliases for platform (check for camelCase property names from commander)
        const platform = options.platform || options.operatingSystem;
        if (platform) {
          if (!Object.values(Platform).includes(platform as Platform)) {
            console.error(`Error: Invalid platform. Available: ${Object.values(Platform).join(', ')}`);
            process.exit(1);
          }
          filter.platform = platform as Platform;
        }
        
        // Handle aliases for device
        const device = options.device || options.type;
        if (device) {
          if (!Object.values(DeviceType).includes(device as DeviceType)) {
            console.error(`Error: Invalid device type. Available: ${Object.values(DeviceType).join(', ')}`);
            process.exit(1);
          }
          filter.deviceType = device as DeviceType;
        }
        
        // Use the new modular generator with weighted option
        userAgents = generateMultipleModularUAStrings(count, filter, options.weighted);
      }
      
      const format = options.format as ExportFormat;
      if (!Object.values(ExportFormat).includes(format)) {
        console.error(`Error: Invalid format. Available: ${Object.values(ExportFormat).join(', ')}`);
        process.exit(1);
      }
      
      const output = exportUAs(userAgents, { format, count });
      
      // Handle aliases for output
      const outputFile = options.output || options.save;
      if (outputFile) {
        writeFileSync(outputFile, output);
        console.log(`Generated ${count} User-Agent(s) and saved to ${outputFile}`);
      } else {
        // For simple text output, just show the UAs directly
        if (format === ExportFormat.TXT) {
          console.log(userAgents.join('\n'));
        } else {
          console.log(output);
        }
      }
      
    } catch (error) {
      console.error(`Error: ${error}`);
      process.exit(1);
    }
  });

program
  .command('export')
  .alias('exp')
  .alias('e')
  .description('Export User-Agents in various tool formats')
  .option('-c, --count <number>', 'Number of User-Agents to generate', '10')
  .option('-n, --number <number>', 'Alias for --count')
  .option('-b, --browser <browser>', 'Filter by browser')
  .option('-p, --platform <platform>', 'Filter by platform')
  .option('--os, --operating-system <os>', 'Alias for --platform')
  .option('-d, --device <device>', 'Filter by device type')
  .option('-t, --type <type>', 'Alias for --device type')
  .option('-f, --format <format>', 'Export format (burp, k6, jmeter, locust)', 'txt')
  .option('-o, --output <file>', 'Output file path')
  .option('-s, --save <file>', 'Alias for --output')
  .action((options) => {
    try {
      // Handle aliases for count - check for any explicit flag first, then default
      const countValue = options.number !== undefined ? options.number : 
                         options.count !== undefined ? options.count : '10';
      const count = parseInt(countValue);
      const filter: UAFilter = {};
      
      if (options.browser) filter.browser = options.browser as Browser;
      
      // Handle aliases for platform  
      const platform = options.platform || options.operatingSystem;
      if (platform) filter.platform = platform as Platform;
      
      // Handle aliases for device
      const device = options.device || options.type;
      if (device) filter.deviceType = device as DeviceType;
      
      const userAgents = generateMultipleModularUAStrings(count, filter, true);
      let output: string;
      let fileExtension: string;
      
      switch (options.format) {
        case 'burp':
          output = exportToBurpSuite(userAgents);
          fileExtension = 'txt';
          break;
        case 'k6':
          output = exportToK6(userAgents);
          fileExtension = 'js';
          break;
        case 'jmeter':
          output = exportToJMeter(userAgents);
          fileExtension = 'csv';
          break;
        case 'locust':
          output = exportToLocust(userAgents);
          fileExtension = 'py';
          break;
        default:
          output = exportUAs(userAgents, { format: ExportFormat.TXT, count });
          fileExtension = 'txt';
      }
      
      // Handle aliases for output
      const outputFile = options.output || options.save;
      if (outputFile) {
        writeFileSync(outputFile, output);
        console.log(`Exported ${count} User-Agent(s) in ${options.format} format to ${outputFile}`);
      } else {
        const filename = `ua-export-${options.format}.${fileExtension}`;
        writeFileSync(filename, output);
        console.log(`Exported ${count} User-Agent(s) in ${options.format} format to ${filename}`);
      }
      
    } catch (error) {
      console.error(`Error: ${error}`);
      process.exit(1);
    }
  });

program
  .command('custom')
  .alias('cust')
  .alias('c')
  .description('Use custom User-Agent pool from file')
  .option('-l, --load <file>', 'Load custom UA pool from file')
  .option('-i, --input <file>', 'Alias for --load')
  .option('-c, --count <number>', 'Number of User-Agents to generate', '1')
  .option('-n, --number <number>', 'Alias for --count')
  .option('-o, --output <file>', 'Output file path')
  .option('-s, --save <file>', 'Alias for --output')
  .action((options) => {
    try {
      // Handle aliases for load/input (commander converts kebab-case to camelCase)
      const inputFile = options.load || options.input;
      if (!inputFile) {
        console.error('Error: Please specify a file to load with -l/--load or -i/--input');
        process.exit(1);
      }
      
      loadCustomUAPool(inputFile);
      
      // Handle aliases for count - check for any explicit flag first, then default
      const countValue = options.number !== undefined ? options.number : 
                         options.count !== undefined ? options.count : '1';
      const count = parseInt(countValue);
      const userAgents = generateFromCustomPool(count);
      
      const output = userAgents.join('\n');
      
      // Handle aliases for output
      const outputFile = options.output || options.save;
      if (outputFile) {
        writeFileSync(outputFile, output);
        console.log(`Generated ${count} User-Agent(s) from custom pool and saved to ${outputFile}`);
      } else {
        console.log(output);
      }
      
    } catch (error) {
      console.error(`Error: ${error}`);
      process.exit(1);
    }
  });

// Serve command - Start REST API server
program
  .command('serve')
  .alias('api')
  .alias('server')
  .description('Start the REST API server')
  .option('-p, --port <number>', 'Server port', '3000')
  .option('-h, --host <string>', 'Server host', 'localhost')
  .option('--cors', 'Enable CORS')
  .option('--no-helmet', 'Disable Helmet security middleware')
  .option('--trust-proxy', 'Trust proxy headers')
  .option('--rate-limit <number>', 'Rate limit (requests per 15min window)', '100')
  .action(async (options) => {
    try {
      const { ShadowUAServer } = await import('../api/server');
      
      const config = {
        port: parseInt(options.port),
        host: options.host,
        cors: {
          enabled: options.cors || false,
          origins: [`http://${options.host}:${options.port}`],
        },
        security: {
          helmet: options.helmet !== false,
          trustProxy: options.trustProxy || false,
        },
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: parseInt(options.rateLimit),
          standardHeaders: true,
          legacyHeaders: false,
        },
      };

      const server = new ShadowUAServer(config);
      await server.start();
      
    } catch (error) {
      console.error(`Error: ${error}`);
      process.exit(1);
    }
  });

// Interactive CLI wizard command
program
  .command('interactive')
  .alias('wizard')
  .alias('i')
  .description('Start interactive User-Agent generation wizard')
  .action(async () => {
    try {
      await startInteractiveMode();
    } catch (error) {
      console.error(`Error: ${error}`);
      process.exit(1);
    }
  });

// If no arguments provided, show help and exit with success
if (process.argv.length === 2) {
  program.outputHelp();
  process.exit(0);
}

program.parse();