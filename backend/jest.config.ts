import type { Config } from 'jest';

const config: Config = {
    // Используем ts-jest
    preset: 'ts-jest',

    // Среда выполнения
    testEnvironment: 'node',

    // Где искать тесты
    roots: ['<rootDir>/src'],

    // Поддержка алиаса @/
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    // Расширения файлов
    moduleFileExtensions: ['ts', 'js', 'json'],

    // Какие файлы считать тестами
    testRegex: '.*\\.spec\\.ts$',

    // Трансформация TypeScript
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },

    // Очистка моков между тестами
    clearMocks: true,

    // Покрытие (опционально)
    collectCoverageFrom: ['src/**/*.(t|j)s'],
    coverageDirectory: 'coverage',

    // Игнорируем сборку
    modulePathIgnorePatterns: ['<rootDir>/dist'],

    // Быстрее тесты
    testTimeout: 5000,
};

export default config;