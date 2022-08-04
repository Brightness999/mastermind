import React from 'react';
import { Radio, Tag } from 'antd';
import PropTypes from 'prop-types';
const RadioGroup = Radio.Group;

const NavBarBox = ({ theme, onChange }) => (
  <RadioGroup
    onChange={onChange}
    value={theme.navbar}
  >
    <Radio className="primary" value="primary">
      <Tag color="#1890ff">primary</Tag>
    </Radio>
    <Radio className="light" value="light">
      <Tag color="#b9b9b9">light</Tag>
    </Radio>
    <Radio className="info" value="info">
      <Tag color="#00bcd4">info</Tag>
    </Radio>
    <Radio className="warning" value="warning">
      <Tag color="#ffc107">warning</Tag>
    </Radio>
    <Radio className="danger" value="danger">
      <Tag color="#f44336">danger</Tag>
    </Radio>
    <Radio className="alert" value="alert">
      <Tag color="#a992e2">alert</Tag>
    </Radio>
    <Radio className="system" value="system">
      <Tag color="#48c9a9">system</Tag>
    </Radio>
    <Radio className="success" value="success">
      <Tag color="#85d27a">success</Tag>
    </Radio>
    <Radio className="grey" value="grey">
      <Tag color="#30363e">grey</Tag>
    </Radio>
    <Radio className="dark" value="dark">
      <Tag color="#001529">dark</Tag>
    </Radio>
  </RadioGroup>
);

NavBarBox.propTypes = {
  theme: PropTypes.object,
  onChange: PropTypes.func,
};

export default NavBarBox;
