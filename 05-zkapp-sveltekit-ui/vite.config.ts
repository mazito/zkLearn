import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],

  /* 
    We need to add this so build will not fail with: 
    ERROR: Top-level await is not available in the configured target environment
     ("chrome87", "edge88", "es2020", "firefox78", "safari14" + 2 overrides)
  */
  build: {
    target: 'esnext'
  },

  // continues default config
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  }
});