import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		exclude: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
		environment: 'jsdom',
		globals: true,
	}
});