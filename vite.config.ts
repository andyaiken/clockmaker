import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { unplugin as stylex } from '@stylexjs/unplugin';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
	// Served from https://<user>.github.io/clockmaker/
	base: '/clockmaker/',
	plugins: [
		stylex.vite({ dev: command === 'serve', useCSSLayers: true }),
		react(),
		// A service worker that keeps the app's files, so it opens at a venue with no Wi-Fi.
		// public/manifest.webmanifest is linked from index.html, so the plugin doesn't make one.
		VitePWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			manifest: false,
			workbox: {
				// Includes the Help page's screenshots, so help works offline too
				globPatterns: [ '**/*.{js,css,html,svg,png,jpg,webmanifest}' ]
			}
		})
	]
}));
