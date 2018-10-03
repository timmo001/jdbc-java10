/* jshint node: true */
"use strict";
var Pool = require("./pool");

class JDBC {
  constructor(config) {
    new Pool.call(this, config);
  }
}

JDBC.prototype = Object.create(Pool.prototype);
JDBC.prototype.constructor = JDBC;

module.exports = JDBC;
