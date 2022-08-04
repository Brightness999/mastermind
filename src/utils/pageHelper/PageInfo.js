import $$ from 'cmn-utils';
// eslint-disable-next-line import/no-cycle
import PageHelper from './index';
/**
 * Paging object
 */
export default class PageInfo {
  // Page number, starting from 1
  pageNum = 1;

  // Number of pages per page
  pageSize = 10;

  // Current page number
  size = 0;

  // Total
  total = 0;

  // Total pages
  totalPages = 0;

  // Result set
  list = [];

  // Filter condition {name: 'jonn'}
  filters = {};

  // Sorting condition {name: 'asc', age: 'desc'}
  sorts = {};

  /**
   * The number of pages that the user is expected to enter is not in the legal range (from the first page to the last page)
   * When you are able to respond correctly to the correct result page, then you can configure reasonable to true.
   * At this time, if pageNum<1, the first page will be queried. If pageNum> total number of pages, the last page will be queried.
   */
  reasonable = false;

  /**
   * Assembly paging information
   * @param {number} pageNum page number, default 1
   * @param {number} pageSize page size, default 10
   */
  startPage(pageNum = 1, pageSize = 10) {
    this.pageNum = pageNum;
    this.pageSize = pageSize;
    this.size = 0;
    this.total = 0;
    this.totalPages = 0;
    this.list = [];
    this.filters = {};
    this.sorts = {};
    return this;
  }

  /**
   * Assembly paging information
   * @param {number} pageNum page number
   * @param {number} pageSize page size
   */
  jumpPage(pageNum, pageSize) {
    if ((pageNum && pageNum <= Math.ceil(this.totalPages)) || pageNum === 1) {
      this.pageNum = pageNum;
      if (pageSize) this.pageSize = pageSize;
    }
    return this;
  }

  /**
   * Stitching filter condition
   * @param {object} q Filter condition {name: 'jonn', sex: 1}
   * @param {boolean} merge Whether to merge new conditions with existing conditions
   */
  filter(q, merge) {
    if ($$.isObject(q)) {
      if (merge) {
        this.filters = {...this.filters, ...q};
      } else {
        this.filters = q;
      }
    }
    return this;
  }

  /**
   * Stitching sorting condition
   * @param {object} q Sort field {name: 'asc', age: 'desc'}
   */
  sortBy(q) {
    if ($$.isObject(q)) {
      this.sorts = q;
    }
    return this;
  }

  /**
   * Next page or specified page number
   * @param {number} pageNum
   */
  nextPage(pageNum) {
    if (this.totalPages !== -1) {
      if (pageNum && pageNum <= Math.ceil(this.totalPages)) {
        this.pageNum = pageNum;
      } else if (this.pageNum + 1 <= Math.ceil(this.totalPages)) {
        this.pageNum += 1;
      }
    } else {
      this.pageNum = this.totalPages;
    }
    return this;
  }

  /**
   * Previous page
   */
  prevPage() {
    if (this.totalPages !== -1) {
      if (this.pageNum - 1 > 0) {
        this.pageNum -= 1;
      }
    } else {
      this.pageNum = 1;
    }
    return this;
  }

  // deprecate
  send(url, options) {
    const self = this;
    const { pageNum, pageSize, filters, sorts } = this;
    let data = { pageNum, pageSize, filters, sorts };

    if ($$.isFunction(PageHelper.requestFormat)) {
      data = PageHelper.requestFormat(this);
    }
    return $$.send(url, { data, ...options }).then(resp => {
      if ($$.isFunction(PageHelper.responseFormat)) {
        const newPageInfo = PageHelper.responseFormat(resp);
        return Object.assign(self, newPageInfo);
      }
      return null
    })
  }
}
