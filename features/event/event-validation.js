const isEmpty = require('lodash/isEmpty');
const commonMessages = require('../../common/messages');

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

module.exports = { create, castVote };
