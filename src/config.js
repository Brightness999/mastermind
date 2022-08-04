import React from 'react';
import store from 'cmn-utils/lib/store';
import PageLoading from './components/Loading/PageLoading';
import { normal } from './components/Notification';

// System notification, define what style of notification to use, normal or antdNotice
const notice = normal;

/**
 * Application configuration such as request format, reverse format, exception handling, paging format, etc.
 */
export default {
  /**
   * HTML title template
   */
  htmlTitle: 'HMGH - {title}',

  /**
   * system notification
   */
  notice,

  // Asynchronous request configuration
  request: {
    prefix: '/api',

    // Each time the request header takes these parameters
    withHeaders: () => ({
      token: store.getStore("token"),
    }),

    /**
     * Because modelEnhance needs to know the data returned by the server,
     * What is success and what is failure, such as
     * {status: true, data: ...} // represents success
     * {status: false, messages: ...} // represents failure
     * In practice, the response should be reversed by the server.
     * Success failure flag to distinguish
     */
    afterResponse: response => {
      const { status, message } = response;
      if (status) {
        return response;
      }
      throw new Error(message);

    },
    errorHandle: err => {
      // Request error global interception
      if (err.name === 'RequestError') {
        notice.error(err.text || err.message);
      }
    }
  },

  // Global exception
  exception: {
    global: (err) => {
      const errName = err.name;
      // RequestError is an interception request exception
      if (errName === 'RequestError') {
        notice.error(err.message);
        // console.error(err);
      } else {
        // console.error(err);
      }
    },
  },

  // Paging assistant
  pageHelper: {
    // Format the data to be sent to the backend
    requestFormat: pageInfo => {
      const { pageNum, pageSize, filters, sorts } = pageInfo;
      return {
        currentPage: pageNum,
        showCount: pageSize,
        sortMap: sorts,
        paramMap: filters
      };
    },

    // Format data back from the backend
    responseFormat: resp => {
      const {
        currentPage,
        showCount,
        totalResult,
        dataList,
        totalPage
      } = resp.data;
      return {
        pageNum: currentPage,
        pageSize: showCount,
        total: totalResult,
        totalPages: totalPage,
        list: dataList
      };
    }
  },

  // Route loading effect
  router: {
    loading: <PageLoading loading />
  },

  /**
   * Wrapping back data when simulating data
   * Because, when the backend returns data, it will generally wrap a layer of state information outside.
   * If successful:
   * {
   *   status: true,
   *   data: responseData
   * }
   * or when an error occurs：
   * {
   *   status: false,
   *   code: 500,
   *   messages: 'The username or password is incorrect'
   * }
   * Here is the configuration of these two functions, in order to simulate data, we can write a few lines of code orz...
   */
  mock: {
    toSuccess: response => ({
      status: true,
      data: response
    }),

    toError: message => ({
      status: false,
      message
    })
  }
};
