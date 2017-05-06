const isEmpty = require('lodash/isEmpty');
const commonMessages = require('../common/messages');

const requestBody = (req, res, next) => { // eslint-disable-line
  if (!Object.prototype.hasOwnProperty.call(req, 'body') || req.body === undefined || isEmpty(req.body)) {
    return res.status(400).json(commonMessages.INVALID_REQUEST_BODY);
  }
  next();
};

module.exports = { requestBody };
