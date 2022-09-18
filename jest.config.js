// @ts-check

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', 'src'],
  setupFilesAfterEnv: ['<rootDir>/src/test-tool/jest.setup.ts'],
  transform: {
    '\\.sh$': '<rootDir>/src/test-tool/jest-raw-loader.js',
    '\\.yml$': '<rootDir>/src/test-tool/jest-raw-loader.js'
  }
};
