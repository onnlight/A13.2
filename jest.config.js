/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/tests/**/*.spec.ts'
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      }
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testTimeout: 10000,
  modulePathIgnorePatterns: ['node_modules'],
  testPathIgnorePatterns: ['node_modules', 'dist'],
  
  // Mock THREE.js at module level
  moduleNameMapping: {
    '^three$': '<rootDir>/tests/three-mock.js'
  },
  
  // Memory settings
  maxWorkers: '50%',
  
  // Mock modules
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};