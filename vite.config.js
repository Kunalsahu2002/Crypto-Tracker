import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load .env so we can forward the API key in the proxy header
  const env = loadEnv(mode, process.cwd(), '');
  const cgKey = env.VITE_CG_DEMO_KEY || '';

  return {
    plugins: [react()],
    base: '/',
    server: {
      proxy: {
        '/api': {
          target: 'https://api.coingecko.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          proxyTimeout: 60_000,
          timeout: 60_000,
          // Forward the demo API key as a header if one is configured
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (cgKey) {
                proxyReq.setHeader('x-cg-demo-api-key', cgKey);
              }
            });
          },
        },
      },
    },
  };
})



