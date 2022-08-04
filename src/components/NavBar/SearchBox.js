import React, { PureComponent } from 'react';
import intl from 'react-intl-universal';
import PropTypes from 'prop-types';
import { Radio } from 'antd';
import {SearchOutlined} from '@ant-design/icons'
import Mask from '../Mask';
import messages from './messages';
const RadioGroup = Radio.Group;

/**
 * Full screen search
 */
class SearchBox extends PureComponent {
  render() {
    const { visible, onClose} = this.props;
    return (
      <Mask visible={visible} onClose={onClose} className="search-box" closable>
        <div className="search-box-input">
          <input ref={node => { this.node = node }} type="text" placeholder={intl.formatMessage(messages.searchFor)} />
          <a className="search-box-btn"><SearchOutlined /></a>
        </div>
        <div className="search-box-content">
          <RadioGroup name="radioGroup" defaultValue={1}>
            <Radio value={1}> {intl.formatMessage(messages.user)}</Radio>
            <Radio value={2}> {intl.formatMessage(messages.department)}</Radio>
            <Radio value={3}> {intl.formatMessage(messages.article)}</Radio>
            <Radio value={4}> {intl.formatMessage(messages.all)}</Radio>
          </RadioGroup>
        </div>
      </Mask>
    );
  }
}

SearchBox.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default SearchBox;
