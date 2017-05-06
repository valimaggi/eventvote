const { RESOURCE_NOT_FOUND } = require('../common/messages');

const RESOURCE_NOT_FOUND_ERROR = 'RESOURCE_NOT_FOUND_ERROR';

const serverErrorHandler = (err, req, res, next) => res.sendStatus(500); // eslint-disable-line

const resourceNotFound = (err, req, res, next) => {
  if (err.message && err.message === RESOURCE_NOT_FOUND_ERROR) {
    return res.status(404).json(RESOURCE_NOT_FOUND);
  }
  return next(err);
};

const composeErrorHandlers = (...customErrorHandlers) => [...customErrorHandlers, serverErrorHandler]; // eslint-disable-line

module.exports = { composeErrorHandlers, resourceNotFound, errors: { RESOURCE_NOT_FOUND_ERROR } };
