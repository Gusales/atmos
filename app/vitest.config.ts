import angularVitestPlugin from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        angularVitestPlugin(),
    ],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['src/test-setup.ts'],
        include: ['src/**/*.spec.ts'],
        coverage: {
            reporter: ['html'],
            include: ['src/app/**/*.ts'],
            exclude: ['src/app/**/*.spec.ts', 'src/main.ts']
        }
    }
})