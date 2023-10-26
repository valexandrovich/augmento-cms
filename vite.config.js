import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

// https://vitejs.dev/config/
export default defineConfig({
  // base: process.env.VITE_BASE_URL,
  base: '/augmento-cms/',
  plugins: [
    vue(
        {
          template: {
            compilerOptions: {
              isCustomElement: (tag) => tag === 'model-viewer'
            }
          }
        }
    ),
    vueJsx(),
  ],
  server: {
    host: true,
    port: 8080
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
