const INVALID_REQUEST_URL = require('../common/messages').INVALID_REQUEST_URL;

const sendServerErrorResponse = (err, res) => {
  // If the error is CastError to _id field, the given id is invalid => 400 Bad Request
  if (Object.prototype.hasOwnProperty.call(err, 'name') && err.name === 'CastError' && Object.prototype.hasOwnProperty.call(err, 'path') && err.path === '_id') {
    return res.status(400).json(INVALID_REQUEST_URL);
  }
  // Otherwise just server error
  return res.sendStatus(500);
};

module.exports = { sendServerErrorResponse };
