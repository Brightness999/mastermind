import React from 'react';
import { Row, Button, Divider, message, Modal } from 'antd';

import intl from 'react-intl-universal';
import messages from './messages';
import messagesCreateAccount from '../../routes/Sign/CreateAccount/messages';
import messagesRequest from '../../routes/Sign/SubsidyRequest/messages';
import messagesReview from '../../routes/Sign/SubsidyReview/messages';

import './style/index.less';

class ModalNewSubsidyReview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    onFinish = (values) => {
        console.log('Success:', values);
    };

    onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    render() {

        const modalProps = {
            className: 'modal-new-subsidy-review',
            title: intl.formatMessage(messagesCreateAccount.reviewAccountInfo),
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
                    {intl.formatMessage(messages.create)}
                </Button>
            ]
        };
        const props = {
            name: 'file',
            action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
            headers: {
                authorization: 'authorization-text',
            },
            onChange: this.onChangeUpload,
            // maxCount: 1,
            // showUploadList: false 
        };
      
        return (
            <Modal {...modalProps}>
                <Row justify="center" className="row-form">
                    <div className='col-form col-subsidy-review mt-0'>
                        <div>
                            <p className='font-16 font-700 mb-10'>{intl.formatMessage(messagesReview.dependentInfo)}</p>
                            <div className='review-item'>
                                <p>Dependent name</p>
                                <p>School name</p>
                                <p>Skillset(s)</p>
                            </div>
                        </div>
                        <Divider style={{ marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7' }} />
                        <div>
                            <p className='font-16 font-700 mb-10'>{intl.formatMessage(messagesReview.otherCcontacts)}</p>
                            <div className='review-item'>
                                <p>Raw name</p>
                                <p>Rav phone</p>
                                <p>Rav email</p>
                                <p>Therapist name</p>
                                <p>Therapist phone</p>
                                <p>Therapist email</p>
                            </div>
                        </div>
                        <Divider style={{ marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7' }} />
                        <div>
                            <p className='font-16 font-700 mb-10'>{intl.formatMessage(messagesReview.notes)}</p>
                            <div>
                                <p>note...</p>
                            </div>
                        </div>
                        <Divider style={{ marginTop: 15, marginBottom: 15, borderColor: '#d7d7d7' }} />
                        <div>
                            <p className='font-16 font-700 mb-10'>{intl.formatMessage(messagesRequest.documents)}</p>
                            <div className='review-item'>
                                <p>Document #2 title</p>
                                <p>Document #3 title</p>
                                <p>Document #4 title</p>
                            </div>
                        </div>
                    </div>
                </Row>
            </Modal>
        );
    }
};

export default ModalNewSubsidyReview;