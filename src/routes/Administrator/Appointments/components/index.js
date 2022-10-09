import React from 'react';
import { Button, Segmented, Row, Col, Checkbox, Select, message, Divider, Input, Avatar } from 'antd';
import { FaCalendarAlt } from 'react-icons/fa';
import { MdFormatAlignLeft } from 'react-icons/md';
import { BsFilter, BsX } from 'react-icons/bs';
import intl from 'react-intl-universal';
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // needed for dayClick
import listPlugin from '@fullcalendar/list';
import PlacesAutocomplete from 'react-places-autocomplete';
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/timegrid/main.css";
import moment from 'moment';
import CSSAnimate from '../../../../components/CSSAnimate';
import DrawerDetail from '../../../../components/DrawerDetail';
import msgSidebar from '../../../../components/SideBar/messages';
import msgDashboard from '../../../Dashboard/messages';
import msgCreateAccount from '../../../Sign/CreateAccount/messages';
import './index.less';
import { routerLinks } from '../../../constant';
import { checkPermission } from '../../../../utils/auth/checkPermission';
import request, { generateSearchStructure } from '../../../../utils/api/request';
import { url } from '../../../../utils/api/baseUrl';
import { store } from '../../../../redux/store';
import { getAppointmentsMonthData } from '../../../../redux/features/appointmentsSlice';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFilter: false,
      visibleDetail: false,
      isEventDetail: false,
      idEvent: 0,
      isMonth: 1,
      isGridDayView: 'Grid',
      calendarWeekends: true,
      calendarEvents: store.getState().appointments.dataAppointmentsMonth ?? [],
      listProvider: [],
      skillSet: [],
      selectedProviders: [],
      location: '',
      selectedLocations: [],
      appointments: [],
    }
  }
  calendarRef = React.createRef();

  componentDidMount() {
    if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
      checkPermission().then(loginData => {
        loginData.user.role < 900 && this.props.history.push(routerLinks.Dashboard);
        const appointmentsMonth = store.getState().appointments.dataAppointmentsMonth
        console.log(appointmentsMonth)
        const dataFetchAppointMonth = {
          role: loginData.user.role,
          data: {
            month: moment().month() + 1,
            year: moment().year()
          },
          token: loginData.token
        }
        this.setState({
          calendarEvents: appointmentsMonth,
          userRole: loginData.user.role
        }, () => {
          this.getAppointments();
          store.dispatch(getAppointmentsMonthData(dataFetchAppointMonth))
        })
        this.getProviders();
        this.getSkillSet();
      }).catch(err => {
        console.log(err);
        this.props.history.push('/');
      })
    }
  }

  onShowFilter = () => {
    this.setState({ isFilter: !this.state.isFilter });
  }

  onShowDrawerDetail = (val) => {
    const id = val?.event?.toPlainObject() ? val.event?.toPlainObject()?.extendedProps?._id : 0
    this.setState({
      visibleDetail: true,
      idEvent: id,
    });
  };

  onCloseDrawerDetail = () => {
    this.setState({ visibleDetail: false });
  };

  handleMonthToWeek = () => {
    if (this.state.isMonth === 1) {
      this.setState({ isMonth: 0 });
    } else {
      this.setState({ isMonth: 1 });
    }
  }

  handleChangeDayView = () => {
    if (this.state.isGridDayView === 'Grid') {
      this.setState({ isGridDayView: 'List' });
    } else {
      this.setState({ isGridDayView: 'Grid' });
    }
  }

  handleEventRemove = (removeInfo) => {
    this.props.deleteEvent(removeInfo.event.id)
      .catch(() => {
        reportNetworkError()
        removeInfo.revert()
      })
  }

  handleSelectProvider = (name) => {
    if (!this.state.selectedProviders.includes(name)) {
      this.setState({ selectedProviders: [...this.state.selectedProviders, name] });
    }
  }

  handleRemoveProvider = (index) => {
    this.state.selectedProviders.splice(index, 1);
    this.setState({ selectedProviders: this.state.selectedProviders });
  }

  handelChangeLocation = (location) => {
    this.setState({ location: location });
  }

  handleSelectLocation = (location) => {
    if (!this.state.selectedLocations.includes(location)) {
      this.setState({ selectedLocations: [...this.state.selectedLocations, location] });
    }
    this.setState({ location: '' });
  }

  handleRemoveLocation = (index) => {
    this.state.selectedLocations.splice(index, 1);
    this.setState({ selectedLocations: this.state.selectedLocations });
  }

  getAppointments = () => {
    request.post(url + 'admin/get_appointments')
      .then(result => {
        if (result.success) {
          const data = result.data;
          this.setState({ appointments: data.docs });
        } else {
          this.setState({ appointments: [] });
        }
      }).catch(err => {
        console.log(err);
        this.setState({ appointments: [] });
      });
  }

  getSkillSet = () => {
    request.post(url + 'providers/get_default_values_for_provider')
      .then(result => {
        if (result.success) {
          const data = result.data;
          this.setState({ skillSet: data.SkillSet });
        } else {
          this.setState({ skillSet: [] });
        }
      }).catch(err => {
        console.log(err);
        this.setState({ skillSet: [] });
      });
  }

  getProviders = () => {
    request.post('clients/search_providers', generateSearchStructure('')).then(result => {
      if (result.success) {
        this.setState({ listProvider: result.data });
      }
    });
  }

  render() {
    const {
      isFilter,
      visibleDetail,
      isEventDetail,
      isMonth,
      isGridDayView,
      skillSet,
      listProvider,
      selectedProviders,
      selectedLocations,
    } = this.state;
    const btnMonthToWeek = (
      <div role='button' className='btn-type' onClick={this.handleMonthToWeek}>
        {isMonth ? intl.formatMessage(msgDashboard.month) : intl.formatMessage(msgDashboard.week)}
      </div>
    );
    const btnChangeDayView = (
      <Segmented
        onChange={this.handleChangeDayView}
        options={[
          {
            value: 'Grid',
            icon: <FaCalendarAlt size={18} />,
          },
          {
            value: 'List',
            icon: <MdFormatAlignLeft size={20} />,
          },
        ]}
      />
    );
    const btnFilter = (
      <div className='header-left flex flex-row' onClick={this.onShowFilter}>
        <p className='font-15'>{intl.formatMessage(msgDashboard.filterOptions)} {isFilter ? <BsX size={30} /> : <BsFilter size={25} />}</p>
      </div>
    );
    const optionsEvent = [
      {
        label: intl.formatMessage(msgDashboard.appointments),
        value: 'appointments',
      },
      {
        label: intl.formatMessage(msgDashboard.evaluations),
        value: 'evaluations',
      },
      {
        label: intl.formatMessage(msgDashboard.screenings),
        value: 'screenings',
      },
      {
        label: intl.formatMessage(msgDashboard.referrals),
        value: 'referrals',
      },
      {
        label: intl.formatMessage(msgDashboard.consultations),
        value: 'consultations',
      },
    ];

    return (
      <div className="admin-page">
        <div className='div-title-admin'>
          <p className='font-16 font-500'>{intl.formatMessage(msgSidebar.appointments)}</p>
          <Divider />
        </div>
        <div className='div-content'>
          <section className='div-calendar box-card'>
            {isFilter && (
              <div className='calendar-filter w-100'>
                <CSSAnimate className="animated-shorter">
                  <Row gutter={10}>
                    <Col xs={12} sm={12} md={4}>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(msgDashboard.eventType)}</p>
                      <Checkbox.Group className='flex flex-col' options={optionsEvent} />
                    </Col>
                    <Col xs={12} sm={12} md={6} className='skillset-checkbox'>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(msgCreateAccount.skillsets)}</p>
                      <Checkbox.Group className='flex flex-col' options={skillSet} />
                    </Col>
                    <Col xs={12} sm={12} md={7} className='select-small'>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(msgCreateAccount.provider)}</p>
                      <Select
                        placeholder={intl.formatMessage(msgDashboard.startTypingProvider)}
                        value=''
                        onChange={(v) => this.handleSelectProvider(v)}
                      >
                        {listProvider?.map((provider, i) => (
                          <Select.Option key={i} value={provider.name}>{provider.name}</Select.Option>
                        ))}
                      </Select>
                      <div className='div-chip'>
                        {selectedProviders?.map((name, i) => (
                          <div key={i} className='chip'>
                            {name}
                            <BsX size={16} onClick={() => this.handleRemoveProvider(i)} /></div>
                        ))}
                      </div>
                    </Col>
                    <Col xs={12} sm={12} md={7} className='select-small'>
                      <p className='font-10 font-700 mb-5'>{intl.formatMessage(msgCreateAccount.location)}</p>
                      <PlacesAutocomplete
                        value={this.state.location}
                        onChange={(value) => this.handelChangeLocation(value)}
                        onSelect={(value) => this.handleSelectLocation(value)}
                      >
                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                          <div>
                            <Input {...getInputProps({
                              placeholder: 'Service Address',
                              className: 'location-search-input',
                            })} />
                            <div className="autocomplete-dropdown-container">
                              {loading && <div>Loading...</div>}
                              {suggestions.map(suggestion => {
                                const className = suggestion.active
                                  ? 'suggestion-item--active'
                                  : 'suggestion-item';
                                // inline style for demonstration purpose
                                const style = suggestion.active
                                  ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                                  : { backgroundColor: '#ffffff', cursor: 'pointer' };
                                return (
                                  <div {...getSuggestionItemProps(suggestion, { className, style })} key={suggestion.index}>
                                    <span>{suggestion.description}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </PlacesAutocomplete>
                      <div className='div-chip'>
                        {selectedLocations?.map((location, i) => (
                          <div key={i} className='chip'>
                            {location}
                            <BsX size={16} onClick={() => this.handleRemoveLocation(i)} />
                          </div>
                        ))}
                      </div>
                    </Col>
                  </Row>
                  <div className='text-right'>
                    <Button size='small' type='primary'>{intl.formatMessage(msgDashboard.apply).toUpperCase()}</Button>
                  </div>
                </CSSAnimate>
              </div>
            )}
            {!isEventDetail && (
              <div className='calendar-content'>
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                  ref={this.calendarRef}
                  headerToolbar={{
                    left: "filterButton",
                    center: "prev,title,next",
                    right: "monthToWeekButton,segmentView"
                  }}
                  views={{
                    monthToWeekButton: {
                      type: isMonth ? 'dayGridMonth' : 'timeGridWeek',
                      buttonText: btnMonthToWeek,
                    },
                    segmentView: {
                      type: isGridDayView === 'Grid' ? 'dayGridMonth' : 'listWeek',
                      buttonText: btnChangeDayView,
                    },
                    week: {
                      titleFormat: { month: 'numeric', day: 'numeric' }
                    },
                  }}
                  customButtons={{
                    filterButton: {
                      text: btnFilter,
                    },
                  }}
                  initialView='dayGridMonth'
                  eventColor='#2d5cfa'
                  eventDisplay='block'
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  events={this.state.calendarEvents}
                  weekends={this.state.calendarWeekends}
                  datesSet={this.handleDates}
                  eventContent={renderEventContent}
                  eventClick={this.onShowDrawerDetail}
                  eventRemove={this.handleEventRemove}
                />
              </div>
            )}
          </section>
        </div>
        <DrawerDetail
          visible={visibleDetail}
          onClose={this.onCloseDrawerDetail}
          id={this.state.idEvent}
          role={this.state.userRole}
          calendarEvents={this.state.calendarEvents}
        />
      </div>
    );
  }
}

function reportNetworkError() {
  alert('This action could not be completed')
}

function renderEventContent(eventInfo) {
  return (
    <div className='flex flex-col'>
      <b className='mr-3'>{moment(eventInfo.event.start).format('hh:mm')}</b>
      <b className='mr-3'>Provider: {eventInfo.event.extendedProps?.provider?.name}</b>
      <b className='mr-3'>Requester: {eventInfo.event.extendedProps?.requester?.username}</b>
    </div>
  )
}