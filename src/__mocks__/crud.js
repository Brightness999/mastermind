/**
 * Simulate CRUD data
 */
export default ({fetchMock, delay, mock, toSuccess, toError}) => ({
  // Table with pagination
  '/api/crud/getList': (options) => {
    const body = JSON.parse(options.body);
    const {currentPage} = body;
    const idbase = (currentPage - 1) * 10 + 1;
    const {paramMap} = body;
    const {deptName} = paramMap;

    return toSuccess(mock({
      'currentPage': currentPage,
      'showCount': body.showCount,
      'totalResult': 100,
      'totalPage': 10,
      [`dataList|${body.showCount}`]: [{
        'id|+1': idbase,
        'deptName': deptName || '@word(3, 5)',
        'distributionNetwork|1': ['0', '1'],
        'address': '@county()',
        'type': '@word(3)',
        'planBeginTime': '@date',
        'planEndTime': '@date',
        'workEmployee|1-3': [{
          'key|+1': 1,
          'title': '@name',
        }],
        'content': '@sentence',
      }],
    }), 400)
  },
  '/api/crud/bathDelete': (options) => toSuccess({options}, 400),
  '/api/crud/getWorkEmployee': (options) => mock({
    'status': true,
    'data|10': [{
      'key|+1': 1,
      'title': '@name',
    }]
  }),
  '/api/crud/save': (options) => toSuccess({options}, 800),
})
