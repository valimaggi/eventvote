const expect = require('chai').expect;
const dateMappedEvent = require('../util/helpers').dateMappedEvent;

const moment = require('moment');

describe('helper dateMappedEvent', () => {
  let createMomentMappedEvent;
  beforeEach(() => {
    const mapDatesWithMoment = (date, dateFormat) => moment(date).format(dateFormat);
    createMomentMappedEvent = dateMappedEvent(mapDatesWithMoment, 'YYYY-MM-DD');
  });
  it('should return an event object with correctly mapped dates when calling dateMappedEvent without votes', () => {
    const id = 1;
    const name = 'mikko';
    const dates = ['2016-05-18T16:00:00Z'];
    expect(
      createMomentMappedEvent(id, name, dates, [])
    )
    .to.deep.equal(
      { id: id, name: name, dates: ['2016-05-18'], votes: [] }
    );
  });

  it('should return an event object with votes and correctly mapped dates when calling dateMappedEvent with votes', () => {
    const id = 1;
    const name = 'mikko';
    const dates = ['2016-05-18T16:00:00Z'];
    const voter = 'jaakko';
    const votes = [{ date: '2016-05-18T16:00:00Z', people: [voter] }];
    expect(
      createMomentMappedEvent(id, name, dates, votes)
    )
    .to.deep.equal(
      { id: id, name: name, dates: ['2016-05-18'], votes: [{ date: '2016-05-18', people: [voter] }] }
    );
  });
});
