import React from 'react';
import { connect } from 'dva';
import { Layout, Col, Row, Typography } from 'antd';
import { UserAddOutlined, DollarCircleOutlined, TagOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import Footer from '../../../components/Footer';
import './index.less';
const { Content } = Layout;
const { Paragraph, Text } = Typography;
const Icon = ({ type, ...rest }) => {
  const icons = require(`@ant-design/icons`);
  const Component = icons[type];
  return <Component {...rest} />;

  //onst Component = require(`@ant-design/icons/${type}`).default;
  //return <Component {...rest}/>
};

class Dashboard extends React.Component {
  state = {
    intl: PropTypes.object
  };

  render() {
    return (
      <Layout className="full-layout page dashboard-page">
        <Content>
          <Row gutter={20}>
            <Col lg={15} md={24} xs={24}>
              <Row gutter={20}>
                {/* <Col span={8}>
                  <div className="div-panel-col col-small">
                    <UserAddOutlined />
                    <Paragraph className="panel-title-small">New Users</Paragraph>
                    <Paragraph className="panel-number">30</Paragraph>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="div-panel-col col-small">
                    <TagOutlined />
                    <Paragraph className="panel-title-small">New Trucker</Paragraph>
                    <Paragraph className="panel-number">30</Paragraph>
                  </div>
                </Col>
                <Col span={8}>
                  <div className="div-panel-col col-small">
                    <DollarCircleOutlined />
                    <Paragraph className="panel-title-small">Total Sale</Paragraph>
                    <Paragraph className="panel-number">$1000</Paragraph>
                  </div>
                </Col> */}
              </Row>
              <Row gutter={20}>
                {/* <Col span={24}>
                  <div className="div-panel-col col-big">
                    <Paragraph className="panel-title-big">Notification</Paragraph>
                    <div className='div-content-notifi'>
                      <div className='div-notifi'>
                        <Paragraph className='notifi-title'>Lorem Ipsum</Paragraph>
                        <Paragraph className='notifi-content'>20/12/2020&nbsp;&#9679;10:20am</Paragraph>
                        <Paragraph className='notifi-content'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, </Paragraph>
                      </div>
                      <div className='div-notifi'>
                        <Paragraph className='notifi-title'>Lorem Ipsum</Paragraph>
                        <Paragraph className='notifi-content mr-5'>25/12/2020&nbsp;&#9679;10:20am</Paragraph>
                        <Paragraph className='notifi-content'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, </Paragraph>
                      </div>
                      <div className='div-notifi'>
                        <Paragraph className='notifi-title'>Lorem Ipsum</Paragraph>
                        <Paragraph className='notifi-content mr-5'>26/12/2020&nbsp;&#9679;10:20am</Paragraph>
                        <Paragraph className='notifi-content'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, </Paragraph>
                      </div>
                    </div>
                  </div>
                </Col> */}
              </Row>
            </Col>
            <Col lg={9} md={24} xs={24}>
              {/* <div className='div-panel-col col-big'>
                <Paragraph className='panel-title-big'>New users in month</Paragraph>
                <div className='div-content-new'>
                  <div className='div-notifi'>
                    <Paragraph className='notifi-title'>Mayra Sibley</Paragraph>
                    <Paragraph className='notifi-content'>09.12.2020<Text className='notifi-content m-5'>-</Text>12:45</Paragraph>
                  </div>
                  <div className='div-notifi'>
                    <Paragraph className='notifi-title'>Mimi Carreira</Paragraph>
                    <Paragraph className='notifi-content'>10.12.2020<Text className='notifi-content m-5'>-</Text>10:20</Paragraph>
                  </div>
                  <div className='div-notifi'>
                    <Paragraph className='notifi-title'>Philip Nelms</Paragraph> 
                    <Paragraph className='notifi-content'>15.12.2020<Text className='notifi-content m-5'>-</Text>15:00</Paragraph>
                  </div>
                  <div className='div-notifi'>
                    <Paragraph className='notifi-title'>Terese Threadgill</Paragraph> 
                    <Paragraph className='notifi-content'>25.12.2020<Text className='notifi-content m-5'>-</Text>10:00</Paragraph>
                  </div>
                  <div className='div-notifi'>
                    <Paragraph className='notifi-title'>Terese Threadgill</Paragraph> 
                    <Paragraph className='notifi-content'>25.12.2020<Text className='notifi-content m-5'>-</Text>10:00</Paragraph>
                  </div>
                </div>
              </div> */}
            </Col>
          </Row>
          <Footer />
        </Content>
      </Layout>
    );
  }
}

export default Dashboard;
