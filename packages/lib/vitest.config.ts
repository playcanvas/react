import react from '@vitejs/plugin-react';
import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['test/**', 'src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.d.ts'],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80
            }
        },
        projects: [
            {
                extends: true,
                test: {
                    name: 'jsdom',
                    environment: 'jsdom',
                    globals: true,
                    setupFiles: ['./test/setup.ts'],
                    include: ['src/**/*.test.{ts,tsx}'],
                    exclude: [...configDefaults.exclude, 'src/**/*.node.test.ts']
                }
            },
            {
                // SSR regression tests — a plain Node environment with no DOM and no
                // playcanvas mocks, mirroring what SSG frameworks do at build time.
                extends: true,
                test: {
                    name: 'node',
                    environment: 'node',
                    include: ['src/**/*.node.test.ts']
                }
            }
        ]
    }
});
