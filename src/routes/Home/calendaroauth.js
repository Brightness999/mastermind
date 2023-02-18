import React, { useEffect } from 'react';
import { message } from 'antd';
import request from '../../utils/api/request';
import { createGoogleMeet } from '../../utils/api/apiList';
import { store } from '../../redux/store';
import moment from 'moment';

const CalendarOauth = () => {
  useEffect(() => {
    const query = new URLSearchParams(window?.location?.search);
    const params = {
      code: query.get('code'),
      startTime: moment(store.getState().auth.selectedTime).format('YYYY-MM-DDTHH:mm:ssZ'),
      endTime: moment(store.getState().auth.selectedTime).clone().add(30, 'minute').format('YYYY-MM-DDTHH:mm:ssZ'),
      calendarTempId: store.getState().auth.meetingLink,
      parentInfoId: store.getState().auth.selectedUser?._id,
    }
    request.post(createGoogleMeet, params).then(res => {
      if (res.success) {
        window.close();
      } else {
        window.close();
      }
    }).catch(err => {
      message.error(err.message);
      setTimeout(() => {
        window.close();
      }, 3000);
    })
  }, []);

  return (<div className='loading-spinner-background'><div className="loading-spinner loading-spinner-style1" /></div>);
}

export default CalendarOauth