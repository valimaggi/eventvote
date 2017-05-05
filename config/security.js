const helmet = require('helmet');

const SIXTY_DAYS_IN_SECONDS = 5184000;

const helmetFunctions = [
  helmet.hidePoweredBy(),
  helmet.dnsPrefetchControl(),
  helmet.frameguard({ action: 'sameorigin' }),
  helmet.ieNoOpen(),
  helmet.noSniff(),
  helmet.xssFilter(),
  helmet.hsts({ maxAge: SIXTY_DAYS_IN_SECONDS })
];

module.exports = helmetFunctions;
