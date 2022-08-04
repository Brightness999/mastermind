import './style/coming.less';
import React, { Component } from 'react';
import intl from "react-intl-universal";
import { Layout } from 'antd';
import moment from 'moment';
import PropTypes from 'prop-types';
import messages from './messages';
const { Content } = Layout;

/**
 * Countdown page
 * <Coming
     title="Wonderful upcoming"
     value={Date.now() + 1000 * 60 * 60 * 24 * 2}
   />
 */
class Coming extends Component {
  constructor(props) {
    super(props);
    this.state = {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00'
    };
  }

  countdownId = null;

  componentDidMount() {
    this.syncTimer();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.syncTimer();
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  syncTimer = () => {
    const { value } = this.props;

    const timestamp = moment(value).valueOf();
    if (timestamp >= Date.now()) {
      this.startTimer();
    } else {
      this.stopTimer();
    }
  };

  startTimer = () => {
    const { value } = this.props;

    if (this.countdownId) return;

    this.countdownId = window.setInterval(() => this.parseTime(value), 500);
  };

  stopTimer = () => {
    clearInterval(this.countdownId);
    this.countdownId = null;
  };

  parseTime = value => {
    const target = moment(value);
    const current = moment();
    const diffTime = Math.max(target - current, 0);
    const duration = moment.duration(diffTime, 'milliseconds');

    this.setState({
      days: formatDoubleStr(duration.days()),
      hours: formatDoubleStr(duration.hours()),
      minutes: formatDoubleStr(duration.minutes()),
      seconds: formatDoubleStr(duration.seconds())
    });
  };

  render() {
    const { title } = this.props;
    const { days, hours, minutes, seconds } = this.state;
    return (
      <Layout className="full-layout coming-soon-page">
        <Content>
          <div id="wrapper">
            <div className="place-balk-workers">
              <div className="balk-workers" />
              <div className="saw" />
              <div className="balk" />
            </div>
            <div className="title">{title}</div>
            <div className="watch">
              <div className="dash days_dash">
                <div className="digit">{days}</div>
                <span className="dash-title">{intl.formatMessage(messages.days)}</span>
              </div>
              <div className="dash hours_dash">
                <div className="digit">{hours}</div>
                <span className="dash-title">{intl.formatMessage(messages.hours)}</span>
              </div>
              <div className="dash minutes_dash">
                <div className="digit">{minutes}</div>
                <span className="dash-title">{intl.formatMessage(messages.minutes)}</span>
              </div>
              <div className="dash seconds_dash">
                <div className="digit">{seconds}</div>
                <span className="dash-title">{intl.formatMessage(messages.seconds)}</span>
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }
}

Coming.propTypes = {
  value: PropTypes.number,
  title: PropTypes.string,
};

export default Coming;

function formatDoubleStr(number) {
  return number < 10 ? `0${  number}` : number;
}
