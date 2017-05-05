function applyMiddleware(...middlewares) {
  return (app) => {
    middlewares.forEach(mw => app.use(mw));
    return app;
  };
}

module.exports = applyMiddleware;
