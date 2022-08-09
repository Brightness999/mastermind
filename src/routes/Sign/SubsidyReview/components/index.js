import React from 'react';
import { connect } from 'dva';
import { Row, Divider, Button } from 'antd';
import { BiChevronLeft } from 'react-icons/bi';
import intl from 'react-intl-universal';
import messages from '../messages';
import messagesRequest from '../../SubsidyRequest/messages';
import './index.less';

@connect()
export default class extends React.Component {
  render() {
    return (
      <div className="full-layout page subsidyreview-page">
        <Row justify="center" className="row-form">
          <div className='col-form col-subsidy-review'>
            <div className='div-form-title'>
              <p className='font-24 text-center'>{intl.formatMessage(messages.reviewSubsidyRequest)}</p>
            </div>
            <div>
              <p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.dependentInfo)}</p>
              <div className='review-item'>
                <p>Dependent</p>
                <p>School</p>
                <p>Skillset(s)</p>
              </div>
            </div>
            <Divider style={{marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7'}}/>
            <div>
              <p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.otherCcontacts)}</p>
              <div className='review-item'>
                <p>Raw name</p>
                <p>Rav phone</p>
                <p>Rav email</p>
                <p>Therapist name</p>
                <p>Therapist phone</p>
                <p>Therapist email</p>
              </div>
            </div>
            <Divider style={{marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7'}}/>
            <div>
              <p className='font-20 font-700 mb-10'>{intl.formatMessage(messages.notes)}</p>
              <div>
                <p>Notes text....</p>
              </div>
            </div>
            <Divider style={{marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7'}}/>
            <div>
              <p className='font-20 font-700 mb-10'>{intl.formatMessage(messagesRequest.documents)}</p>
              <div className='review-item'>
                <p>Document #1 title</p>
                <p>Document #2 title</p>
                <p>Document #3 title</p>
                <p>Document #4 title</p>
              </div>
            </div>
            <div className='div-review-btn'>
              <Button block onClick={() => window.history.back()}>{intl.formatMessage(messages.goBack).toUpperCase()}</Button>
              <Button type='primary' block>{intl.formatMessage(messages.submit).toUpperCase()}</Button>
            </div>
          </div>
        </Row>
      </div>
    );
  }
}
