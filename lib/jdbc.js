/* jshint node: true */
"use strict";
var Pool = require("./pool");

class JDBC {
  constructor(config, classPaths) {
    new Pool(config, classPaths);
  }
}

module.exports = JDBC;
