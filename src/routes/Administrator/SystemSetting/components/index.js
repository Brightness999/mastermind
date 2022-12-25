import React from 'react';
import { Divider, Button, Form, Select, message, Input } from 'antd';
import intl from 'react-intl-universal';
import mgsSidebar from '../../../../components/SideBar/messages';
import './index.less';
import request from '../../../../utils/api/request';
import { addCommunity, getCityConnections, getSettings, updateSettings } from '../../../../utils/api/apiList';
import { compose } from 'redux';
import { connect } from 'react-redux';

class SystemSetting extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			community: undefined,
			cityConnections: [],
			newCity: '',
		}
	}

	componentDidMount() {
		if (this.props.user?.role === 1000) {
			request.post(getCityConnections).then(res => {
				const { success, data } = res;
				if (success) {
					this.setState({ cityConnections: data });
				} else {
					this.setState({ cityConnections: [] });
				}
			}).catch(error => {
				console.log('get cityConnections error---', error);
				this.setState({ cityConnections: [] });
			})
		} else {
			this.setState({ cityConnections: this.props.user?.adminCommunity });
		}

		request.post(getSettings).then(res => {
			const { success, data } = res;
			if (success) {
				this.setState({ community: data?.community });
				this.form.setFieldsValue({ community: data?.community })
			}
		}).catch(error => {
			console.log('get settings error---', error);
		})
	}

	onFinish = (values) => {
		request.post(updateSettings, values).then(res => {
			const { success } = res;
			if (success) {
				message.success('Successfully updated');
			}
		}).catch(error => {
			console.log('get settings error---', error);
		})
	};

	handleAddCity = () => {
		const { cityConnections, newCity } = this.state;

		if (newCity) {
			request.post(addCommunity, { name: newCity }).then(res => {
				const { success, data } = res;

				if (success) {
					message.success('Successfully added');
					this.setState({ cityConnections: [...cityConnections, data], newCity: '' });
				}
			}).catch(error => {
				console.log('get settings error---', error);
				message.error(error.message);
			})
		}
	}

	render() {
		const { community, cityConnections } = this.state;
		const { user } = this.props;
		const layout = {
			labelCol: {
				md: 5,
				sm: 7,
			},
			wrapperCol: {
				lg: 10,
				md: 12,
				sm: 14
			},
		};

		return (
			<div className="full-layout page systemsetting-page">
				<div className='div-title-admin'>
					<p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.systemSetting)}</p>
					<Divider />
				</div>
				<Form {...layout} name="system_setting" onFinish={this.onFinish} ref={(ref) => { this.form = ref }}>
					<Form.Item
						name="community"
						label="Community"
					>
						<Select value={community}>
							{user.role == 1000 && <Select.Option value='all'>All</Select.Option>}
							{cityConnections.map((city, index) => (
								<Select.Option key={index} value={city._id}>{city.name}</Select.Option>
							))}
						</Select>
					</Form.Item>
					{user?.role == 1000 && (
						<Form.Item
							name="newCity"
							label="New City"
						>
							<div className='flex items-center gap-3'>
								<Input className='h-40' onChange={(e) => this.setState({ newCity: e.target.value })} />
								<Button type="primary" onClick={() => this.handleAddCity()}>Add</Button>
							</div>
						</Form.Item>
					)}
					<Form.Item wrapperCol={{
						md: { span: 15, offset: 5 },
						sm: { span: 13, offset: 7 },
					}}>
						<Button type="primary" htmlType="submit">
							Save
						</Button>
					</Form.Item>
				</Form>
			</div>
		);
	}
}


const mapStateToProps = state => {
	return ({ user: state.auth.user });
}

export default compose(connect(mapStateToProps))(SystemSetting);