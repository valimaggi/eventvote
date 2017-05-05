const applyMiddleware = (...middlewares) =>
  (app) => {
    middlewares.forEach(mw => app.use(mw));
    return app;
  };

module.exports = { applyMiddleware };
