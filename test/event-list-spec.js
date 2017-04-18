const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const express = require('express');
const eventRoutes = require('../routes/event-routes');

describe('GET /event/list', () => {
  let request;
  let getAllStub;

  beforeEach(() => {
    const app = express();
    const mainRouter = new express.Router();
    app.use(mainRouter);

    getAllStub = sinon.stub();

    // Event feature module with stubbed event model dependency so we don't need DB to test.
    // Proxyquire enables stubbing the modules of the required module, in this case
    // the event model and its method getAll
    const feature = proxyquire('../features/event-feature', {
      '../models/event': {
        getAll: getAllStub,
      },
    });
    // Bind event routes to main router
    eventRoutes(mainRouter, feature);
    // Get a supertest instance so we can make requests
    request = supertest(app);
  });

  it('should respond with a 404 when using wrong URL', () => {
    //  Wrong URL
    request
      .get('/even')
      .expect(404);
  });

  it('should respond with a 200 and no events', () => {
    // DB stub returns no events
    getAllStub.resolves([]);
    return request
      .get('/event/list')
      .expect('Content-Type', /json/)
      .expect(200)
      .then((res) => {
        // API returns an empty array
        expect(res.body).to.deep.equal({ events: [] });
      });
  });

  it('should respond with a 200 and two events', () => {
    // DB stub returns events with id, name and dates
    getAllStub.resolves([
      {
        _id: '1',
        name: 'party',
        dates: [
          '2016-12-01',
        ],
      },
      {
        _id: '2',
        name: 'party 2',
        dates: [
          '2017-12-01',
        ]
      }
    ]);
    return request
      .get('/event/list')
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
});
