module.exports = {
  //preset: "puppeteer",
  moduleFileExtensions: ['js', 'jsx', 'json', 'vue'],
  testMatch: [
    '**/tests/telaDeLogin.js'
    
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