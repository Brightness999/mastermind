import enquireJS from 'enquire.js';

const mobileQuery = 'only screen and (max-width: 767.99px)';
const tabletQuery =
  'only screen and (min-width: 768px) and (max-width: 1024px)';
const desktopQuery = 'only screen and (min-width: 1025px)';

// Whether it is matching the moving window size
export function enquireIsMobile(cb, handlers) {
  return enquireScreen(mobileQuery, cb, handlers);
}

// Whether it is matching the size of the Pad window
export function enquireIsTablet(cb, handlers) {
  return enquireScreen(tabletQuery, cb, handlers);
}

// Whether it is matching the desktop window size
export function enquireIsDesktop(cb, handlers) {
  return enquireScreen(desktopQuery, cb, handlers);
}

/**
 * Enquire.js package
 * @param {*} query media query
 * @param {*} cb callback function
 * @param {*} handlers enquire.js handlers
 * @return Return unregister function
 */
export function enquireScreen(query, cb, handlers) {
  const handler = handlers || {
    match: () => {
      cb && cb(true);
    },
    unmatch: () => {
      cb && cb(false);
    }
  };
  enquireJS.register(query, handler);
  return _ => enquireJS.unregister(query);
}

export default enquireJS;
