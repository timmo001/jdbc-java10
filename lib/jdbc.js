/* jshint node: true */
"use strict";
var Pool = require("./pool");

class JDBC {
  constructor(config) {
    new Pool.call(this, config);
  }
  prototype = Object.create(new Pool.prototype);
}

module.exports = JDBC;
