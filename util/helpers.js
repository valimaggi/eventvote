const INVALID_REQUEST_URL = require('../common/messages').INVALID_REQUEST_URL;

const isInvalidId = err =>
  // If the error is CastError to _id field, the given id is invalid
  Object.prototype.hasOwnProperty.call(err, 'name') && err.name === 'CastError' && Object.prototype.hasOwnProperty.call(err, 'path') && err.path === '_id';

function sendErrorResponse(err, res) {
  if (isInvalidId(err)) {
    return res.status(400).json(INVALID_REQUEST_URL);
  }
  // Otherwise just server error
  return res.sendStatus(500);
}

module.exports = { sendErrorResponse };
