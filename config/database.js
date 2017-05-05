const mongoose = require('mongoose');

// Set the native ES6 promise to mongoose since mongoose's mpromise is deprecated
mongoose.Promise = Promise;

const connect = (dbURI, dbUser, dbPass) => mongoose.connect(dbURI, { user: dbUser, pass: dbPass });

module.exports = { connect };
