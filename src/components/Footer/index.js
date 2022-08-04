import './style/index.less';
import React from 'react';
import PropTypes from 'prop-types';
import { Typography } from 'antd';
import intl from "react-intl-universal";
import messages from './messages';

const { Title, Paragraph } = Typography;

const Footer = ({ className }) => (
  <div className={className}>
    <Paragraph className='footer-content'>ACT Software - Hotline: 0977.853.869</Paragraph>
  </div>
);

Footer.propTypes = {
  className: PropTypes.string,
};

Footer.defaultProps = {
  className: 'component-footer',
};

export default Footer;
