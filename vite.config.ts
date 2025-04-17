import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // CRAと同じポートを使用
    open: true, // 起動時にブラウザを開く
  },
  build: {
    outDir: 'dist', // Amplifyが期待する出力ディレクトリ
    sourcemap: true
  }
})