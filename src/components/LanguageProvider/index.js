import React from "react";
import {ConfigProvider} from "antd";
import intl from 'react-intl-universal';
import {connect} from "dva";
import PropTypes from "prop-types";

import {translationMessages, localeAntd} from '../../i18n'

@connect(({global}) => ({global}))
class BasicLayout extends React.PureComponent {

  render() {
    const {locale} = this.props.global;
    intl.init({
      currentLocale: locale, // TODO: determine locale here
      locales: translationMessages,
    });
    return (
      <ConfigProvider locale={localeAntd[locale]}>
        {React.Children.only(this.props.children)}
      </ConfigProvider>
    )
  }
}


BasicLayout.propTypes = {
  global: PropTypes.object,
  children: PropTypes.any.isRequired,
};

BasicLayout.defaultProps = {
};

export default BasicLayout;
