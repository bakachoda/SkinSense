module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@skinsense/types$": "<rootDir>/../../../packages/types/dist/index.js",
    "^@prisma/client$": "<rootDir>/../node_modules/.prisma/client",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
