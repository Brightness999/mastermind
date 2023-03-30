import React from 'react';
import { Modal, Button, Input, Form, Row, Select } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalSchoolSubsidyApproval extends React.Component {
	onFinish = (values) => {
		this.props.onSubmit(values);
	}

	render() {
		const modalProps = {
			className: 'modal-school-approve',
			title: <span className='font-16'>Subsidy Approval</span>,
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			footer: null,
			width: 500,
		};

		return (
			<Modal {...modalProps}>
				<Form name='flag-no-show' layout='vertical' onFinish={this.onFinish} ref={ref => this.form = ref}>
					<Form.Item
						name="selectedProvider"
						label={intl.formatMessage(msgCreateAccount.provider)}
						rules={[{ required: true }]}
					>
						<Select className='mb-10' placeholder={intl.formatMessage(messages.selectProvider)}>
							{this.props.auth.providers?.filter(provider => provider?.skillSet?.find(skill => skill?._id === this.props.subsidy?.skillSet?._id))?.map((provider) => (
								<Select.Option key={provider._id} value={provider._id}>{`${provider.firstName} ${provider.lastName}` || provider.referredToAs}</Select.Option>
							))}
						</Select>
					</Form.Item>
					<Form.Item
						name="decisionExplanation"
						label={intl.formatMessage(messages.generalNotes)}
						rules={[{ required: true }]}
					>
						<Input.TextArea rows={5} placeholder={intl.formatMessage(messages.generalNotes)} />
					</Form.Item>
					<Row className="justify-end gap-2 mt-10 items-center">
						<Button key="back" onClick={this.props.onCancel}>
							{intl.formatMessage(messages.cancel)}
						</Button>
						<Button key="submit" type="primary" htmlType='submit'>
							{intl.formatMessage(messages.approve)}
						</Button>
					</Row>
				</Form>
			</Modal>
		);
	}
};


const mapStateToProps = state => ({
	auth: state.auth,
})

export default compose(connect(mapStateToProps))(ModalSchoolSubsidyApproval);