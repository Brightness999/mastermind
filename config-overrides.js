const { override, addDecoratorsLegacy, disableEsLint, addBundleVisualizer, addWebpackAlias, adjustWorkbox, addLessLoader, addWebpackPlugin } = require('customize-cra');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = override(
  addDecoratorsLegacy(),
  disableEsLint(),
  addBundleVisualizer({}, true),
  addWebpackAlias({
    '@': path.resolve(__dirname, 'src'),
    components: path.resolve(__dirname, 'src/components'),
    routes: path.resolve(__dirname, 'src/routes'),
    assets: path.resolve(__dirname, 'src/assets'),
    utils: path.resolve(__dirname, 'src/utils')
  }),
  adjustWorkbox(wb =>
    Object.assign(wb, {
      skipWaiting: true,
      exclude: (wb.exclude || []).concat('index.html')
    })
  ),
  addLessLoader({
    localIdentName: '[local]--[hash:base64:8]',
    javascriptEnabled: true,
    modifyVars: {}
  }),
  addWebpackPlugin(new UglifyJsPlugin({
    uglifyOptions: {
      compress: {
        drop_console: true, // Disable console.log statements
        unused: true, // Remove unused variables and functions
        dead_code: true, // Remove unreachable code
        reduce_vars: true, // Optimize variable names
      },
      output: {
        comments: false, // Remove comments
      },
    },
  }))
);
