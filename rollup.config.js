
// GW-CANVAS: rollup.config.js

import { terser } from "rollup-plugin-terser";


export default [{
  input: 'js/gw.js',
  output: {
    file: 'dist/gw-canvas.min.js',
    format: 'umd',
    name: 'GW',
    freeze: false,
    extend: true,
    sourcemap: true,
    plugins: [terser()]
  }
},
{
  // Really?  Do we need this?
  input: 'js/index.js',
  output: {
    file: 'dist/gw-canvas.js',
    format: 'cjs',
    freeze: false,
  }
},

];