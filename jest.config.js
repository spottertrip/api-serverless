module.exports = {
    "roots": [
        "<rootDir>/src"
    ],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.ts$",
    "moduleFileExtensions": [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ],
    "moduleNameMapper": {
        "@handlers/(.*)$": "<rootDir>/src/handlers/$1",
        "@datastore/(.*)$": "<rootDir>/src/datastore/$1",
        "@models/(.*)$": "<rootDir>/src/models/$1",
        "@errors/(.*)$": "<rootDir>/src/errors/$1",
        "@helpers/(.*)$": "<rootDir>/src/helpers/$1",
        "@validators/(.*)$": "<rootDir>/src/validators/$1",
        "@constants/(.*)$": "<rootDir>/src/constants/$1"
    }
}
