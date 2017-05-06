const { INVALID_REQUEST_BODY, INVALID_REQUEST_URL, NONEXISTENT_DATES } = require('./messages');
const errors = require('../error-handlers').errors;

const NONEXISTENT_DATES_ERROR = 'NONEXISTENT_DATES_ERROR';

const validation = (err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json(INVALID_REQUEST_BODY);
  }
  return next(err);
};

const invalidId = (err, req, res, next) => {
  if (Object.prototype.hasOwnProperty.call(err, 'name') && err.name === 'CastError' && Object.prototype.hasOwnProperty.call(err, 'path') && err.path === '_id') {
    return res.status(400).json(INVALID_REQUEST_URL);
  }
  return next(err);
};

const vote = (err, req, res, next) => {
  if (err.message && err.message === NONEXISTENT_DATES_ERROR) {
    return res.status(404).json(NONEXISTENT_DATES);
  }
  return next(err);
};

module.exports = {
  errors: Object.assign(errors, { NONEXISTENT_DATES_ERROR }),
  validation,
  invalidId,
  vote
};
