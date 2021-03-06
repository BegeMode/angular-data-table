const istanbul = require('browserify-istanbul');
const isparta = require('isparta');

// Configure more at: https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
const customLaunchers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 7',
    version: '35',
  },
  sl_ie_11: {
    base: 'SauceLabs',
    browserName: 'Internet Explorer',
    platform: 'Windows 7',
    version: '11.0',
  },
};

const karmaBaseConfig = {
  frameworks: ['browserify', 'jasmine'],

  basePath: './',

  files: [
    //{
    //  pattern: '../src/**/*!(.spec).js',
    //  included: false,
    //},
    'dataTable.mock.js',
    {
      pattern: '../node_modules/sinon/pkg/sinon.js',
      watched: false,
    },
    {
      pattern: '../node_modules/bardjs/dist/bard.js',
      watched: false,
    },
    {
      pattern: '../node_modules/angular-mocks/angular-mocks.js',
      watched: false,
    },
    'karma.helper.js',
    '../src/**/*.spec.js',
  ],

  preprocessors: {
    'karma.helper.js': ['browserify'],
    '../src/**/*.spec.js': ['browserify'],
    'dataTable.mock.js': ['browserify'],
  },

  browserify: {
    debug: true,
    prodSourcemap: true,
    extensions: ['.js'],
    transform: [
      istanbul({
        instrumenter: isparta,
        instrumenterConfig: { embedSource: true },
        ignore: [
          '**/*.spec.js',
        ],
      }),
      'babelify', // Note: uses .babelrc
      'brfs',
    ],
  },

  browsers: ['PhantomJS'],
  failOnEmptyTestSuite: false,
  phantomjsLauncher: {
    exitOnResourceError: true,
  },
  reporters: ['progress', 'coverage'],
  singleRun: true,

  coverageReporter: {
    dir: './coverage',
    reporters: [
      {
        type: 'html',
      },
      {
        type: 'text-summary',
      },
      {
        type: 'lcovonly',
      },
      {
        type: 'json',
      },
    ],
  },

  captureTimeout: 60000,
  browserDisconnectTimeout: 20000,
  browserNoActivityTimeout: 100000,
};

export default (config) => {
  config.set(karmaBaseConfig);

  if (process.env.TRAVIS) {
    if (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY) {
      console.log('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.'); // eslint-disable-line
      process.exit(1);
    }

    Object.assign(config, {
      sauceLabs: {
        testName: 'angular-data-table unit tests',
        recordScreenshots: false,
        connectOptions: {
          port: 5757,
          logfile: 'sauce_connect.log',
        },
        public: 'public',
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
        startConnect: false,
      },
      customLaunchers,
      browsers: Object.keys(customLaunchers),
      reporters: ['progress', 'dots', 'coverage', 'saucelabs'],
      singleRun: true,
      coverageReporter: {
        reporters: [
          {
            type: 'lcovonly',
          },
          {
            type: 'json',
          },
        ],
      },
    });
  }
};
