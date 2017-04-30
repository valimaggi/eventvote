const express = require('express');
const proxyquire = require('proxyquire');
const supertest = require('supertest');

const appWithMiddleware = (app, middlewares) => {
  middlewares.forEach(mw => app.use(mw));
  return app;
};

const initRequest = (createRouter, ...middlewares) => {
  const app = appWithMiddleware(express(), middlewares);
  return (routeHandlerModulePath, stubObject) => {
    // Module with stubbed dependency (for example model module so we don't need DB in API testing)
    // Proxyquire enables stubbing the modules of the required module
    const routeHandlerModule = proxyquire(routeHandlerModulePath, stubObject);
    const router = createRouter(routeHandlerModule);
    app.use(router);
    // Supertest instance so we can make requests
    return supertest(app);
  };
};

module.exports = { initRequest };
