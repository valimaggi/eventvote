const isEmpty = require('lodash/isEmpty');

function validateNewEvent(req) {
  if (req === undefined || isEmpty(req)) return false;
  if (!Object.prototype.hasOwnProperty.call(req, 'body') || req.body === undefined || isEmpty(req.body)) return false;
  if (!Object.prototype.hasOwnProperty.call(req.body, 'name') || req.body.name === undefined || isEmpty(req.body.name)) return false;
  if (typeof req.body.name !== 'string') return false;
  if (!Object.prototype.hasOwnProperty.call(req.body, 'dates') || req.body.dates === undefined || isEmpty(req.body.dates)) return false;
  if (!Array.isArray(req.body.dates)) return false;
  return true;
}

module.exports = validateNewEvent;
