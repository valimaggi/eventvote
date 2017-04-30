const sinon = require('sinon');
const expect = require('chai').expect;
const initRequest = require('./util/test-helpers').initRequest;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const createEventRouter = require('../routes/event-routes');

describe('DELETE /event', () => {
  let createEventRouterRequest;
  let stubForDeleteAll;
  let request;

  before(() => {
    createEventRouterRequest = initRequest(createEventRouter);
    stubForDeleteAll = sinon.stub();
    request = createEventRouterRequest('../../features/event-feature', {
      '../models/event': {
        deleteAll: stubForDeleteAll
      }
    });
  });

  it('should respond with a 204 when deleting events', () => {
    stubForDeleteAll.resolves(null);
    return request
      .delete('/')
      .expect(204);
  });

  it('should respond with an events deleted message when deleting events', () => {
    stubForDeleteAll.resolves(null);
    return request
      .delete('/')
      .expect(204)
      .then((res) => {
        expect(res.body).to.deep.equal({});
      });
  });
});
