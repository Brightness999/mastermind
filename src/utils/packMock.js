// http://www.wheresrhys.co.uk/fetch-mock/api
// http://mockjs.com/
import fetchMock from 'fetch-mock';
import $$ from 'cmn-utils';
import Mock from 'mockjs';
import config from '../config';
const {mock} = Mock;

/**
 * Analog delay request
 * @param {any} response Analog response data
 * @param {number} time How many milliseconds to delay, omitting this number will generate a delay of 100ms
 */
const delay = (response, time) => () => $$.delay(time || Math.random() * 100).then(() => response);

// Wrapping back data when simulating data
const toSuccess = (response, time) => {
  if (time) {
    return delay(config.mock.toSuccess(response), time);
  }
  return config.mock.toSuccess(response);

};
const toError = (message, time) => {
  if (time) {
    return delay(config.mock.toError(message), time);
  }
  return config.mock.toError(message);

};

export default (...mocks) => {
  /**
   * Configuration if not intercepted directly to the native fetch method
   */

  fetchMock.config = {
    ...fetchMock.config,
    fallbackToNetwork: true,
    warnOnFallback: false
  };

  mocks.forEach(mockFile => {
    let mockAPIs = {};
    if ($$.isFunction(mockFile)) {
      mockAPIs = mockFile({ fetchMock, delay, mock, toSuccess, toError });
    } else if ($$.isObject(mockFile)) {
      mockAPIs = mockFile;
    } else {
      throw new Error('mock file require both Function or Object');
    }

    for (const key in mockAPIs) {
      if (Object.prototype.hasOwnProperty.call(mockAPIs, key)) {
        const methodUrl = key.split(' ');

        // 'GET /api/getUserInfo'
        let method = 'mock';
        let url = '';
        if (methodUrl.length === 2) {
          [method, url] = methodUrl;
          method = method.toLowerCase();
        } else {
          [url] = methodUrl;
        }

        // Handling the regular situation, that is, the beginning of the url with regexp:
        if (url.indexOf('regexp:') === 0) {
          url = new RegExp(url.substring(7));
        }

        /**
         * If you want to respond to the parameters of the request, return different data, such as turning pages
         * When parsing the number of pages in the body, or querying the conditions, back to the corresponding data,
         * At this time, you can write the mock as a function, and you will receive the fetch when you send it.
         * options as arguments fetch(url, options)
         */
        if ($$.isFunction(mockAPIs[key])) {
          fetchMock[method](url, (link, options) =>
            mockAPIs[key]({ url: link, ...options })
          );
        } else {
          fetchMock[method](url, mockAPIs[key]);
        }
      }
    }
  });
};

export { mock };
