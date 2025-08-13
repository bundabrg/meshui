import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson(), StaticHmr()]
});

function StaticHmr() {
	return {
		name: 'md-hmr',
		enforce: 'post' as const,
		handleHotUpdate({ file, server }: any) {
			console.log(file);
			if (file.includes('static/')) {
				server.ws.send({
					type: 'full-reload',
					path: '*'
				});
			}
		}
	};
}