import {build} from 'esbuild';

await build({
  entryPoints: ['src/motion.jsx'],
  bundle: true,
  minify: true,
  outfile: 'assets/portfolio-motion.js',
  format: 'iife',
  jsx: 'automatic',
  target: ['es2020'],
  define: {'process.env.NODE_ENV': '"production"'},
  legalComments: 'linked'
});
console.log('Built local React Bits, GSAP and Lenis assets.');
