import { notification } from 'antd';
import $$ from 'cmn-utils';
import intl from 'react-intl-universal';

import Notification from './Notification';
import './antdNotice.less';
import messages from './messages';
const prefixCls = 'antui-notification';
const defaultConfig = {
  // duration: 4.5,
};

function notice(config, type, title) {
  if ($$.isObject(config)) {
    notification[type]({
      className: `${prefixCls} ${prefixCls}-${type}`,
      ...defaultConfig,
      ...config
    });
  } else {
    notification[type]({
      className: `${prefixCls} ${prefixCls}-${type}`,
      message: title,
      description: config,
      ...defaultConfig
    });
  }
}

export default class extends Notification {
  static success(config) {
    notice(config, 'success', intl.formatMessage(messages.success));
  }

  static error(config) {
    notice(config, 'error', intl.formatMessage(messages.error));
  }

  static info(config) {
    notice(config, 'info', intl.formatMessage(messages.prompt));
  }

  static warning(config) {
    notice(config, 'warning', intl.formatMessage(messages.warn));
  }

  static warn(config) {
    notice(config, 'warning', intl.formatMessage(messages.warn));
  }

  static close(key) {
    notification.close(key);
  }

  static destroy() {
    notification.destroy();
  }
}
