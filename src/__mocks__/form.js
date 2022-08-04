/**
 * Simulation data in the form form example
 */
export default ({ fetchMock, delay, mock, toSuccess, toError }) =>
  // Simulate the automatic completion of the back data
  ({
    '/api/form/autoComplete': options => {
      const body = JSON.parse(options.body);
      const userName = body;

      return toSuccess(
        mock({
          'list|3-10': [{
            'id': '@id',
            'name': `${userName  }@word(1, 2)`, // name
            'age|1-100': 100,                   // Random integer within 100
            'birthday': '@date("yyyy-MM-dd")',  // date
            'city': '@city(true)',              // City
            'phone': /^1[385][1-9]\d{8}/,       // phone number
            'content': '@sentence',
          }]
        }),
        400
      );
    }
  })
;
