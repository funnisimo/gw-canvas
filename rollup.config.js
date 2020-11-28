
// rollup.config.js

export default {
  input: 'js/index.js',
  output: {
    file: 'dist/canvas.js',
    format: 'umd',
    name: 'GW',
    freeze: false,
    extend: true,
  }
};