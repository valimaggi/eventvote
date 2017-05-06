const sinon = require('sinon');
const expect = require('chai').expect;
require('sinon-as-promised'); // This needs to be called once to enable promise stubbing

const initRequest = require('../test-helpers').initRequest;
const createEventRouter = require('../../features/event/event-routes');

describe('DELETE /event', () => {
  let createEventRouterRequest;
  let stubForDeleteAll;
  let request;

  before(() => {
    createEventRouterRequest = initRequest();
    stubForDeleteAll = sinon.stub();
    request = createEventRouterRequest(createEventRouter, '../features/event/event-feature', {
      './event-model': {
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
