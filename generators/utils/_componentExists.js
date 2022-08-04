/**
 * componentExists
 *
 * Check whether the given component exist in either the components directory
 */

const fs = require('fs');
const path = require('path');
const containers = fs.readdirSync(path.join(__dirname, '../../src/components'));

function componentExists(comp) {
  return containers.indexOf(comp.charAt(0).toUpperCase() + comp.slice(1)) >= 0;
}

module.exports = componentExists;
