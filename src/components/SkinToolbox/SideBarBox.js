import React from 'react';
import { Radio, Tag } from 'antd';
import PropTypes from 'prop-types';
const RadioGroup = Radio.Group;

const SideBarBox = ({ theme, onChange }) => (
  <RadioGroup
    onChange={onChange}
    value={theme.leftSide}
  >
    <Radio className="darkgrey" value="darkgrey">
      <Tag color="#30363e">darkgrey</Tag>
    </Radio>
    <Radio className="grey" value="grey">
      <Tag color="#aaa">grey</Tag>
    </Radio>
    <Radio className="dark" value="dark">
      <Tag color="#001529">dark</Tag>
    </Radio>
    <Radio className="light" value="light">
      <Tag color="#efefef" style={{ color: '#666', }}>
        light
      </Tag>
    </Radio>
  </RadioGroup>
);

SideBarBox.propTypes = {
  theme: PropTypes.object,
  onChange: PropTypes.func
};

export default SideBarBox;
