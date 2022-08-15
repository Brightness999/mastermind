import React from 'react';
import { connect } from 'dva';
import { 
  Collapse,
  Badge,
  Avatar,
  Tabs,
  Dropdown,
  Menu,
  Button,
  Segmented,
  Row,
  Col,
  Checkbox,
  Select,
  message
} from 'antd';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { MdFormatAlignLeft } from 'react-icons/md';
import { BsEnvelope, BsFilter, BsXCircle, BsX, BsFillDashSquareFill, BsFillPlusSquareFill, BsClockHistory, BsFillFlagFill, BsCheckCircleFill } from 'react-icons/bs';
import { ModalNewAppointment, ModalSubsidyProgress } from '../../../components/Modal';
import CSSAnimate from '../../../components/CSSAnimate';
import DrawerDetail from '../../../components/DrawerDetail';
import DrawerDetailPost from '../../../components/DrawerDetailPost';
import intl from 'react-intl-universal';
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid' // a plugin!

import messages from '../messages';
import messagesCreateAccount from '../../Sign/CreateAccount/messages';
import './index.less';
const { Panel } = Collapse;
const { TabPane} = Tabs;
@connect()
export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        isFilter: false,
        visibleDetail: false,
        visibleDetailPost: false,
        visibleNewAppoint: false,
        visibleSubsidy: false,
    }
  }

  onShowFilter = () => {
    this.setState({ isFilter: !this.state.isFilter });
  }

  onShowDrawerDetail = () => {
    this.setState({ visibleDetail: true });
  };

  onCloseDrawerDetail = () => {
    this.setState({ visibleDetail: false });
  };

  onShowDrawerDetailPost = () => {
    this.setState({ visibleDetailPost: true });
  };

  onCloseDrawerDetailPost = () => {
    this.setState({ visibleDetailPost: false });
  };

  onShowModalNewAppoint = () => {
    this.setState({ visibleNewAppoint: true });
  };

  onCloseModalNewAppoint = () => {
    this.setState({ visibleNewAppoint: false });
  };
  onSubmitModalNewAppoint = () => {
    this.setState({ visibleNewAppoint: false });
    message.success({
      content: intl.formatMessage(messages.appointmentScheduled),
      className: 'popup-scheduled',
    });
  };
  onShowModalSubsidy = () => {
    this.setState({ visibleSubsidy: true });
  };

  onCloseModalSubsidy = () => {
    this.setState({ visibleSubsidy: false });
  };

  render() {
    const { isFilter, visibleDetail, visibleDetailPost, visibleNewAppoint, visibleSubsidy } = this.state;
    const genExtraTime = () => (
      <BsClockHistory
        size={18}
        onClick={() => {}}
      />
    );
    const genExtraFlag = () => (
      <Badge size="small" count={2}>
        <BsFillFlagFill
          size={18}
          onClick={() => {}}
        />
      </Badge>
    );
    const menu = (
      <Menu
        items={[
          {
            key: '1',
            label: (<a target="_blank" rel="noopener noreferrer" onClick={this.onShowModalNewAppoint}>{intl.formatMessage(messages.session)}</a>),
          },
          {
            key: '2',
            label: (<a target="_blank" rel="noopener noreferrer" href="#">{intl.formatMessage(messages.evaluation)}</a>),
          },
          {
            key: '3',
            label: (<a target="_blank" rel="noopener noreferrer" href="#">{intl.formatMessage(messages.referral)}</a>),
          },
        ]}
      />
    );

    const optionsEvent = [
      {
        label: intl.formatMessage(messages.appointments),
        value: 'appointments',
      },
      {
        label: intl.formatMessage(messages.evaluations),
        value: 'evaluations',
      },
      {
        label: intl.formatMessage(messages.screenings),
        value: 'screenings',
      },
      {
        label: intl.formatMessage(messages.referrals),
        value: 'referrals',
      },
    ];
    const optionsSkillset = [
      {
        label: 'Kriah Tutoring' + '(46)',
        value: 'appointments',
      },
      {
        label: intl.formatMessage(messages.evaluations),
        value: 'evaluations',
      },
      {
        label: intl.formatMessage(messages.screenings),
        value: 'screenings',
      },
      {
        label: intl.formatMessage(messages.referrals),
        value: 'referrals',
      },
      {
        label: intl.formatMessage(messages.homeworkTutoring),
        value: 'home_work',
      },
      {
        label: 'OT',
        value: 'OT',
      },
      {
        label: intl.formatMessage(messages.evaluations),
        value: 'evaluations2',
      },
      {
        label: intl.formatMessage(messages.screenings),
        value: 'screenings2',
      },
      {
        label: intl.formatMessage(messages.referrals),
        value: 'referrals2',
      },
    ];
    const modalNewAppointProps = {
      visible: visibleNewAppoint,
      onSubmit: this.onSubmitModalNewAppoint,
      onCancel: this.onCloseModalNewAppoint,
    };
    const modalSubsidyProps = {
      visible: visibleSubsidy,
      onSubmit: this.onCloseModalSubsidy,
      onCancel: this.onCloseModalSubsidy,
    };
    return (
      <div className="full-layout page dashboard-page">
        <div className='div-show-subsidy' onClick={this.onShowModalSubsidy}/>
        <div className='div-content'>
          <section className='div-activity-feed box-card'>
            <div className='div-title-feed text-center'>
              <p className='font-16 text-white mb-0'>{intl.formatMessage(messages.activityFeed)}</p>
            </div>
            <div className='div-list-feed'>
              {new Array(10).fill(null).map((_, index) => <div key={index} className='item-feed'>
                <p className='font-700'>Dependent #1 Name</p>
                <p>event-type</p>
                <p>provider-name</p>
                <p>location</p>
                <p>date/time</p>
                <p className='font-700 text-primary text-right' style={{marginTop: '-10px'}}>{intl.formatMessage(messages.today)}</p>
              </div>)}
              <div className='item-feed done'>
                <p className='font-700'>Dependent #1 Name</p>
                <p>event-type</p>
                <p>provider-name</p>
                <p>location</p>
                <p>date/time</p>
                <p className='font-700 text-primary text-right' style={{marginTop: '-10px'}}>{intl.formatMessage(messages.today)}</p>
              </div>
            </div>
          </section>
          <section className='div-calendar box-card'>
            <div className='calendar-header'>
              <div className='header-left flex flex-row' onClick={this.onShowFilter}>
                <p className='font-16'>{intl.formatMessage(messages.filterOptions)} {isFilter ? <BsX size={30}/> : <BsFilter size={30}/>}</p>
              </div>
              <div className='header-center flex flex-row'>
                <div className='btn-prev'><BiChevronLeft size={18}/></div>
                <p className='font-18'>July 2022</p>
                <div className='btn-next'><BiChevronRight size={18}/></div>
              </div>
              <div className='header-right flex flex-row'>
                <Button className='btn-type'>{intl.formatMessage(messages.month)}</Button>
                <Segmented
                  options={[
                    {
                      value: 'Grid',
                      icon: <FaCalendarAlt size={18} />,
                    },
                    {
                      value: 'List',
                      icon: <MdFormatAlignLeft size={20}/>,
                    },
                  ]}
                />
              </div>
            </div>
            {isFilter && <div className='calendar-filter'>
                <CSSAnimate className="animated-shorter" type={isFilter ? 'fadeIn' : 'fadeOut'}>
                  <Row gutter={10}>
                    <Col xs={12} sm={12} md={4}>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(messages.eventType)}</p>
                      <Checkbox.Group options={optionsEvent} />
                    </Col>
                    <Col xs={12} sm={12} md={6} className='skillset-checkbox'>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.skillsets)}</p>
                      <Checkbox.Group options={optionsSkillset} />
                    </Col>
                    <Col xs={12} sm={12} md={7} className='select-small'>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.provider)}</p>
                      <Select placeholder={intl.formatMessage(messages.startTypingProvider)}>
                        <Select.Option value='1'>Dr. Rabinowitz </Select.Option>
                      </Select>
                      <div className='div-chip'>
                        {Array(3).fill(null).map((_, index) =><div key={index} className='chip'>Dr. Rabinowitz <BsX size={16} onClick={null}/></div>)}
                      </div>
                    </Col>
                    <Col xs={12} sm={12} md={7} className='select-small'>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(messagesCreateAccount.location)}</p>
                      <Select placeholder={intl.formatMessage(messages.startTypingLocation)}>
                        <Select.Option value='1'>Rabinowitz office</Select.Option>
                      </Select>
                      <div className='div-chip'>
                        {Array(3).fill(null).map((_, index) =><div key={index} className='chip'>Rabinowitz office <BsX size={16} onClick={null}/></div>)}
                      </div>
                    </Col>
                  </Row>
                  <div className='text-right'>
                    <Button size='small' type='primary'>{intl.formatMessage(messages.apply).toUpperCase()}(10)</Button>
                  </div>
                </CSSAnimate>
              </div>}
            <div className='calendar-content'>
              <FullCalendar
                plugins={[ dayGridPlugin, timeGridPlugin ]}
                initialView="dayGridMonth"
                headerToolbar={false}
                fixedWeekCount={false}
              />
            </div>
            <div className='btn-appointment'>
              <Dropdown overlay={menu} placement="topRight">
                <Button 
                type='primary' 
                block 
                icon={<FaCalendarAlt size={19}/>}
                onClick={this.onShowDrawerDetailPost}
                >
                  {intl.formatMessage(messages.makeAppointment)}
                </Button>
              </Dropdown>
            </div>
          </section>
          <section className='div-multi-choice'>
            <Collapse 
              defaultActiveKey={['1']}
              expandIcon={({ isActive }) => isActive ?<BsFillDashSquareFill size={18}/> : <BsFillPlusSquareFill  size={18}/>}
              expandIconPosition={'end'}
              >
                <Panel 
                  key="1" 
                  header={intl.formatMessage(messages.appointments)} 
                  extra={genExtraTime()}
                  className='appointment-panel'
                  >
                  <Tabs defaultActiveKey="1" type="card" size='small'>
                    <TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                      {new Array(10).fill(null).map((_, index) => 
                        <div key={index} className='list-item'>
                          <div className='item-left'>
                            <Avatar size={24} icon={<FaUser size={12} />} onClick={this.onShowDrawerDetail}/>
                            <div className='div-service'>
                              <p className='font-11 mb-0'>Service Type</p>
                              <p className='font-09 mb-0'>Provide Name</p>
                            </div>
                            <p className='font-11 mb-0 ml-auto mr-5'>Location</p>
                            <div className='ml-auto'>
                              <p className='font-12 mb-0'>Time</p>
                              <p className='font-12 font-700 mb-0'>Date</p>
                            </div>
                          </div>
                          <div className='item-right'>
                            <GiBackwardTime size={19} onClick={() => {}}/>
                            <BsXCircle style={{marginTop: 4}} size={15} onClick={() => {}}/>
                          </div>
                        </div>
                      )}
                    </TabPane>
                    <TabPane tab={intl.formatMessage(messages.unprocessed)} key="2">
                      {new Array(10).fill(null).map((_, index) => 
                        <div key={index} className='list-item'>
                          <div className='item-left'>
                            <Avatar size={24} icon={<FaUser size={12} />} onClick={this.onShowDrawerDetail}/>
                            <div className='div-service'>
                              <p className='font-11 mb-0'>Service Type</p>
                              <p className='font-09 mb-0'>Provide Name</p>
                            </div>
                            <p className='font-11 mb-0 ml-auto mr-5'>Location</p>
                            <div className='ml-auto'>
                              <p className='font-12 mb-0'>Time</p>
                              <p className='font-12 font-700 mb-0'>Date</p>
                            </div>
                          </div>
                          <div className='item-right'>
                            <BsFillFlagFill size={15} onClick={() => {}}/>
                            <BsCheckCircleFill className='text-green500' style={{marginTop: 4}} size={15} onClick={() => {}}/>
                          </div>
                        </div>
                      )}
                    </TabPane>
                    <TabPane tab={intl.formatMessage(messages.past)} key="3">
                      {new Array(10).fill(null).map((_, index) => 
                        <div key={index} className='list-item'>
                          <div className='item-left'>
                            <Avatar size={24} icon={<FaUser size={12} />} onClick={this.onShowDrawerDetail}/>
                            <div className='div-service'>
                              <p className='font-11 mb-0'>Service Type</p>
                              <p className='font-09 mb-0'>Provide Name</p>
                            </div>
                            <p className='font-11 mb-0 ml-auto mr-5'>Location</p>
                            <div className='ml-auto'>
                              <p className='font-12 mb-0'>Time</p>
                              <p className='font-12 font-700 mb-0'>Date</p>
                            </div>
                          </div>
                          <div className='item-right'>
                            <BsEnvelope size={15} onClick={() => {}}/>
                            <BsFillFlagFill style={{marginTop: 4}} size={15} onClick={() => {}}/>
                          </div>
                        </div>
                      )}
                    </TabPane>
                  </Tabs>
                </Panel>
                <Panel header={intl.formatMessage(messages.referrals)} key="2">
                  {new Array(10).fill(null).map((_, index) => 
                    <div key={index} className='list-item padding-item'>
                      <Avatar size={24} icon={<FaUser size={12} />} />
                      <div className='div-service'>
                        <p className='font-11 mb-0'>Service Type</p>
                        <p className='font-09 mb-0'>Referrer Name</p>
                      </div>
                      <div className='text-center ml-auto mr-5'>
                        <p className='font-11 mb-0'>{intl.formatMessage(messages.phoneCall)}</p>
                        <p className='font-11 mb-0'>Phone number</p>
                      </div>
                      <div className='ml-auto'>
                        <p className='font-12 mb-0'>Time</p>
                        <p className='font-12 font-700 mb-0'>Date</p>
                      </div>
                    </div>)}
                </Panel>
                <Panel header={intl.formatMessage(messages.screenings)} key="3">
                  {new Array(10).fill(null).map((_, index) => 
                    <div key={index} className='list-item padding-item'>
                      <Avatar size={24} icon={<FaUser size={12} />} />
                      <div className='div-service'>
                        <p className='font-11 mb-0'>Service Type</p>
                        <p className='font-09 mb-0'>Provider Name</p>
                      </div>
                      <div className='text-center ml-auto mr-5'>
                        <p className='font-11 mb-0'>{intl.formatMessage(messages.phoneCall)}</p>
                        <p className='font-11 mb-0'>Phone number</p>
                      </div>
                      <div className='ml-auto'>
                        <p className='font-12 mb-0'>Time</p>
                        <p className='font-12 font-700 mb-0'>Date</p>
                      </div>
                    </div>)}
                </Panel>
                <Panel 
                  key="4"
                  header={intl.formatMessage(messages.evaluations)} 
                  className='evaluations-panel'
                >
                  <Tabs defaultActiveKey="1" type="card" size='small'>
                    <TabPane tab={intl.formatMessage(messages.upcoming)} key="1">
                      {new Array(10).fill(null).map((_, index) => 
                        <div key={index} className='list-item padding-item'>
                          <Avatar size={24} icon={<FaUser size={12} />} />
                          <div className='div-service'>
                            <p className='font-11 mb-0'>Service Type</p>
                            <p className='font-09 mb-0'>Provide Name</p>
                          </div>
                          <p className='font-11 mb-0 ml-auto mr-5'>Location</p>
                          <div className='ml-auto'>
                            <p className='font-12 mb-0'>Time</p>
                            <p className='font-12 font-700 mb-0'>Date</p>
                          </div>
                        </div>
                      )}
                    </TabPane>
                    <TabPane tab={intl.formatMessage(messages.past)} key="2">
                      <div className='list-item padding-item'>{intl.formatMessage(messages.past)}</div>
                    </TabPane>
                  </Tabs>
                </Panel>
                <Panel header={intl.formatMessage(messages.flags)} key="5" extra={genExtraFlag()}>
                  {new Array(10).fill(null).map((_, index) => 
                    <div key={index} className='list-item padding-item'>
                      <Avatar size={24} icon={<FaUser size={12} />} />
                      <div className='div-service'>
                        <p className='font-11 mb-0'>Service Type</p>
                        <p className='font-09 mb-0'>Provide Name</p>
                      </div>
                      <p className='font-11 mb-0 ml-auto mr-5'>Request clearance</p>
                      <p className='font-12 ml-auto mb-0'>Pay Flag</p>
                    </div>
                  )}
                </Panel>
                <Panel 
                  header={intl.formatMessage(messages.subsidaries)} 
                  key="6" 
                  className='subsidaries-panel'
                  >
                   <Tabs defaultActiveKey="1" type="card" size='small'>
                    <TabPane tab={intl.formatMessage(messages.pending)} key="1">
                      {new Array(10).fill(null).map((_, index) => 
                        <div key={index} className='list-item'>
                          <div className='item-left'>
                            <Avatar size={24} icon={<FaUser size={12} />} onClick={this.onShowDrawerDetail}/>
                            <div className='div-service'>
                              <p className='font-11 mb-0'>Service Type</p>
                              <p className='font-09 mb-0'>Provide Name</p>
                            </div>
                            <p className='font-11 mb-0 ml-auto mr-5'>Case Handler</p>
                            <p className='font-12 ml-auto mb-0'>Status</p>
                          </div>
                          <div className='item-right'>
                            <GiBackwardTime size={19} onClick={() => {}}/>
                            <BsXCircle style={{marginTop: 4}} size={15} onClick={() => {}}/>
                          </div>
                        </div>
                      )}
                    </TabPane>
                    <TabPane tab={intl.formatMessage(messages.declined)} key="2">
                      {new Array(10).fill(null).map((_, index) => 
                        <div key={index} className='list-item'>
                          <div className='item-left'>
                            <Avatar size={24} icon={<FaUser size={12} />} onClick={this.onShowDrawerDetail}/>
                            <div className='div-service'>
                              <p className='font-11 mb-0'>Service Type</p>
                              <p className='font-09 mb-0'>Provide Name</p>
                            </div>
                            <p className='font-11 mb-0 ml-auto mr-5'>Case Handler</p>
                            <p className='font-12 ml-auto mb-0'>Status</p>
                          </div>
                          <div className='item-right'>
                            <BsFillFlagFill size={15} onClick={() => {}}/>
                            <BsCheckCircleFill className='text-green500' style={{marginTop: 4}} size={15} onClick={() => {}}/>
                          </div>
                        </div>
                      )}
                    </TabPane>
                    <TabPane tab={intl.formatMessage(messages.approved)} key="3">
                      {new Array(10).fill(null).map((_, index) => 
                        <div key={index} className='list-item'>
                          <div className='item-left'>
                            <Avatar size={24} icon={<FaUser size={12} />} onClick={this.onShowDrawerDetail}/>
                            <div className='div-service'>
                              <p className='font-11 mb-0'>Service Type</p>
                              <p className='font-09 mb-0'>Provide Name</p>
                            </div>
                            <p className='font-11 mb-0 ml-auto mr-5'>Case Handler</p>
                            <p className='font-12 ml-auto mb-0'>Status</p>
                          </div>
                          <div className='item-right'>
                            <BsEnvelope size={15} onClick={() => {}}/>
                            <BsFillFlagFill style={{marginTop: 4}} size={15} onClick={() => {}}/>
                          </div>
                        </div>
                      )}
                    </TabPane>
                  </Tabs>
                </Panel>
            </Collapse>
          </section>
        </div>
        <div className='btn-call'>
          <img src='../images/call.png'/>
        </div>
        <DrawerDetail 
          visible={visibleDetail}
          onClose={this.onCloseDrawerDetail}
        />
        <DrawerDetailPost 
          visible={visibleDetailPost}
          onClose={this.onCloseDrawerDetailPost}
        />
        <ModalNewAppointment {...modalNewAppointProps}/>
        <ModalSubsidyProgress {...modalSubsidyProps}/>
      </div>
    );
  }
}
