import './style/index.less';
import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import { Typography, Layout, Input, Menu, Col, Row } from 'antd';
import {Link} from 'dva/router';
const { SubMenu } = Menu;
import { MenuOutlined, FacebookOutlined, TwitterOutlined, YoutubeOutlined, GooglePlusOutlined, CloseOutlined } from '@ant-design/icons';
const { Content} = Layout;
const { Title, Paragraph, Text } = Typography;

class ThemeHeader extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      isShowMenuMobile: false,
      myclass: '',
    }
  }
  onMenuMobile = () => {
    this.setState({isShowMenuMobile: !this.state.isShowMenuMobile});
    if (this.state.myclass === '') {
      this.setState({
       myclass: 'open-menubar'
      })
     }
    else {
     this.setState({
       myclass: '',
     })
    }
  }
  render() {
    const {isShowMenuMobile} = this.state;
    return(
      <Content className='component-themeheader'>
        <div className='default-header header-4 header-4a scrolled'>
          <div className="total-header-area">
            <div className="container">
              <Row gutter={30} justify="center" align="middle">
                <Col lg={6} md={8} sm={16}>
                  <div className="logo logo-edit">
                    <a href="#">
                      <img src="../images/logoAct.png" alt="logo" style={{width: 75}}/>
                      <Text className="text-act"><Text>ACT</Text></Text>
                    </a>
                  </div>
                  <Paragraph className="text-logo">Nhanh-Tiện dụng-Chính xác</Paragraph>
                </Col>
                <Col lg={18} md={16} sm={8}>
                  <div className="d-flex right-header justify-content-end">
                    <div className="main-menu">
                      <ul className="d-flex">
                        <li><Link to={`#top`}>Giới thiệu</Link></li>
                        <li><Link to={`#features`} >Tính năng</Link></li>
                        <li><Link to={`#price`} >Thu phí</Link></li>
                        <li><Link to={`#reviews`} >Nhận xét</Link></li>
                        <li><Link to={`#contact`}>Liên hệ̣</Link></li>
                      </ul>
                    </div>
                    <a 
                      href="#" 
                      className = {
                        isShowMenuMobile ? 
                        'menu-btn toggle-btn color-4 color-4-hover' : 
                        'menu-btn toggle-btn color-4'
                      } 
                      onClick={this.onMenuMobile}
                    >
                      {isShowMenuMobile ? <CloseOutlined /> : <MenuOutlined />}
                    </a>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          {/* {isShowMenuMobile ?  */}
            <div id='menu-right' className={this.state.myclass}>
              <div className='nav-menu'> 
                <ul className="color-4">
                  <li><Link to={`#top`}>Giới thiệu</Link></li>
                  <li><Link to={`#features`}>Tính năng</Link></li>
                  <li><Link to={`#price`}>Thu phí</Link></li>
                  <li><Link to={`#reviews`}>Nhận xét</Link></li>
                  <li><Link to={`#contact`}>Liên hệ</Link></li>
                </ul>
              </div>
              <div className="menu-contact">
                <div className="email">
                  <a href="mailto:ungdungact@gmail.com">ungdungact@gmail.com</a> <br />
                  <a href="tel:+0977853869">+0977853869</a>
                </div>
                <div className="social-contact color-4 d-flex justify-content-center">
                  <a href="https://www.facebook.com/phanmemsanxuatcua"><FacebookOutlined /></a>
                  <a href="#"><TwitterOutlined /></a>
                  <a href="https://www.youtube.com/watch?v=45bH7w1xYbQ"><YoutubeOutlined /></a>
                  <a href="#"><GooglePlusOutlined /></a>
                </div>
              </div>
            </div>
            {/* : null
          } */}
        </div>
      </Content>
    );
  }
}

ThemeHeader.propTypes = {
  className: PropTypes.string,
};

ThemeHeader.defaultProps = {
  className: 'component-themeheader',
};

export default ThemeHeader;
