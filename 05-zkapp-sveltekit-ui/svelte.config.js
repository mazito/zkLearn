//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
      // options for a static site or SPA
      pages: 'build',
      assets: 'build',
      // fallback: undefined, // for static site
      fallback: 'index.html', // for SPA
      precompress: false,
      strict: true
    }),
		alias: {
			'@components': path.resolve('./src/lib/components'),
			'@contracts': path.resolve('./src/lib/contracts'),
		},
	}
};

export default config;
