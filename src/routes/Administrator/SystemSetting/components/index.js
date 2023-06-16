import React from 'react';
import { Divider, Button, Form, Select, message, Input } from 'antd';
import intl from 'react-intl-universal';
import { compose } from 'redux';
import { connect } from 'react-redux';
import PlacesAutocomplete from 'react-places-autocomplete';

import mgsSidebar from '../../../../components/SideBar/messages';
import request from '../../../../utils/api/request';
import { addCommunity, getCityConnections, updateSettings } from '../../../../utils/api/apiList';
import { setCommunity } from '../../../../redux/features/authSlice';
import PageLoading from '../../../../components/Loading/PageLoading';
import './index.less';

class SystemSetting extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
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
				this.form?.setFieldsValue({ community: this.props.community?.community?._id });
			}).catch(error => {
				this.setState({ loading: false });
				this.setState({ cityConnections: [] });
			})
		} else {
			this.setState({ cityConnections: this.props.user?.adminCommunity });
		}

	}

	onFinish = (values) => {
		if (values.community) {
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
				message.error(error.message);
			})
		}
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
				message.error(error.message);
			})
		}
	}

	render() {
		const { cityConnections, loading, newCity } = this.state;
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
						<Select>
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
							<div className='flex gap-3'>
								<PlacesAutocomplete
									value={newCity}
									onChange={(value) => this.setState({ newCity: value })}
									onSelect={(value) => this.setState({ newCity: value })}
								>
									{({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
										<div className='flex-1'>
											<Input {...getInputProps({
												placeholder: 'New City',
												className: 'h-40',
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