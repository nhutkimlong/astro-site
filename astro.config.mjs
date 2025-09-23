import { defineConfig } from 'astro/config';
import path from 'node:path';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  server: {
    port: 4321,
    host: true // Allow external connections for Netlify dev
  },
  vite: {
    resolve: {
      alias: {
        '@scripts': path.resolve('./src/scripts'),
        '@styles': path.resolve('./src/styles')
      }
    },
    server: {
      fs: { strict: false }
    }
  },
  // Enable static file serving for assets
  publicDir: 'public',
  // Build configuration
  build: {
    assets: 'assets'
  },
  // Use hybrid mode for better compatibility with Netlify Functions
  output: 'hybrid',
  adapter: netlify({
    functionPerRoute: false
  }),
  // Integrations
  integrations: [tailwind()]
});
