/**
 * routeExists
 *
 * Check whether the given page exist in either the routes directory
 */

const fs = require('fs');
const path = require('path');
const containers = fs.readdirSync(path.join(__dirname, '../../src/routes'));

function routeExists(comp) {
  return containers.indexOf(comp.charAt(0).toUpperCase() + comp.slice(1)) >= 0;
}

module.exports = routeExists;
