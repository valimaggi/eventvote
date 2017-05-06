const eventMessages = require('./messages');
const errors = require('../error-handlers').errors;

const NONEXISTENT_DATES_ERROR = 'NONEXISTENT_DATES_ERROR';

const isDatesNotFoundError = error => error.message && error.message === errors.NONEXISTENT_DATES_ERROR;

const voteErrorHandler = (err, req, res, next) => {
  if (isDatesNotFoundError(err)) {
    return res.status(404).json(eventMessages.NONEXISTENT_DATES);
  }
  return next(err);
};

module.exports = {
  errors: Object.assign(errors, { NONEXISTENT_DATES_ERROR }),
  voteErrorHandler
};
