const commonMessages = require('../common/messages');

const RESOURCE_NOT_FOUND_ERROR = 'RESOURCE_NOT_FOUND_ERROR';

const isResourceNotFoundError = error => error.message && error.message === RESOURCE_NOT_FOUND_ERROR;

const serverErrorHandler = (err, req, res, next) => res.sendStatus(500); // eslint-disable-line

const resourceNotFoundErrorHandler = (err, req, res, next) => {
  if (isResourceNotFoundError(err)) {
    return res.status(404).json(commonMessages.RESOURCE_NOT_FOUND);
  }
  return next(err);
};

const buildErrorHandlers = (...customErrorHandlers) => [...customErrorHandlers, resourceNotFoundErrorHandler, serverErrorHandler]; // eslint-disable-line

module.exports = { buildErrorHandlers, errors: { RESOURCE_NOT_FOUND_ERROR } };
