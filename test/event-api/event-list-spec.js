const sinon = require('sinon');
const expect = require('chai').expect;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const { initRequest } = require('../test-helpers');
const createEventRouter = require('../../features/event/event-routes');

describe('GET /event/list', () => {
  let createEventRouterRequest;
  let stubForGetAll;
  let request;

  before(() => {
    createEventRouterRequest = initRequest();
    stubForGetAll = sinon.stub();
    request = createEventRouterRequest(createEventRouter, '../features/event/event-feature', {
      './event-model': {
        getAll: stubForGetAll,
      }
    });
  });

  it('should respond with a 200 and no events when there are no events', () => {
    // DB stub returns no events
    stubForGetAll.resolves([]);
    return request
      .get('/list')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        // API returns an empty array
        expect(res.body).to.deep.equal({ events: [] });
      });
  });

  it('should respond with a 200 and two events when there are two events', () => {
    // DB stub returns events with id, name and dates
    stubForGetAll.resolves([
      {
        _id: '1',
        name: 'party',
        dates: ['2016-12-01']
      },
      {
        _id: '2',
        name: 'party 2',
        dates: ['2017-12-01']
      }
    ]);
    return request
      .get('/list')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        // API will return events with only id and name
        expect(res.body).to.deep.equal(
          { events: [
            {
              id: '1',
              name: 'party'
            },
            {
              id: '2',
              name: 'party 2'
            }
          ]
          });
      });
  });

  it('should respond with a 500 in other cases when errors occur in server', () => {
    const errorObject = {
      name: 'not CastError'
    };
    // DB stub returns error
    stubForGetAll.rejects(errorObject);
    return request
    .get('/list')
    .expect(500);
  });
});
