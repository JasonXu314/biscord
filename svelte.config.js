import vercel from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import { sass } from 'svelte-preprocess-sass';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({ sass: sass() }),

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: vercel()
	}
};

export default config;
