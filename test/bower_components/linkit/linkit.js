
/* global module */

function linkifyFunction (obj, newObj, f) {
  return function () {
    var val = f.apply(obj, arguments);
    if (val === undefined) return newObj;
    else return val;
  }
}

function defineChainableFunction (obj, prop, old) {
  Object.defineProperty(obj, prop, {
    get: function () {
      if (typeof old[prop] === 'function')
        return linkifyFunction(old, obj, old[prop]);
      else if (typeof old[prop] === 'object')
        return linkit(old[prop]);
      else return old[prop];
    },
    set: function (val) {
      old[prop] = val;
    }
  });
}

function linkit (oldObj) {
  var newObj = oldObj.constructor();

  for (var k in oldObj)
    defineChainableFunction(newObj, k, oldObj);

  return newObj;
}

Object.prototype.linkit = function () {
  return linkit(this);
}

if (typeof module === 'object')
  module.exports = linkit;
