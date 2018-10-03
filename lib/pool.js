/* jshint node: true */
"use strict";
var _ = require('lodash');
var async = require('async');
var uuid = require('uuid');
var jinst = require("./jinst");
var dm = require('./drivermanager');
var Connection = require('./connection');

var java = jinst.getInstance();

if (!jinst.isJvmCreated()) {
  jinst.addOption("-Xrs");
}

var addConnection = (url, props, callback) => {
  dm.getConnection(url, (err, conn) => {
    if (err) {
      return callback(err);
    } else {
      return callback(null, { uuid: uuid.v4(), conn: new Connection(conn) });
    }
  }, props);
};

class Pool {
  constructor(config) {
    this._url = config.url;
    this._props = (function (config) {
      var Properties = java.import('java.util.Properties');
      var properties = new Properties();

      for (var name in config.properties) {
        properties.putSync(name, config.properties[name]);
      }

      if (config.user && properties.getPropertySync('user') === undefined) {
        properties.putSync('user', config.user);
      }

      if (config.password && properties.getPropertySync('password') === undefined) {
        properties.putSync('password', config.password);
      }

      return properties;
    })(config);
    this._drivername = config.drivername ? config.drivername : '';
    this._minpoolsize = config.minpoolsize ? config.minpoolsize : 1;
    this._maxpoolsize = config.maxpoolsize ? config.maxpoolsize : 1;
    this._pool = [];
    this._reserved = [];
  }

  status() {
    console.log("########## POOL STATUS ##########");
    console.log("AVAILABLE: " + this._pool.length);
    _.each(this._pool, function (el) { console.log("  UUID: " + el.uuid); });
    console.log("");
    console.log("RESERVED:  " + this._reserved.length);
    _.each(this._reserved, function (el) { console.log("  UUID: " + el.uuid); });
    console.log("#################################");
    console.log("");
  }

  initialize(callback) {
    // If a drivername is supplied, initialize the via the old method,
    // Class.forName()
    if (this._drivername) {
      java.newInstance(this._drivername, function (err, driver) {
        if (err) {
          return callback(err);
        }
        else {
          dm.registerDriver(driver, function (err) {
            if (err) {
              return callback(err);
            }
          });
        }
      });
    }
    console.log('minpoolsize:', this._minpoolsize);
    async.times(this._minpoolsize, (n, next) => {
      addConnection(this._url, this._props, (err, conn) => {
        next(err, conn);
      });
    }, (err, conns) => {
      if (err) {
        return callback(err);
      }
      else {
        _.each(conns, conn => {
          this._pool.push(conn);
        });
        return callback(null);
      }
    });
  }
  reserve(callback) {
    if (this._pool.length > 0) {
      var conn = this._pool.shift();
      this._reserved.unshift(conn);
      return callback(null, conn);
    }
    else if (this._reserved.length < this._maxpoolsize) {
      addConnection(this._url, this._props, function (err, conn) {
        if (err) {
          return callback(err);
        }
        else {
          this._reserved.unshift(conn);
          return callback(null, conn);
        }
      });
    }
    else {
      return callback(new Error("No more pool connections available"));
    }
  }
  release(conn, callback) {
    if (typeof conn === 'object') {
      var uuid = conn.uuid;
      this._reserved = _.reject(this._reserved, (conn) => {
        return conn.uuid === uuid;
      });
      this._pool.unshift(conn);
      return callback(null);
    }
    else {
      return callback(new Error("INVALID CONNECTION"));
    }
  }
}

module.exports = Pool;
