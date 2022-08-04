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
// export default ({fetchMock, delay, mock, toSuccess, toError}) =>
// If the existing extension does not meet the requirements, you can use the fetchMock method directly.
// fetchMock.mock(/httpbin.org\/post/, {/* response */}, {/* options */});

  // ({
  //   '/api/user/login': (options) => {
  //     if (options.body) {
  //       const user = JSON.parse(options.body);
  //       if (user.userName === 'admin' && user.password === 'admin') {
  //         return toSuccess(mock({
  //           'userName': 'admin',                // username
  //           'name': '@name',                    // name
  //           'age|1-100': 100,                   // Random integer within 100
  //           'birthday': '@date("yyyy-MM-dd")',  // date
  //           'city': '@city(true)',              // China city
  //           'phone': /^1[385][1-9]\d{8}/,       // phone number
  //           'token': '@guid'                    // token
  //         }), 400);
  //       }
  //       return toError('wrong user name or password admin/admin');
  //
  //     }
  //     return toError('Please enter your username and password');
  //
  //   },
  //   '/api/user/register': options => toSuccess(),
  // })
