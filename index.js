"use strict";

var glob = require("glob");
var path = require("path");
var loaderUtils = require("loader-utils");

module.exports = function (content, sourceMap) {
  this.cacheable && this.cacheable();

  var query = loaderUtils.parseQuery(this.query);

  if (!query.pattern) {
    var resourceDir = path.dirname(this.resourcePath);
    query = Object.keys(query).reduce(function(result, key) {
      result[key] = query[key];
      return result;
    }, {});

    query.pattern = content.trim();
    return handle.call(this, query, resourceDir);
  } else {
    return content;
  }
};


// var request = loaderUtils.stringifyRequest(this, remainingRequest);

module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  this.cacheable && this.cacheable();

  var query = loaderUtils.parseQuery(this.query);
  var resourceDir;

  if (query.pattern) {
    var issuer = this._module.issuer;
    var issuerIndex = issuer.lastIndexOf('!');

    if (issuerIndex !== -1) {
      issuer = issuer.slice(issuerIndex + 1);
    }

    return handle.call(this, query, issuer);
  }
};

function handle(query, issuer) {
  var resourceDir = path.dirname(issuer);

  var files = glob.sync(query.pattern, {
    cwd: resourceDir
  });

  if (!files.length) {
    this.emitWarning('Did not find anything for glob "' + query.pattern + '" in directory "' + resourceDir + '"');
  }

  var result = "module.exports = {\n" + files.map(function (file) {
    var dep = path.resolve(resourceDir, file);
    this.addDependency(dep);

    var stringifiedFile = JSON.stringify(file);
    var stringifiedDep = JSON.stringify(dep);
    return "\t" + stringifiedFile + ": require(" + stringifiedDep + ")";
  }, this).join(",\n") + "\n};"

  return result;
}