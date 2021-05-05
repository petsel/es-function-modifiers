// Detailed overview about how to configure jest ...
// ... [https://jestjs.io/docs/configuration]

module.exports = {
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'json', 'text', 'text-summary'],
  // coverageProvider: 'babel', // default

  collectCoverageFrom: [
    './src/**/*.{js,jsx}',
    // '!**/node_modules/**',
  ],
  // collectCoverage: true, // default

  // to not use/specify the next block solves the
  // proble of the non running/collecting coverage.
  //
  // // The root directory that Jest should scan for tests and modules within
  // rootDir: './test',
  // setupFiles: ['<rootDir>/_setup.js'],
};
