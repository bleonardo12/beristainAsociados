module.exports = {
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'clover'],
    collectCoverageFrom: [
      '**/*.js',
      '!**/node_modules/**',
      '!**/coverage/**',
      '!**/jest.config.js',
      '!**/.eslintrc.js'
    ],
    testTimeout: 10000,
    setupFilesAfterEnv: ['./jest.setup.js'],
  };