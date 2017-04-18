const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;
const messages = require('../common/messages');
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const express = require('express');
const eventRoutes = require('../routes/event-routes');

describe('GET /event/:id/results', () => {
  let request;
  let findOneStub;

  beforeEach(() => {
    const app = express();
    const mainRouter = new express.Router();
    app.use(mainRouter);

    findOneStub = sinon.stub();

    // Event feature module with stubbed event model dependency so we don't need DB to test.
    // Proxyquire enables stubbing the modules of the required module, in this case
    // the event model and its method findOne
    const feature = proxyquire('../features/event-feature', {
      '../models/event': {
        findOne: findOneStub
      }
    });
    // Bind event routes to main router
    eventRoutes(mainRouter, feature);
    // Get a supertest instance so we can make requests
    request = supertest(app);
  });

  it('should respond with a 200 and one date found from one voted date', () => {
    const testId = 2;
    // DB stub returns an event
    findOneStub.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: [
          '2014-01-01',
          '2014-01-05',
          '2014-01-12'
        ],
        votes: [
          {
            date: '2014-01-01',
            people: [
              'Matt',
              'Heidi',
              'Tyrsky'
            ]
          }
        ]
      }
    );
    return request
      .get('/event/' + testId + '/results')
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal({
          id: testId,
          name: 'Tyrsky\'s secret party',
          suitableDates: [
            {
              date: '2014-01-01',
              people: [
                'Matt',
                'Heidi',
                'Tyrsky'
              ]
            }
          ]
        });
      });
  });

  it('should respond with a 200 and one date found from two voted date', () => {
    const testId = 2;
    // DB stub returns an event
    findOneStub.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: [
          '2014-01-01',
          '2014-01-05',
          '2014-01-12'
        ],
        votes: [
          {
            date: '2014-01-01',
            people: [
              'Matt',
              'Heidi',
              'Tyrsky'
            ]
          },
          {
            date: '2014-01-05',
            people: [
              'Matt',
              'Tyrsky'
            ]
          }
        ]
      }
    );
    return request
      .get('/event/' + testId + '/results')
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal({
          id: testId,
          name: 'Tyrsky\'s secret party',
          suitableDates: [
            {
              date: '2014-01-01',
              people: [
                'Matt',
                'Heidi',
                'Tyrsky'
              ]
            }
          ]
        });
      });
  });

  it('should respond with a 200 and two dates found from three voted date', () => {
    const testId = 2;
    // DB stub returns an event
    findOneStub.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: [
          '2014-01-01',
          '2014-01-05',
          '2014-01-12'
        ],
        votes: [
          {
            date: '2014-01-01',
            people: [
              'Matt',
              'Heidi',
              'Tyrsky'
            ]
          },
          {
            date: '2014-01-05',
            people: [
              'Matt',
              'Tyrsky'
            ]
          },
          {
            date: '2014-01-12',
            people: [
              'Heidi',
              'Matt',
              'Tyrsky'
            ]
          }
        ]
      }
    );
    return request
      .get('/event/' + testId + '/results')
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal({
          id: testId,
          name: 'Tyrsky\'s secret party',
          suitableDates: [
            {
              date: '2014-01-01',
              people: [
                'Matt',
                'Heidi',
                'Tyrsky'
              ]
            },
            {
              date: '2014-01-12',
              people: [
                'Matt',
                'Heidi',
                'Tyrsky'
              ]
            }
          ]
        });
      });
  });

  it('should respond with a 200 and no suitable date found', () => {
    const testId = 2;
    // DB stub returns an event
    findOneStub.resolves(
      {
        _id: testId,
        name: 'Tyrsky\'s secret party',
        dates: [
          '2014-01-01',
          '2014-01-05',
          '2014-01-12'
        ],
        votes: [
          {
            date: '2014-01-01',
            people: [
              'Matt',
              'Heidi',
              'Tyrsky'
            ]
          },
          {
            date: '2014-01-05',
            people: [
              'Matt'
            ]
          },
          {
            date: '2014-01-12',
            people: [
              'Heidi',
              'Jaska'
            ]
          }
        ]
      }
    );
    return request
      .get('/event/' + testId + '/results')
      .expect(200)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.NO_SUITABLE_DATE);
      });
  });

  it('should respond with a 200 and not found', () => {
    const nonExistingId = 'jhy8b';
    // DB stub returns null
    findOneStub.resolves(null);
    return request
      .get('/event/' + nonExistingId + '/results')
      .expect(404)
      .then((res) => {
        expect(res.body).to.deep.equal(messages.RESOURCE_NOT_FOUND);
      });
  });
});
