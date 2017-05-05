const createDateMappedEventFactory = (mapDate, dateFormat) =>
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

const errorStrings = {
  NONEXISTENT_DATES_ERROR: 'NONEXISTENT_DATES_ERROR',
  RESOURCE_NOT_FOUND_ERROR: 'RESOURCE_NOT_FOUND_ERROR'
};

module.exports = { createDateMappedEventFactory, errorStrings };
