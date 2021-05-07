// Detailed overview about how to configure jest ...
// ... [https://jestjs.io/docs/configuration]

// For test reporters which integrate into jest consult ...
// ... [https://github.com/jest-community/awesome-jest#reporters]

module.exports = {
  coverageDirectory: 'reports/test-coverage',
  // specified as cli arguments within
  // package.json's scripts configurations.
  //
  // //coverageReporters: ['text', 'text-summary'],
  // //coverageReporters: ['html', 'json', 'text', 'text-summary'],
  // //coverageProvider: 'babel', // default

  collectCoverageFrom: [
    './src/**/*.{js,jsx}',
    // '!**/node_modules/**',
  ],
  // collectCoverage: true, // default

  // specified within an own config file
  // ... jest-stare.config.json ... which
  // will be passed as argument for just
  // one specific documentation run task.
  //
  // reporters: [
  //   'default',
  //   [
  //     'jest-stare',
  //     {
  //       report: false,
  //       resultDir: 'reports/test-result',
  //       reportTitle: ':: jest-stare! :: es-function-modifiers ::',
  //       additionalResultsProcessors: ['jest-junit'],
  //       coverageLink: 'reports/test-coverage/index.html',
  //       // "jestStareConfigJson": "jest-stare.config.json",
  //       // "jestGlobalConfigJson": "globalStuff.json"
  //     },
  //   ],
  // ],
  // // testResultsProcessor: "./node_modules/jest-stare"

  // to not use/specify the next block solves the
  // problem of the non running/collecting coverage.
  //
  // // The root directory that Jest should scan for tests and modules within
  // rootDir: './test',
  // setupFiles: ['<rootDir>/_setup.js'],
};
