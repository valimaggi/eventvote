const INVALID_REQUEST_URL = require('../common/messages').INVALID_REQUEST_URL;

const dateMappedEvent = (mapDate, dateFormat) =>
  (id, name, dates, votes) => ({
    id,
    name,
    dates: dates.map(date => mapDate(date, dateFormat)),
    votes: votes.map(vote => (
      {
        date: mapDate(vote.date, dateFormat),
        people: vote.people
      }
    ))
  });

const dbErrorResponse = (err, res) => {
  // If the error is CastError to _id field, the given id is invalid => 400 Bad Request
  if (err.name === 'CastError' && err.path === '_id') {
    return res.status(400).json(INVALID_REQUEST_URL);
  }
  // Otherwise just server error
  return res.sendStatus(500);
};

module.exports = { dateMappedEvent, dbErrorResponse };
