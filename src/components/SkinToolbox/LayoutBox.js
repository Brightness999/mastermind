import React from 'react';
import intl from "react-intl-universal";
import PropTypes from 'prop-types';
import { Checkbox } from 'antd';
import messages from './messages';
const CheckGroup = Checkbox.Group;

/**
 * Several common layouts
 */
const LayoutBox =  ({ theme, onChange }) => (
  <CheckGroup onChange={onChange} value={theme.layout}>
    <Checkbox className="fixedHeader" value="fixedHeader">
      {intl.formatMessage(messages.Fixedhead)}
    </Checkbox>
    <Checkbox className="fixedSidebar" value="fixedSidebar">
      {intl.formatMessage(messages.Fixedsidebar)}
    </Checkbox>
    <Checkbox className="tabLayout" value="tabLayout">
      {intl.formatMessage(messages.Labelmode)}
    </Checkbox>
    <Checkbox className="fixedBreadcrumbs" value="fixedBreadcrumbs">
      {intl.formatMessage(messages.Fixedbreadcrumbs)}
    </Checkbox>
    <Checkbox className="hidedBreadcrumbs" value="hidedBreadcrumbs">
      {intl.formatMessage(messages.Hidebreadcrumbs)}
    </Checkbox>
  </CheckGroup>
);

LayoutBox.propTypes = {
  theme: PropTypes.object,
  onChange: PropTypes.func
};

export default LayoutBox;
