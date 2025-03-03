import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/lib.ts',
      name: 'window-manager',
      fileName: (format) => `window-manger.${format}.js`,
      formats: ['es'],
    },
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: 'style.css',
      },
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
