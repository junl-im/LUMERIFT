import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    sourcemap: true,
    assetsInlineLimit: 2_048,
    chunkSizeWarningLimit: 750,
    rollupOptions: {
      output: {
        // Vite 8 / Rolldown 타입은 manualChunks의 객체 별칭 형식 대신
        // 함수 형식을 사용한다. PixiJS와 Firebase만 명시적으로 분리하고
        // 나머지 모듈은 번들러의 기본 코드 분할에 맡긴다.
        manualChunks(id: string): string | undefined {
          const normalizedId = id.replaceAll('\\', '/');

          if (normalizedId.includes('/node_modules/pixi.js/')) {
            return 'pixi';
          }

          if (
            normalizedId.includes('/node_modules/firebase/') ||
            normalizedId.includes('/node_modules/@firebase/')
          ) {
            return 'firebase';
          }

          return undefined;
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
