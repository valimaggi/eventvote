const isEmpty = require('lodash/isEmpty');
const commonMessages = require('../../common/messages');
const eventMessages = require('./messages');
const errors = require('./utils').errors;

const isResourceNotFoundError = error => error.message && error.message === errors.RESOURCE_NOT_FOUND_ERROR;
const isDatesNotFoundError = error => error.message && error.message === errors.NONEXISTENT_DATES_ERROR;

const create = (req, res, next) => {
  // eslint-disable-line
  if (
    !Object.prototype.hasOwnProperty.call(req.body, 'name') ||
    req.body.name === undefined ||
    isEmpty(req.body.name) ||
    typeof req.body.name !== 'string' ||
    !Object.prototype.hasOwnProperty.call(req.body, 'dates') ||
    req.body.dates === undefined ||
    isEmpty(req.body.dates) ||
    !Array.isArray(req.body.dates)
  ) {
    return res.status(400).json(commonMessages.INVALID_REQUEST_BODY);
  }
  return next();
};

const castVote = (req, res, next) => {
  if (
    !Object.prototype.hasOwnProperty.call(req.body, 'name') ||
    req.body.name === undefined ||
    isEmpty(req.body.name) ||
    typeof req.body.name !== 'string' ||
    !Object.prototype.hasOwnProperty.call(req.body, 'votes') ||
    req.body.votes === undefined ||
    isEmpty(req.body.votes) ||
    !Array.isArray(req.body.votes)
  ) {
    return res.status(400).json(commonMessages.INVALID_REQUEST_BODY);
  }
  return next();
};

const castVoteError = (err, req, res, next) => {
  if (isResourceNotFoundError(err)) {
    return res.status(404).json(commonMessages.RESOURCE_NOT_FOUND);
  } else if (isDatesNotFoundError(err)) {
    return res.status(404).json(eventMessages.NONEXISTENT_DATES);
  }
  return next();
};

module.exports = { create, castVote, castVoteError };
