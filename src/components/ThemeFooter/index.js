import './style/index.less';
import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Layout, Row, Col } from 'antd';
import {
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined
} from '@ant-design/icons';

const { Content} = Layout;
const { Title, Paragraph, Text } = Typography;

class ThemeFooter extends React.Component {
  render() {
    return(
      <Content className='component-themefooter'>
        <div>
          <div id="footer-widget" className="section-full footer-widget">
            <div className="container">
              <Row gutter={30}>
                <Col lg={8} md={24}>
                  <div className="single-widget">
                    <Paragraph className="text-h3">Phần mềm sản xuất cửa ACT</Paragraph>
                    <Paragraph className="text-p">
                      ACT là doanh nghiệp tiên phong trong lĩnh vực cung cấp phần mềm, ứng dụng gia công, sản xuất cửa nhôm
                      cửa nhựa.
                    </Paragraph>
                  </div>
                </Col>
                <Col lg={8} md={24}>
                  <div className="single-widget">
                    <Paragraph className="text-h4">Facebook feed</Paragraph>
                    <div className="instagram-img d-flex">
                      <div className="ins-img">
                        <a className='text-link' href="https://www.facebook.com/phanmemsanxuatcua">
                          <img src="../images/m4.jpg" alt="" style={{maxWidth: '100%'}} />
                        </a>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col lg={8} md={24}>
                  <div className="single-widget">
                    <Paragraph className="text-h4">Thông tin liên hệ</Paragraph>
                    <div className="single-feed d-flex">
                      <div className="icon">
                        <EnvironmentOutlined />
                      </div>
                      <div className="msg">
                        <Paragraph className="text-p">112 - Ngõ 59 - Mễ Trì - Nam Từ Liêm - Hà Nội</Paragraph>
                      </div>
                    </div>
                    <div className="single-feed d-flex">
                      <div className="icon">
                        <PhoneOutlined />
                      </div>
                      <div className="msg mb-5">
                        <a className='text-link' href="tel:0977853869">0977853869</a>
                      </div>
                    </div>
                    <div className="single-feed d-flex">
                      <div className="icon">
                        <MailOutlined />
                      </div>
                      <div className="msg mb-5">
                        <a className='text-link' href="mailto:ungdungact@gmail.com">ungdungact@gmail.com</a>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>

          <footer className="default-footer">
            <div className="container">
              <div className="d-flex justify-content-between no-flex-xs">
                <div className="footer-copy-right">
                  <Paragraph className='title-bottom-footer'>&copy; {(new Date().getFullYear())}<span>|</span><a href="#">ACT đồng hành sản xuất cửa cùng bạn</a></Paragraph>
                </div>
                <div className="footer-social-link">
                  <a href="https://www.facebook.com/phanmemsanxuatcua"><img src="../images/logo_social/facebook.png"/></a>
                  <a href="#"><img src="../images/logo_social/twitter.png"/></a>
                  <a href="https://www.youtube.com/watch?v=45bH7w1xYbQ"><img src="../images/logo_social/youtube.png"/></a>
                  <a href="#"><img src="../images/logo_social/google.png"/></a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </Content>
    );
  }
}

export default ThemeFooter;
