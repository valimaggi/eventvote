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

module.exports = { createDateMappedEventFactory };
