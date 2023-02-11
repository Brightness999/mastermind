import React from 'react';
import { Divider, Button, Form, Select, message, Input } from 'antd';
import intl from 'react-intl-universal';
import mgsSidebar from '../../../../components/SideBar/messages';
import './index.less';
import request from '../../../../utils/api/request';
import { addCommunity, getCityConnections, updateSettings } from '../../../../utils/api/apiList';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { setCommunity } from '../../../../redux/features/authSlice';
import PageLoading from '../../../../components/Loading/PageLoading';

class SystemSetting extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			community: undefined,
			cityConnections: [],
			newCity: '',
			loading: false,
		}
	}

	componentDidMount() {
		if (this.props.user?.role === 1000) {
			this.setState({ loading: true });
			request.post(getCityConnections).then(res => {
				const { success, data } = res;
				this.setState({ loading: false });
				if (success) {
					this.setState({ cityConnections: data });
				} else {
					this.setState({ cityConnections: [] });
				}
			}).catch(error => {
				this.setState({ loading: false });
				console.log('get cityConnections error---', error);
				this.setState({ cityConnections: [] });
			})
		} else {
			this.setState({ cityConnections: this.props.user?.adminCommunity });
		}

		this.setState({ community: this.props.community?.community?._id });
		this.form?.setFieldsValue({ community: this.props.community?.community?._id });
	}

	onFinish = (values) => {
		request.post(updateSettings, values).then(res => {
			const { success } = res;
			if (success) {
				message.success('Successfully updated');
				this.props.dispatch(setCommunity({
					...this.props.community,
					community: this.state.cityConnections?.find(city => city?._id == values?.community),
				}));
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
		const { community, cityConnections, loading } = this.state;
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
					<Form.Item
						wrapperCol={{
							md: { span: 15, offset: 5 },
							sm: { span: 13, offset: 7 },
						}}
					>
						<Button type="primary" htmlType="submit">
							Save
						</Button>
					</Form.Item>
				</Form>
				<PageLoading loading={loading} isBackground={true} />
			</div>
		);
	}
}


const mapStateToProps = state => ({
	user: state.auth.user,
	community: state.auth.currentCommunity,
});

export default compose(connect(mapStateToProps))(SystemSetting);