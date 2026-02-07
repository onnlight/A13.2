#!/usr/bin/env node

/**
 * Test Runner Script for 3D Endless Runner
 * Provides comprehensive test execution with reporting
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

class TestRunner {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      coverage: 0,
      duration: 0
    };
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  header(title) {
    this.log(`\n${'='.repeat(60)}`, 'cyan');
    this.log(`${title}`, 'bright');
    this.log(`${'='.repeat(60)}`, 'cyan');
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  error(message) {
    this.log(`❌ ${message}`, 'red');
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  runCommand(command, description) {
    this.log(`Running: ${description}...`, 'yellow');
    
    try {
      const startTime = Date.now();
      const output = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        cwd: process.cwd()
      });
      const duration = Date.now() - startTime;
      
      this.success(`${description} (${duration}ms)`);
      return { success: true, output, duration };
    } catch (error) {
      this.error(`${description} failed`);
      this.log(error.stdout || error.message, 'red');
      return { success: false, error, duration: 0 };
    }
  }

  checkDependencies() {
    this.header('Checking Dependencies');
    
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = [...Object.keys(packageJson.dependencies || {}), 
                        ...Object.keys(packageJson.devDependencies || {})];
    
    const requiredDeps = ['jest', 'three', 'typescript'];
    const missingDeps = requiredDeps.filter(dep => !dependencies.includes(dep));
    
    if (missingDeps.length > 0) {
      this.error(`Missing dependencies: ${missingDeps.join(', ')}`);
      this.log('Run: npm install', 'yellow');
      return false;
    }
    
    this.success('All dependencies satisfied');
    return true;
  }

  runUnitTests() {
    this.header('Running Unit Tests');
    
    const unitTestFiles = [
      'tests/player.test.ts',
      'tests/obstacles.test.ts',
      'tests/powerups.test.ts',
      'tests/ui-customization.test.ts',
      'tests/game-state.test.ts',
      'tests/storage-leaderboard.test.ts'
    ];
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    for (const testFile of unitTestFiles) {
      if (fs.existsSync(testFile)) {
        const result = this.runCommand(
          `npx jest ${testFile} --verbose`,
          `Unit Tests: ${path.basename(testFile)}`
        );
        
        if (result.success) {
          totalPassed++;
        } else {
          totalFailed++;
        }
      } else {
        this.warning(`Test file not found: ${testFile}`);
      }
    }
    
    this.testResults.total += totalPassed + totalFailed;
    this.testResults.passed += totalPassed;
    this.testResults.failed += totalFailed;
    
    return totalFailed === 0;
  }

  runIntegrationTests() {
    this.header('Running Integration Tests');
    
    const integrationTestFiles = [
      'tests/e2e-gameplay.test.ts',
      'tests/responsive-design.test.ts'
    ];
    
    let totalPassed = 0;
    let totalFailed = 0;
    
    for (const testFile of integrationTestFiles) {
      if (fs.existsSync(testFile)) {
        const result = this.runCommand(
          `npx jest ${testFile} --verbose`,
          `Integration Tests: ${path.basename(testFile)}`
        );
        
        if (result.success) {
          totalPassed++;
        } else {
          totalFailed++;
        }
      } else {
        this.warning(`Test file not found: ${testFile}`);
      }
    }
    
    this.testResults.total += totalPassed + totalFailed;
    this.testResults.passed += totalPassed;
    this.testResults.failed += totalFailed;
    
    return totalFailed === 0;
  }

  runCoverageAnalysis() {
    this.header('Running Coverage Analysis');
    
    const result = this.runCommand(
      'npx jest --coverage --coverageReporters=text --coverageReporters=html',
      'Coverage Analysis'
    );
    
    if (result.success) {
      // Extract coverage percentage from output
      const coverageMatch = result.output.match(/All files\s+\|\s+(\d+\.\d+)/);
      if (coverageMatch) {
        this.testResults.coverage = parseFloat(coverageMatch[1]);
        this.log(`Coverage: ${this.testResults.coverage}%`, 
                 this.testResults.coverage >= 80 ? 'green' : 'yellow');
      }
      
      this.success('Coverage report generated in coverage/lcov-report/index.html');
    }
    
    return result.success;
  }

  runPerformanceTests() {
    this.header('Running Performance Tests');
    
    this.info('Running tests with performance monitoring...');
    
    const result = this.runCommand(
      'npx jest tests/e2e-gameplay.test.ts --testTimeout=30000',
      'Performance Tests'
    );
    
    if (result.success) {
      this.success('Performance tests completed');
    }
    
    return result.success;
  }

  generateReport() {
    this.header('Test Results Summary');
    
    this.log(`Total Tests: ${this.testResults.total}`, 'bright');
    this.log(`Passed: ${this.testResults.passed}`, 'green');
    this.log(`Failed: ${this.testResults.failed}`, this.testResults.failed > 0 ? 'red' : 'green');
    this.log(`Coverage: ${this.testResults.coverage}%`, 
             this.testResults.coverage >= 80 ? 'green' : 'yellow');
    
    const successRate = this.testResults.total > 0 
      ? ((this.testResults.passed / this.testResults.total) * 100).toFixed(2)
      : 0;
    
    this.log(`Success Rate: ${successRate}%`, 
             parseFloat(successRate) >= 95 ? 'green' : 'yellow');
    
    // Overall status
    const allPassed = this.testResults.failed === 0 && this.testResults.coverage >= 80;
    
    if (allPassed) {
      this.header('🎉 All Tests Passed!');
      this.success('Quality gates met - Ready for deployment');
    } else {
      this.header('❌ Tests Failed');
      this.warning('Fix failing tests before deployment');
    }
    
    return allPassed;
  }

  runQuickTests() {
    this.header('Quick Test Run');
    this.info('Running essential tests only...');
    
    const essentialTests = [
      'tests/player.test.ts',
      'tests/obstacles.test.ts',
      'tests/game-state.test.ts'
    ];
    
    let allPassed = true;
    
    for (const testFile of essentialTests) {
      if (fs.existsSync(testFile)) {
        const result = this.runCommand(
          `npx jest ${testFile} --silent`,
          `Quick Test: ${path.basename(testFile)}`
        );
        
        if (!result.success) {
          allPassed = false;
        }
      }
    }
    
    return allPassed;
  }

  showHelp() {
    this.header('Test Runner Help');
    
    this.log('Usage:', 'bright');
    this.log('  node test-runner.js [command]', 'cyan');
    this.log('');
    this.log('Commands:', 'bright');
    this.log('  all        - Run all tests (default)', 'cyan');
    this.log('  unit       - Run unit tests only', 'cyan');
    this.log('  integration - Run integration tests only', 'cyan');
    this.log('  coverage   - Run coverage analysis', 'cyan');
    this.log('  performance - Run performance tests', 'cyan');
    this.log('  quick      - Run quick essential tests', 'cyan');
    this.log('  help       - Show this help message', 'cyan');
    this.log('');
    this.log('Examples:', 'bright');
    this.log('  node test-runner.js', 'cyan');
    this.log('  node test-runner.js coverage', 'cyan');
    this.log('  node test-runner.js quick', 'cyan');
  }
}

// Main execution
function main() {
  const command = process.argv[2] || 'all';
  const runner = new TestRunner();
  
  runner.log('🚀 3D Endless Runner Test Runner', 'bright');
  runner.log(`Command: ${command}`, 'blue');
  
  // Check dependencies first
  if (!runner.checkDependencies()) {
    process.exit(1);
  }
  
  let success = true;
  
  switch (command) {
    case 'all':
      success &= runner.runUnitTests();
      success &= runner.runIntegrationTests();
      success &= runner.runCoverageAnalysis();
      success &= runner.runPerformanceTests();
      break;
      
    case 'unit':
      success &= runner.runUnitTests();
      break;
      
    case 'integration':
      success &= runner.runIntegrationTests();
      break;
      
    case 'coverage':
      success &= runner.runCoverageAnalysis();
      break;
      
    case 'performance':
      success &= runner.runPerformanceTests();
      break;
      
    case 'quick':
      success = runner.runQuickTests();
      break;
      
    case 'help':
      runner.showHelp();
      return;
      
    default:
      runner.error(`Unknown command: ${command}`);
      runner.showHelp();
      process.exit(1);
  }
  
  // Generate final report
  runner.generateReport();
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}