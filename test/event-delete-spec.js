const proxyquire = require('proxyquire');
const sinon = require('sinon');
const supertest = require('supertest');
const expect = require('chai').expect;
const bodyParser = require('body-parser');
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const express = require('express');
const eventRoutes = require('../routes/event-routes');

describe('DELETE /event', () => {
  let request;
  let deleteEventStub;

  beforeEach(() => {
    const app = express();
    app.use(bodyParser.json());

    const mainRouter = new express.Router();
    app.use(mainRouter);

    deleteEventStub = sinon.stub();

    // Event feature module with stubbed event model dependency so we don't need DB to test.
    // Proxyquire enables stubbing the modules of the required module, in this case
    // the event model and its method deleteAll
    const feature = proxyquire('../features/event-feature', {
      '../models/event': {
        deleteAll: deleteEventStub
      }
    });
    // Bind event routes to main router
    eventRoutes(mainRouter, feature);
    // Get a supertest instance so we can make requests
    request = supertest(app);
  });

  it('should respond with a 204 when deleting events', () => {
    deleteEventStub.resolves(null);
    return request
      .delete('/event')
      .expect(204);
  });

  it('should respond with an events deleted message when deleting events', () => {
    deleteEventStub.resolves(null);
    return request
      .delete('/event')
      .expect(204)
      .then((res) => {
        expect(res.body).to.deep.equal({});
      });
  });
});
