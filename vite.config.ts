import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// NOTE: 'base' を GitHub リポジトリ名に合わせて変更してください
// 例: リポジトリが https://github.com/yourname/kosu-app の場合
//   base: '/kosu-app/'
export default defineConfig({
  plugins: [react()],
  base: '/kosu-app/',
})
