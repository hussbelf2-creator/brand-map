import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
// يبني التطبيق كملف HTML واحد (يُنشر كـ Artifact أو يُستضاف على أي خادم ثابت)
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  build: { target: 'es2020', chunkSizeWarningLimit: 4000, assetsInlineLimit: 100000000 }
});
