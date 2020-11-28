
// rollup.config.js

export default [{
  input: 'js/gw.js',
  output: {
    file: 'dist/gw.js',
    format: 'umd',
    name: 'GW',
    freeze: false,
    extend: true,
  }
},
{
  // Really?  Do we need this?
  input: 'js/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    freeze: false,
  }
},

];