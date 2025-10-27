// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import path from 'path';


// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   // base: process.env.VITE_BASE_PATH || "/fnbSafeHive",
//   // optimizeDeps: {
//   //   exclude: ['lucide-react'],
//   // },
//    resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'), // ✅ Optional: cleaner imports like @/components
//     },
//   },
//   base: import.meta.env.VITE_BASE_PATH || '/', // ✅ Use import.meta.env for frontend-safe access
//   optimizeDeps: {
//     exclude: ['lucide-react'], // ✅ Prevent pre-bundling issues
//   },
//   build: {
//     outDir: 'dist',
//     sourcemap: true, // ✅ Helpful for debugging Vercel deploys
//   },
//   server: {
//     port: 5175,
//     open: true,
//   },

// });
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  // ✅ Use process.env here (Node environment)
  base: process.env.VITE_BASE_PATH || '/',

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  server: {
    port: 5175,
    open: true,
  },
});
