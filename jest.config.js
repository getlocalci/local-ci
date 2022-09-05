// @ts-check

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  setupFilesAfterEnv: ['<rootDir>/src/test-tools/jest.setup.ts'],
  transform: {
    '\\.sh$': '<rootDir>/src/test-tools/jest-raw-loader.js',
    '\\.yml$': '<rootDir>/src/test-tools/jest-raw-loader.js'
  }
};
