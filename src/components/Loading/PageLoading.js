import React from 'react';
import './PageLoading.less'
import PropTypes from 'prop-types';

/**
 * Loading effect example
 */
const PageLoading = ({loading, style = 'style1'}) =>
  loading ? <div className={`loading-spinner loading-spinner-${style}`} /> : null;

PageLoading.propTypes = {
  loading: PropTypes.bool,
  style: PropTypes.string
};

export default PageLoading;
