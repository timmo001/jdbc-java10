/* jshint node: true */
"use strict";
var Pool = require("./pool");

class JDBC {
  constructor(config) {
    new Pool(config);
  }
}

module.exports = JDBC;
