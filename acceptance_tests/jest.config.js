module.exports = {
  //preset: "puppeteer",
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
  testMatch: [
    //'**/tests/otus-studio/custom-variables-test.js'
    //'**/tests/otus-studio/group-questions-test.js'
    //'**/tests/otus-studio/move-questions-test.js'
    //'**/tests/otus-studio/*-test.js'
    // otus
    '**/tests/otus/otus-test.js'
    //'**/tests/otus/activity-report-test.js',
    //'**/tests/otus/activity-redesign-test.js'
    //'**/tests/otus/activity-adder-test.js'
  ],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.(js|jsx)?$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  //snapshotSerializers: ['jest-serializer-vue'],
  setupFiles: ['./jest.setup.js'],
  setupFilesAfterEnv: ["jest-extended"]
};