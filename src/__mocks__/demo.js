/**
 * Analog request data
 * @param {FetchMock} fetchMock When the existing conditions are not met, you can use fetchMock to extend
 * @param {function} delay Increase the delay time ms Example: delay(mockData) or delay(mockData, 200)
 * @param {function} mock Use mock to generate data, for example:

   mock({
     'string|1-10': '★' // Generate at least 1 and up to 10 star characters
   })

   // {'string': '★★★★★★'}

 More usage reference http://mockjs.com/examples.html
 */
export default ({fetchMock, delay, mock, toSuccess, toError}) =>
// If the existing extension does not meet the requirements, you can use the fetchMock method directly.
// fetchMock.mock(/httpbin.org\/post/, {/* response */}, {/* options */});

  ({
    // Support method header
    'GET /api/getUserInfo': {
      name: 'Light rain',
      sex: 'male',
      age: 18,
    },
    // Simulate real request delay effects
    '/api/getUsers': delay([
      { name: 'jonn' },
      { name: 'weiq' },
    ]),
    // Match regexp
    'regexp:/api/aaa/.*': {},
    // Match a url beginning with a string
    'begin:http://www.site.com': {},
    // Match a url ending with a string
    'end:.jpg': {},
    // Match a url using a glob pattern
    'glob:http://*.*': {},
    // Match a url that satisfies an express style path
    'express:/user/:user': {},
    // The table is paginated, written as a function form can use the request parameters,
    // More realistic analog back-end data processing business
    '/api/userInfo/getList': (options) => {
      const body = JSON.parse(options.body);
      const {pageNum} = body;
      const idbase = (pageNum - 1) * 10 + 1;
      return toSuccess(mock({
        'pageNum': pageNum,
        'pageSize': 10,
        'size': 10,
        'total': 100,
        'totalPages': 10,
        'list|10': [{
          'id|+1': idbase,
          'name': '@name',                    // name
          'age|1-100': 100,                   // Random integer within 100
          'birthday': '@date("yyyy-MM-dd")',  // date
          'city': '@city(true)',              // city
          'phone': /^1[385][1-9]\d{8}/        // phone number
        }],
      }), 400)
    }
  })
