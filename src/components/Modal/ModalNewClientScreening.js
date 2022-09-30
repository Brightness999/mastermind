import React from 'react';
import { Modal, Button, Steps, Input } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgDetail from '../../components/DrawerDetail/messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalNewClientScreening extends React.Component {

    render() {

        const modalProps = {
            className: 'modal-new-screening',
            title: "",
            visible: this.props.visible,
            onOk: this.props.onSubmit,
            onCancel: this.props.onCancel,
            closable: false,
            // width: 900,
            footer: [
                <Button key="back" onClick={this.props.onCancel}>
                    {intl.formatMessage(messages.cancel)}
                </Button>,
                <Button key="submit" type="primary" onClick={this.props.onSubmit} style={{ padding: '7.5px 30px' }}>
                    {intl.formatMessage(messages.accept)}
                </Button>
            ]
        };
        return (
            <Modal {...modalProps}>
                <div>
                    <p className='font-24'>New Client Screening</p>
                    <div className='detail-item flex'>
                        <div className='title'>
                            <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.what)}</p>
                        </div>
                        <p className='font-16'>30 Minute Occupational Therapy Session</p>
                    </div>
                    <div className='detail-item flex'>
                        <p className='font-18 font-700 title'>Dependent</p>
                        <p className='font-18'>Dependent name</p>
                    </div>
                    <div className='detail-item flex'>
                        <div className='flex flex-row title'>
                            <p className='font-18 font-700'>Phone</p>
                        </div>
                        <div className='flex flex-row flex-1'>
                            <p className='font-18'>Dependent phone</p>
                        </div>
                    </div>
                    <div className='detail-item flex'>
                        <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.when)}</p>
                        <p className='font-18'>07/27/2022 &#8226; 12:30pm</p>
                    </div>
                    <div className='detail-item flex mb-2'>
                        <p className='font-18 font-700 title'>{intl.formatMessage(msgDetail.where)}</p>
                        <p className='font-16'>1234 Somewhere Rd Chicago, IL 77777</p>
                    </div>
                </div>

            </Modal>
        );
    }
};
export default ModalNewClientScreening;