/**
 * Simulate CRUD data
 */
export default ({ mock, toSuccess }) => ({
  // Table with pagination
  '/api/datatable/getList': options => {
    const body = JSON.parse(options.body);
    const {currentPage} = body;
    const {sortMap} = body;
    const idbase = (currentPage - 1) * 10 + 1;
    let sortField = { 'age|1-100': 1 };
    if (sortMap && sortMap.age) { // Simulated sort
      let i = 60;
      sortField =
          sortMap.age === 'asc'
            ? { 'age|+1': new Array(10).fill(0).map(() => { i += 1; return i}) }
            : { 'age|+1': new Array(10).fill(0).map(() => { i -= 1; return i }) };
    }

    return toSuccess(
      mock({
        currentPage,
        showCount: body.showCount,
        totalResult: 100,
        totalPage: 10,
        [`dataList|${body.showCount}`]: [
          {
            'id|+1': idbase,
            name: '@name',
            address: '@county()',
            'role|1': ['1', '2', '3'],
            ...sortField
          }
        ]
      }),
      400
    );
  },
  // Front page paging
  '/api/datatable/frontPaging': () => toSuccess(
    mock({
      [`list|33`]: [
        {
          'id|+1': 1,
          name: '@name',
          address: '@county()',
          'age|1-100': 1,
          'role|1': ['1', '2', '3']
        }
      ]
    }),
    400
  )
});
