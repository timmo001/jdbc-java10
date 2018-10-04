/* jshint node: true */
"use strict";
const Pool = require("./pool");
let pool;

class JDBC {
  constructor(config, classPaths) {
    pool = new Pool(config, classPaths);
  }
  initialize(cb) {
    return pool.initialize(cb);
  }
}

module.exports = JDBC;
