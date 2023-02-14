import React from 'react';
import './PageLoading.less'
import PropTypes from 'prop-types';

/**
 * Loading effect example
 */
const PageLoading = ({ loading, style = 'style1', isBackground = false }) =>
  loading ? <div className={`${isBackground ? 'loading-spinner-background' : ''}`}><div className={`loading-spinner loading-spinner-${style}`} /></div> : null;

PageLoading.propTypes = {
  loading: PropTypes.bool,
  style: PropTypes.string
};

export default PageLoading;
