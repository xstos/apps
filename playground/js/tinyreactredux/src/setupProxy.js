const { createProxyMiddleware } = require('http-proxy-middleware');
// https://create-react-app.dev/docs/proxying-api-requests-in-development/
// necessary to avoid browser CORS errors when sending requests to other domains
module.exports = function(app) {
  app.use(
    '/wiki/Representational_state_transfer',
    createProxyMiddleware({
      target: 'https://en.wikipedia.org/',
      changeOrigin: true,
    })
  );
};
