import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'css', directives: true })],
    }),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/node_modules/vue/') || id.includes('/node_modules/vue-router/') || id.includes('/node_modules/pinia/')) {
            return 'vendor-vue';
          }
          if (id.includes('/node_modules/element-plus/') || id.includes('/node_modules/@element-plus/')) {
            return 'vendor-element';
          }
          if (id.includes('/node_modules/echarts/') || id.includes('/node_modules/zrender/')) {
            return 'vendor-echarts';
          }
          if (id.includes('/node_modules/mammoth/')) {
            return 'vendor-mammoth';
          }
          if (id.includes('/node_modules/axios/')) {
            return 'vendor-axios';
          }
          return 'vendor-misc';
        },
      },
    },
  },
});
