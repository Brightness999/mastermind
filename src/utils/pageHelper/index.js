// eslint-disable-next-line import/no-cycle
import PageInfo from './PageInfo';
import config from '../../config';

/**
 * General paging assistant
 */
export default class PageHelper {
  static create = () => new PageInfo();

  /**
   * You can format the parameters sent to the backend by setting this function.
   *
   * For example, the parameters required for the backend paging interface are
   * {
   *    currentPage: 1,
   *    showCount: 10,
   *    paramMap: {name: 'jonn'}
   * }
   * You can format paging information by setting this parameter
   * E.g:
   * pageHelper.requestFormat(({pageNum, pageSize}) => ({
   *  currentPage: pageNum,
   *  showCount: pageSize
   * }))
  */
  static requestFormat(pageInfo) {
    return config.pageHelper.requestFormat(pageInfo);
  };


  /**
   * Format the data back from the server and place it in the PageInfo object.
   * Prepare for the next page break
   * Page number pageNum;
     Number of pages per page pageSize;
     Current page number size;
     Total total;
     Total pages totalPages;
     Result set list;
   * @param {object} resp
  */
  static responseFormat(resp) {
    return config.pageHelper.responseFormat(resp);
  }
}
