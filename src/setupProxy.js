// https://facebook.github.io/create-react-app/docs/proxying-api-requests-in-development#configuring-the-proxy-manually
// https://github.com/chimurai/http-proxy-middleware

const proxy = require('http-proxy-middleware');

// eslint-disable-next-line func-names
module.exports = function(app) {
  app.use(
    proxy('/api/sub', {
      target: 'http://localhost:8080',
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    })
  );
};
