var glob = require('glob');
var minimatch = require('minimatch');

var filterNegative = function(negativeMatches, allMatches) {
  negativeMatches.forEach(function(pattern) {
    allMatches = allMatches.filter(function(file) {
      return minimatch(file, pattern);
    });
  });

  return allMatches;
};

var globArray = {};
globArray.sync = function(patterns, options) {
  var fileMatches = [];

  patterns = patterns || [];
  options = options || {};

  var negativeGlobs = [];

  patterns.forEach(function(pattern) {
    if (pattern.substr(0, 1) !== '!') {
      var patternMatches = glob.sync(pattern, options);
      fileMatches = fileMatches.concat(patternMatches);
    } else {
      negativeGlobs.push(pattern);
    }
  });

  fileMatches = filterNegative(negativeGlobs, fileMatches);

  return fileMatches;
};

module.exports = globArray;