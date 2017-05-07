const { INVALID_REQUEST_BODY } = require('./messages');

const applyMiddleware = (...middlewares) =>
  (app) => {
    middlewares.forEach(mw => app.use(mw));
    return app;
  };

const invalidJSONErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json(INVALID_REQUEST_BODY);
  }
  return next(err);
};

const serverErrorHandler = (err, req, res, next) => res.sendStatus(500); // eslint-disable-line

module.exports = { applyMiddleware, invalidJSONErrorHandler, serverErrorHandler };
