import React from 'react';
import { connect } from 'dva';
import { Collapse, Badge, Avatar, Tabs, Dropdown, Menu, Button } from 'antd';
import { FaUser, FaCalendarAlt } from 'react-icons/fa';
import { GiBackwardTime } from 'react-icons/gi';
import { BsXCircle, BsFillDashSquareFill, BsFillPlusSquareFill, BsClockHistory, BsFillFlagFill } from 'react-icons/bs';
import intl from 'react-intl-universal';
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid' // a plugin!
import messages from '../messages';
import './index.less';
const { Panel } = Collapse;
const { TabPane} = Tabs;
@connect()
export default class extends React.Component {
  render() {
    const text = `
      A dog is a type of domesticated animal.
      Known for its loyalty and faithfulness,
      it can be found as a welcome guest in many households across the world.
    `;
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
            label: (<a target="_blank" rel="noopener noreferrer" href="#">Session</a>),
          },
          {
            key: '2',
            label: (<a target="_blank" rel="noopener noreferrer" href="#">Evaluation</a>),
          },
          {
            key: '3',
            label: (<a target="_blank" rel="noopener noreferrer" href="#">Referral</a>),
          },
        ]}
      />
    );
    return (
      <div className="full-layout page dashboard-page">
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
            <FullCalendar
              plugins={[ dayGridPlugin, timeGridPlugin ]}
              initialView="dayGridMonth"
              headerToolbar={false}
              fixedWeekCount={false}
            />
            <div className='btn-appointment'>
              <Dropdown overlay={menu} placement="topRight">
                <Button type='primary' block icon={<FaCalendarAlt size={19}/>}>{intl.formatMessage(messages.makeAppointment)}</Button>
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
                          <div className='item-right'>
                            <GiBackwardTime size={19} onClick={() => {}}/>
                            <BsXCircle style={{marginTop: 4}} size={15} onClick={() => {}}/>
                          </div>
                        </div>
                      )}
                    </TabPane>
                    <TabPane tab={intl.formatMessage(messages.unprocessed)} key="2">
                      <div className='list-item'>{intl.formatMessage(messages.unprocessed)}</div>
                    </TabPane>
                    <TabPane tab={intl.formatMessage(messages.past)} key="3">
                      <div className='list-item'>{intl.formatMessage(messages.past)}</div>
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
                <Panel header={intl.formatMessage(messages.subsidaries)} key="6">
                  {new Array(10).fill(null).map((_, index) => 
                    <div key={index} className='list-item padding-item'>
                      <Avatar size={24} icon={<FaUser size={12} />} />
                      <div className='div-service'>
                        <p className='font-11 mb-0'>Service Type</p>
                        <p className='font-09 mb-0'>Provide Name</p>
                      </div>
                      <p className='font-11 mb-0 ml-auto mr-5'>Case Handler</p>
                      <p className='font-12 ml-auto mb-0'>Status</p>
                    </div>
                  )}
                </Panel>
            </Collapse>
          </section>
          
        </div>
        <div className='btn-call'>
          <img src='../images/call.png'/>
        </div>
      </div>
    );
  }
}
