/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/lib.ts',
      name: 'window-manager',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs'],
    },
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: 'styles.css',
      },
    },
  },
  plugins: [
    dts({
      rollupTypes: true,
      entryRoot: 'src',
      outDir: 'dist',
      insertTypesEntry: true,
    }),
  ],
});
