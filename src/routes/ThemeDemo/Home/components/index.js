import React from 'react';
import { connect } from 'dva';
import { Layout, Row, Col, Typography, Rate, Form, Input, Button} from 'antd';
import {
  MobileOutlined,
  RocketOutlined,
  BlockOutlined,
  LeftOutlined,
  RightOutlined,
  FormOutlined,
  ScissorOutlined,
  RiseOutlined,
  GoldOutlined,
  BulbOutlined,
  CloudDownloadOutlined,
  LikeOutlined
} from '@ant-design/icons';
import Slider from "react-slick";
import './index.less';
const { Content } = Layout;
const { Paragraph } = Typography;
@connect()
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
  }
  next() {
    this.slider.slickNext();
  }
  previous() {
    this.slider.slickPrev();
  }
 
  render() {
    
    const settings = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1
    };
    const feedbackSlide = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 2,
      slidesToScroll: 1,
      autoplay: true,
    };
    const aluminum = {
      dots: false,
      infinite: true,
      speed: 500,
      slidesToShow: 5,
      swipeToSlide: true,
      responsive: [
        {
          breakpoint: 991,
          settings: {
            slidesToShow: 4,
            infinite: true,
            dots: true
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 3,
            initialSlide: 2
          }
        },
        {
          breakpoint: 576,
          settings: {
            slidesToShow: 2,
          }
        }
      ]
    };
    const feedback = [
      {
        name: 'Anh Hùng',
        img: '../images/feedback/m1.png',
        address: 'Ninh Bình',
        fb: 'Phần mềm quá tuyệt vời, nó giúp tôi không phải đau đầu tính toán các kích thước cắt, mong ACT cập nhật thêm nhiều tính năng mới'
      },
      {
        name: 'Anh Hoàng',
        img: '../images/feedback/m2.png',
        address: 'Quảng Trị',
        fb: 'Một phần mềm quá hữa ích cho anh em nhôm kính như chúng tôi, làm nhôm kính mà không sử dụng thì thật là thiệt thòi. Thật tiện ích.'
      },
      {
        name: 'Chị Thảo',
        address: 'Hà Nội',
        img: '../images/feedback/m3.png',
        fb: 'Thật là tiện dụng, dùng trên điện thoại lúc nào cũng được, tính toán quá chính xác, mong ACT cập nhật thêm nhiều tính năng mới'
      },
    ];
    const listAlu= [
      // 'http://phanmemcua.com/uploads/alu_img/alu1553010606830.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1553220866533.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1600047158430.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1560509032391.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1555247869439.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1555463933871.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1555641665048.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1561287267302.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1564966863430.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1564966882983.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1568021269043.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1589620931963.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1578045405945.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1562574277067.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1589621324522.png',
      // 'http://phanmemcua.com/uploads/alu_img/alu1589621116864.png',
      'http://phanmemcua.com/uploads/alu_img/alu1584541730802.png',
      'http://phanmemcua.com/uploads/alu_img/alu1585220986368.png',
      'http://phanmemcua.com/uploads/alu_img/alu1596790293389.png',
      'http://phanmemcua.com/uploads/alu_img/alu1598753733653.png',
      'http://phanmemcua.com/uploads/alu_img/alu1601258003089.png',
      'http://phanmemcua.com/uploads/alu_img/alu1601633786269.png',
      'http://phanmemcua.com/uploads/alu_img/alu1603420777028.png',
      'http://phanmemcua.com/uploads/alu_img/alu1603420794760.png',
      'http://phanmemcua.com/uploads/alu_img/alu1604112859701.png',
      'http://phanmemcua.com/uploads/alu_img/alu1604543657637.png',
    ]
   
    return (
      <Layout className="full-layout page homeone-page">
        <Content>
          <div id={`#top`}>
            <div className="banner-area banner-area4 relative">
              <div className="first-circle">
                <div className="second-circle">
                  <div className="third-circle"></div>
                </div>
              </div>
              <div className="container">
                <Row gutter={30} className="justify-content-center fitscreen">
                  <Col lg={10} md={10} sm={24} className="relative d-md-flex align-items-md-center hidden-sm-down">
                    <img src="../images/ai1.png" alt="" className="img-fluid iphone-img" />
                    <div className="div-qr">
                      <img src="../images/qr1.png" alt="" className="img-fluid qr" />
                      <a href="http://onelink.to/ppfgn7" className="btn-first color-4 mr-2 text-center btn-phone">Tải trên điện thoại</a>
                      <p className="p-qr">(hoặc dùng camera điện thoại để quét)</p>
                      <a href="http://phanmemcua.com:3009/login" className="btn-first color-4 mt-2 text-center btn-web">Dùng bản web trên máy tính</a>
                    </div>
                  </Col>
                  <Col lg={14} md={14} sm={24} className="d-flex align-items-center">
                    <div className="banner-right-content ">
                      <Paragraph className='text-h1'>ACT - Phần mềm sản xuất cửa trên điện thoại và PC hàng đầu cho người Việt!</Paragraph>
                      <Paragraph className='text-p'>
                        ACT là doanh nghiệp tiên phong trong lĩnh vực cung cấp phần mềm, ứng dụng gia công, sản xuất cửa nhôm,
                        cửa nhựa
                      </Paragraph>
                      <Paragraph className='text-p'>
                        Với sứ mệnh mang đến cho khách hàng những phần mềm, áp dụng công nghệ vào sản xuất từ đó giúp tiết
                        kiệm chi phí, tăng năng suất trong công việc
                      </Paragraph>
                      <Paragraph className='text-p'>Đăng kí dùng thử miễn phí 10 ngày!</Paragraph>
                    
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          <div className="section-115 beautiful-feture">
            <div className="container">
              <div className="section-head-icon text-center">
                <img src="../images/icon/s-head-icon.png" alt="" />
                  <Paragraph className="text-h2">Tại sao nên sử dụng phần mềm ACT?</Paragraph>
              </div>
              <Row gutter={30} className="mt-70">
                <Col lg={8} md={24}>
                  <div className="single-feture">
                    <MobileOutlined />
                    <Paragraph className='text-h4'>Đơn giản và dễ dùng</Paragraph>
                    <Paragraph className='text-p'>
                      Bạn chỉ cần 5 phút để làm quen và bắt đầu sử dụng phần mềm. Giao diện đơn giản, thân thiện, thông minh
                      giúp bạn triển khai sản xuất cửa thật dễ dàng và nhanh chóng
                    </Paragraph>
                    <a href="https://www.facebook.com/phanmemsanxuatcua" className="btn-first color-4a mt-20" style={{textTransform: 'none'}}>Tìm hiểu thêm</a>
                  </div>
                </Col>
                <Col lg={8} md={24}>
                  <div className="single-feture">
                    <RocketOutlined />
                    <Paragraph className='text-h4'>Tiết kiệm chi phí nhất</Paragraph>
                    <Paragraph className='text-p'>
                      Phần mềm giúp tiết kiệm thời gian tính toán đau đầu cho các chủ cơ sở sản xuất nhôm kính, nhựa; giúp
                      tính vật tư một cách chính xác, không sai hỏng do tính nhầm. Đặc biệt miễn phí cài đặt, nâng cấp và hỗ
                      trợ. Rẻ hơn một ly trà đá, chỉ với 2.000 đồng/ ngày, bạn đã có thể áp dụng công nghệ vào sản xuất cửa.
                    </Paragraph>
                    <a href="https://www.facebook.com/phanmemsanxuatcua" className="btn-first color-4a mt-20" style={{textTransform: 'none'}}>Tìm hiểu thêm</a>
                  </div>
                </Col>
                <Col lg={8} md={24}>
                  <div className="single-feture">
                    <BlockOutlined />
                    <Paragraph className='text-h4'>Phù hợp cho nhiều hệ cửa</Paragraph>
                    <Paragraph className='text-p'>
                      Cùng với các chuyên gia ngành cửa nhiều kinh nghiệm chúng tôi nghiên cứu thiết kế phần mềm phù hợp cho
                      nhiều hệ cửa khác nhau và không ngừng cập nhật thêm nhiều hệ cửa mới
                    </Paragraph>
                    <a href="https://www.facebook.com/phanmemsanxuatcua" className="btn-first color-4a mt-20" style={{textTransform: 'none'}}>Tìm hiểu thêm</a>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <div className="ultimate-interface relative d-flex align-items-center no-flex-xs">
            <div className="overlay overlay-bg"></div>
            <div className="container">
              <Row gutter={30}>
                <Col lg={12} md={10} sm={24}>
                  <div className="everyone-content">
                    <Paragraph className="line-head">
                      ACT - Phần mềm sản xuất cửa trên điện thoại và PC
                    </Paragraph>
                    <Paragraph className='text-p'>
                      ACT là doanh nghiệp tiên phong trong lĩnh vực cung cấp phần mềm, ứng dụng gia công, sản xuất cửa nhôm
                      cửa nhựa, ứng dụng ra đời giúp tiết kiệm thời gian tính toán kích thước cắt cho từng bộ cửa, tính chính
                      xác các kích thước cắt các thanh nhôm, nhựa, kính. Hạn chế sai hỏng do việc nhầm lẫn, tính sai.
                    </Paragraph>
                  </div>
                  <div>
                  <button className="button-slide mr-5" onClick={this.previous}>
                    <LeftOutlined/>
                  </button>
                  <button className="button-slide" onClick={this.next}>
                    <RightOutlined/>
                  </button>
                  </div>
                </Col>
                <Col lg={12} md={14} sm={24} className="d-mobile">
                  <div className="xs-mobile-area d-md-none d-mobile slide-mobile">
                    <Slider ref={c => (this.slider = c)} {...settings}>
                      <div key={1}>
                        <img src="../images/slides/m11.jpg" alt="" className="item-screen" />
                      </div>
                      <div key={2}>
                        <img src="../images/slides/m22.jpg" alt="" className="item-screen" />
                      </div>
                      <div key={3}>
                        <img src="../images/slides/m33.jpg" alt="" className="item-screen" />
                      </div>
                      <div key={4}>
                        <img src="../images/slides/m11.jpg" alt="" className="item-screen" />
                      </div>
                      <div key={5}>
                        <img src="../images/slides/m22.jpg" alt="" className="item-screen" />
                      </div>
                      <div key={6}>
                        <img src="../images/slides/m33.jpg" alt="" className="item-screen" />
                      </div>
                    </Slider>
                  </div>
                </Col>
              </Row>
            </div>
            <div className="right-mobile-area d-none d-md-block d-mobile">
              <img src="../images/phone-body.png" alt="" className="mobile-body" />
              <div className="active-mobile-carousel">
                <Slider ref={c => (this.slider = c)} {...settings}>
                  <div key={1}>
                    <img src="../images/slides/m11.jpg" alt="" className="item-screen" />
                  </div>
                  <div key={2}>
                    <img src="../images/slides/m22.jpg" alt="" className="item-screen" />
                  </div>
                  <div key={3}>
                    <img src="../images/slides/m33.jpg" alt="" className="item-screen" />
                  </div>
                  <div key={4}>
                    <img src="../images/slides/m11.jpg" alt="" className="item-screen" />
                  </div>
                  <div key={5}>
                    <img src="../images/slides/m22.jpg" alt="" className="item-screen" />
                  </div>
                  <div key={6}>
                    <img src="../images/slides/m33.jpg" alt="" className="item-screen" />
                  </div>
                </Slider>
              </div>
            </div>
          </div>
          <div id={`#features`} className="special-feture-video">
            <div className="container">
              <div className="section-head-icon text-center mb-50">
                <img src="../images/icon/s-head-icon.png" alt="" />
                <Paragraph className="text-h2">Tính năng của phần mềm</Paragraph>
              </div>
              <Row gutter={30}>
                <Col md={8} sm={24}>
                  <div className="single-feture color-4 d-flex">
                    <div className="icon">
                      <FormOutlined />
                    </div>
                    <div className="desc">
                      <Paragraph className='text-h5'>Chỉ cần nhập kích thước</Paragraph>
                      <Paragraph className='text-p'>
                        Người dùng chỉ cần nhập kích thước đầy đủ, phần mềm sẽ tính được kích thước cắt của thanh nhôm, nhựa
                      </Paragraph>
                    </div>
                  </div>
                </Col>
                <Col md={8} sm={24}>
                  <div className="single-feture color-4 d-flex">
                    <div className="icon">
                      <ScissorOutlined />
                    </div>
                    <div className="desc">
                      <Paragraph className='text-h5'>Kích thước chi tiết</Paragraph>
                      <p>Phần mềm có thể tính được kích thước cho từng bộ phận cửa với độ chính xác cao</p>
                    </div>
                  </div>
                </Col>
                <Col md={8} sm={24}>
                  <div className="single-feture color-4 d-flex">
                    <div className="icon">
                      <RiseOutlined />
                    </div>
                    <div className="desc">
                      <Paragraph className='text-h5'>Báo giá kịp thời và chính xác</Paragraph>
                      <Paragraph className='text-p'>Người dùng có thể xem được giá thành chi tiết từng bộ cửa, không lo báo giá sai cho khách hàng</Paragraph>
                    </div>
                  </div>
                </Col>
                <Col md={8} sm={24}>
                  <div className="single-feture color-4 d-flex">
                    <div className="icon">
                      <GoldOutlined />
                    </div>
                    <div className="desc">
                      <Paragraph className='text-h5'>Tổng hợp nhôm, kính</Paragraph>
                      <Paragraph className='text-p'>Phần mềm có thể tự tổng hợp nhôm, kính pha cắt tối ưu nhôm theo từng công trình mà người dùng yêu cầu</Paragraph>
                    </div>
                  </div>
                </Col>
                <Col md={8} sm={24}>
                  <div className="single-feture color-4 d-flex">
                    <div className="icon">
                      <BulbOutlined />
                    </div>
                    <div className="desc">
                      <Paragraph className='text-h5'>Đa dạng nhiều mẫu</Paragraph>
                      <Paragraph className='text-p'>
                        Phần mềm sẽ cung cấp đa dạng mẫu cửa cho chủ cơ sở sản xuất chọn, đặc biệt những mẫu cửa mới, và được
                        ưa chuộng nhất hiện nay.
                      </Paragraph>
                    </div>
                  </div>
                </Col>
                <Col md={8} sm={24}>
                  <div className="single-feture color-4 d-flex">
                    <div className="icon">
                      <CloudDownloadOutlined />
                    </div>
                    <div className="desc">
                      <Paragraph className='text-h5'>Gửi file bản vẽ sản xuất qua Zalo</Paragraph>
                      <Paragraph className='text-p'>
                        Người dùng chỉ cần nhập số điện thoại, phần mềm sẽ gửi file bản vẽ sản xuất qua Zalo cho người thợ
                        trực tiếp gia công
                      </Paragraph>
                    </div>
                  </div>
                </Col>
              </Row>
              <Row gutter={30} className="mt-70">
                <Col span={24}>
                  <div className="video-box video-fullwidth-4">
                    <iframe
                      src="https://www.youtube.com/embed/45bH7w1xYbQ"
                      frameborder="0"
                      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen="allowfullscreen"
                      className="iframeYoutube">
                    </iframe>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <div id={`#price`} className="section-full section-bg">
            <div className="container">
              <div className="section-head-icon text-center mb-50">
                <img src="../images/icon/s-head-icon.png" alt="" />
                <Paragraph className="text-h2">Bảng giá</Paragraph>
                {/* <p>
                  ACT sẽ bắt đầu thu phí từ ngày 20/2/2019 (tức ngày 16/1 Kỷ Hợi) để lấy kinh phí duy trì và phát triển
                  với mức phí 90k/tháng (những tài khoản chưa đóng phí sẽ bị tạm khóa)
                </p> */}
              </div>
              <Row gutter={30}>
                <Col md={8} sm={24} xs={24}>
                  <div className="single-pricing-table price-color-4 m-mb">
                    <div className="price-head">
                      <Paragraph className='text-h6'>3 tháng</Paragraph>
                    </div>
                    <div className="price relative">
                      <div className="first-circle-3">
                        <div className="second-circle">
                          <div className="third-circle"></div>
                        </div>
                      </div>
                      <div className='position-text-h3'>
                        <Paragraph className='text-h3'><sup className='text-sup1'>đ</sup>80.000<sub className='text-sup2'>/tháng</sub></Paragraph>
                      </div>
                    </div>
                    <ul className="price-item">
                      <li>Một người dùng</li>
                      <li>Nhiều lần truy cập</li>
                      <li>Hỗ trợ qua Zalo</li>
                      <li>Hỗ trợ trực tuyến 24/7</li>
                    </ul>
                    <div className="price-bottom">
                      <a href="https://www.facebook.com/phanmemsanxuatcua" className="purchase-btn">Mua ngay</a>
                    </div>
                  </div>
                </Col>
                <Col md={8} sm={24} xs={24}>
                  <div className="single-pricing-table price-color-4 center m-mb">
                    <div className="price-head">
                      <Paragraph className='text-h6'>6 tháng</Paragraph>
                    </div>
                    <div className="price relative">
                      <div className="first-circle-3">
                        <div className="second-circle">
                          <div className="third-circle"></div>
                        </div>
                      </div>
                      <div className='position-text-h3'>
                        <Paragraph className='text-h3'><sup className='text-sup1'>đ</sup>70.000<sub className='text-sup2'>/tháng</sub></Paragraph>
                      </div>
                    </div>
                    <ul className="price-item">
                      <li>Một người dùng</li>
                      <li>Nhiều lần truy cập</li>
                      <li>Hỗ trợ qua Zalo</li>
                      <li>Hỗ trợ trực tuyến 24/7</li>
                    </ul>
                    <div className="price-bottom">
                      <a href="https://www.facebook.com/phanmemsanxuatcua" className="purchase-btn">Mua ngay</a>
                    </div>
                  </div>
                </Col>
                <Col md={8} sm={24} xs={24}>
                  <div className="single-pricing-table price-color-4">
                    <div className="price-head">
                      <Paragraph className='text-h6'>1 năm</Paragraph>
                    </div>
                    <div className="price relative">
                      <div className="first-circle-3">
                        <div className="second-circle">
                          <div className="third-circle"></div>
                        </div>
                      </div>
                      <div className='position-text-h3'>
                        <Paragraph className='text-h3'><sup className='text-sup1'>đ</sup>60.000<sub className='text-sup2'>/tháng</sub></Paragraph>
                      </div>

                    </div>
                    <ul className="price-item">
                      <li>Một người dùng</li>
                      <li>Nhiều lần truy cập</li>
                      <li>Hỗ trợ qua Zalo</li>
                      <li>Hỗ trợ trực tuyến 24/7</li>
                    </ul>
                    <div className="price-bottom">
                      <a href="https://www.facebook.com/phanmemsanxuatcua" className="purchase-btn">Mua ngay</a>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          </div>
          <div id={`#reviews`} className="carousel-feedback feedback-color-4">
            <div className="container fullwidth no-padding full-carousel">
              <Row className=" d-none d-sm-flex hidden-sm-down">
                <Col md={12} sm={24}>
                  <div className="left-bg" />
                </Col>
                <Col md={12} sm={24}>
                  <div className="right-bg">
                    <div className="dislike">
                      <LikeOutlined />
                    </div>
                    <div className="like">
                      <LikeOutlined />
                    </div>
                  </div>
                </Col>
              </Row>
              <div className="container feedback-content">
                <Row gutter={30}>
                  <Col md={16} sm={24}>
                    <div className="mobile-bg color-4">
                      {/* <div className="active-feedback-carousel owl-carousel owl-theme owl-loaded owl-drag"> */}
                      <Slider {...feedbackSlide} className="active-feedback-carousel">
                       {feedback.map((item, index) => (
                          <div  key={index}>
                            <div className="item">
                              <div className="head d-flex">
                                <img src={item.img} alt="" />
                                <div className="head-title">
                                  <Paragraph className='text-h3'>{item.name }</Paragraph>
                                  <Paragraph className='text-span'>{item.address}</Paragraph>
                                </div>
                              </div>
                              <p className="feedback-text">
                                {item.fb}
                              </p>
                              <div className="reviews">
                                <Rate disabled defaultValue={5} />
                              </div>
                            </div>
                          </div>
                       ))}
                       </Slider>
                      {/* </div> */}
                    </div>
                  </Col>
                  <Col md={8} sm={24} className="d-flex justify-content-end mt-50">
                    <div className="text-right">
                      <Paragraph className="line-head2">
                        Nhận xét <br />
                        khách hàng
                      </Paragraph>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
          <div id={`#contact`} className="section-full newsletter">
            <div className="map-bg"></div>
            <div className="container">
              <Row gutter={30} className="justify-content-center align-items-center">
                <Col md={16} sm={24}>
                  <Form id="mc-form" className="newsletter-content" novalidate="true">
                    <Paragraph className='text-h1'>Theo dõi bản tin của chúng tôi</Paragraph>
                    <Paragraph className='text-p'>Cập nhật thông tin, tin tức và giao dịch</Paragraph>
                    <Form.Item
                      className="newsletter-form"
                    >
                      <Input
                        type="email"
                        pattern="[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,63}$"
                        placeholder="Nhập Email"
                        onfocus="this.placeholder = ''"
                        onblur="this.placeholder = 'Nhập Email'"
                        name="EMAIL"/>
                    </Form.Item>
                    <Form.Item>
                      <button className="btn-first color-4">
                        Theo dõi
                      </button>
                    </Form.Item>
                  </Form>
                </Col>
              </Row>
            </div>
          </div>
          <div className="section-115">
            <div className="container">
              <div className="section-head-icon text-center mb-50">
                <Paragraph className='text-h1'>Đối tác của chúng tôi</Paragraph>
                <a href="https://nhomkinhvietnam.com/">
                  <img src="../images/new_partner_nhom_kinh_vn.jpg" alt="" className='img-parner'/>
                </a>
                
              </div>
              <div className="section-head-icon text-center mb-50">
                <img src="../images/icon/s-head-icon.png" alt=""/>
                <Paragraph className='text-h2'>Đa dạng nhiều hệ cửa nhôm, nhựa</Paragraph>
              </div>
                
              <div className="brand-area mt-50">
                <div className="container">
                  <div>
                    <div className="active-brand owl-carousel owl-theme owl-loaded owl-drag">
                      <Slider {...aluminum}>
                        {listAlu.map((index) => (
                          <div className="item" key={index}>
                            <img src={index} className="item-brand"/>
                          </div>
                        ))}
                      </Slider>
                    {/* {this.state.listAlu.map((item, index) => (
                        <div className="item" key={index}>
                        <img src={'uploads/'+ item.imagePath} alt="" className="item-brand" height="250px"/>
                      </div>
                    ))} */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    );
  }
}