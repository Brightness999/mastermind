import React, { createRef } from 'react';
import { Divider, Table, Space, Button, Input, message, Pagination, Checkbox } from 'antd';
import intl from 'react-intl-universal';
import { FilterFilled, SearchOutlined } from '@ant-design/icons';

import { routerLinks, BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY, BASE_CALENDAR_URL, GOOGLE_CALENDAR_API_KEY, JEWISH_CALENDAR_REGION, USA_CALENDAR_REGION } from 'routes/constant';
import { ModalConfirm, ModalInputCode, ModalProviderDetail } from 'components/Modal';
import mgsSidebar from 'components/SideBar/messages';
import request from 'utils/api/request';
import { activateUser, getProviders } from 'utils/api/apiList';
import PageLoading from 'components/Loading/PageLoading';
import { setSelectedUser } from 'src/redux/features/authSlice';
import { store } from 'src/redux/store';
import './index.less';

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visibleInputCode: false,
			providers: [],
			isConfirmModal: false,
			confirmMessage: '',
			userId: '',
			userState: 1,
			loading: false,
			pageSize: 10,
			pageNumber: 1,
			totalSize: 0,
			visibleProviderDetail: false,
			selectedProvider: undefined,
			jewishHolidays: [],
			legalHolidays: [],
			selectedServices: [],
			selectedStatus: [],
			searchAddress: '',
			searchUsername: '',
			searchEmail: '',
			searchName: '',
		};
		this.searchInput = createRef(null);
	}

	componentDidMount() {
		this.getProviderList();
		this.getHolidays();
	}

	handleChangePagination = (newPageNumber, newPageSize) => {
		this.setState({ pageNumber: newPageNumber, pageSize: newPageSize }, () => {
			this.getProviderList();
		});
	}

	getProviderList = () => {
		this.setState({ loading: true });
		const { pageNumber, pageSize, selectedServices, selectedStatus, searchAddress, searchEmail, searchName, searchUsername } = this.state;
		const postData = {
			pageNumber, pageSize,
			services: selectedServices,
			status: selectedStatus,
			address: searchAddress,
			username: searchUsername,
			name: searchName,
			email: searchEmail,
		}

		request.post(getProviders, postData).then(result => {
			this.setState({ loading: false });
			const { success, data } = result;
			if (success) {
				this.setState({
					providers: data?.providers?.map((user, i) => {
						user['key'] = i; return user;
					}) ?? [],
					totalSize: data?.total,
				});
			}
		}).catch(err => {
			message.error(err.message);
			this.setState({ loading: false });
		})
	}

	handleNewSchool = () => {
		this.props.history.push(routerLinks.CreateAccountForAdmin);
	}

	onShowModalInputCode = (user) => {
		this.setState({ visibleInputCode: true, selectedProvider: user })
	}

	onCloseModalInputCode = () => {
		this.setState({ visibleInputCode: false })
	}

	verifyCode = (code) => {
		if (code == 613) {
			this.onCloseModalInputCode();
			store.dispatch(setSelectedUser(this.state.selectedProvider));
			this.props.history.push(routerLinks.ChangeUserProfile);
		} else {
			message.warning('Invalid code. Try again.');
		}
	}

	handleActivate = (id, state) => {
		this.setState({
			isConfirmModal: true,
			confirmMessage: `Are you sure to ${state ? 'activate' : 'deactivate'} this school?`,
			userId: id,
			userState: state,
		});
	}

	handleConfirm = () => {
		const { userId, userState, providers } = this.state;

		request.post(activateUser, { userId: userId, isActive: userState }).then(res => {
			if (res.success) {
				providers.map(user => {
					if (user._id == userId) {
						user.isActive = userState;
					}
					return user;
				})
				this.setState({
					providers: JSON.parse(JSON.stringify(providers)),
					isConfirmModal: false,
				});
			}
		}).catch(err => {
			message.error(err.message);
		})
	}

	handleCancel = () => {
		this.setState({ isConfirmModal: false });
	}

	openModalProviderDetail = (school) => {
		this.setState({ visibleProviderDetail: true, selectedProvider: school });
	}

	closeModalProviderDetail = () => {
		this.setState({ visibleProviderDetail: false, selectedProvider: undefined });
	}

	getHolidays = async () => {
		try {
			const usa_url = `${BASE_CALENDAR_URL}/${USA_CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${GOOGLE_CALENDAR_API_KEY}`
			const jewish_url = `${BASE_CALENDAR_URL}/${JEWISH_CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${GOOGLE_CALENDAR_API_KEY}`

			const usa_data = await fetch(usa_url).then(response => response.json());
			const jewish_data = await fetch(jewish_url).then(response => response.json());

			this.setState({
				jewishHolidays: jewish_data?.items ?? [],
				legalHolidays: usa_data?.items ?? [],
			});
		} catch (error) {
			this.setState({ jewishHolidays: [], legalHolidays: [] });
		}
	}

	render() {
		const { jewishHolidays, legalHolidays, pageNumber, pageSize, searchAddress, searchEmail, searchName, searchUsername, selectedServices, selectedStatus, totalSize, visibleInputCode, providers, isConfirmModal, confirmMessage, loading, selectedProvider, visibleProviderDetail } = this.state;
		const { skillSet, user } = store.getState().auth;
		const skills = JSON.parse(JSON.stringify(skillSet ?? []))?.map(skill => { skill['label'] = skill.name, skill['value'] = skill._id; return skill; });
		const columns = [
			{
				title: 'User Name', dataIndex: 'username', key: 'username', fixed: 'left',
				sorter: (a, b) => a.username > b.username ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							name='SearchName'
							ref={this.searchInput}
							placeholder={`Search Username`}
							value={searchUsername}
							onChange={e => {
								this.setState({ searchUsername: e.target.value });
								setSelectedKeys(e.target.value ? [e.target.value] : []);
							}}
							onPressEnter={() => {
								confirm();
								this.getProviderList();
							}}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => {
									confirm();
									this.getProviderList();
								}}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => {
									this.setState({ searchUsername: '' }, () => {
										this.getProviderList();
									});
									clearFilters();
									confirm();
								}}
								size="small"
								style={{ width: 90 }}
							>
								Reset
							</Button>
						</Space>
					</div>
				),
				filterIcon: (filtered) => (
					<SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
				),
				onFilterDropdownOpenChange: visible => {
					if (visible) {
						setTimeout(() => this.searchInput.current?.select(), 100);
					}
				},
			},
			{
				title: 'Email', dataIndex: 'email', key: 'email',
				sorter: (a, b) => a.email > b.email ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							name='SearchName'
							ref={this.searchInput}
							placeholder={`Search Email`}
							value={searchEmail}
							onChange={e => {
								this.setState({ searchEmail: e.target.value });
								setSelectedKeys(e.target.value ? [e.target.value] : []);
							}}
							onPressEnter={() => {
								confirm();
								this.getProviderList();
							}}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => {
									confirm();
									this.getProviderList();
								}}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => {
									this.setState({ searchEmail: '' }, () => {
										this.getProviderList();
									});
									clearFilters();
									confirm();
								}}
								size="small"
								style={{ width: 90 }}
							>
								Reset
							</Button>
						</Space>
					</div>
				),
				filterIcon: (filtered) => (
					<SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
				),
				onFilterDropdownOpenChange: visible => {
					if (visible) {
						setTimeout(() => this.searchInput.current?.select(), 100);
					}
				},
			},
			{
				title: 'Provider Name', dataIndex: 'providerInfo', key: 'providername',
				sorter: (a, b) => (a?.providerInfo?.firstName || '') + (a?.providerInfo?.lastName || '') > (b?.providerInfo?.firstName || '') + (a?.providerInfo?.lastName || '') ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							name='SearchName'
							ref={this.searchInput}
							placeholder={`Search Name`}
							value={searchName}
							onChange={e => {
								this.setState({ searchName: e.target.value });
								setSelectedKeys(e.target.value ? [e.target.value] : []);
							}}
							onPressEnter={() => {
								confirm();
								this.getProviderList();
							}}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => {
									confirm();
									this.getProviderList();
								}}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => {
									this.setState({ searchName: '' }, () => {
										this.getProviderList();
									});
									clearFilters();
									confirm();
								}}
								size="small"
								style={{ width: 90 }}
							>
								Reset
							</Button>
						</Space>
					</div>
				),
				filterIcon: (filtered) => (
					<SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
				),
				onFilterDropdownOpenChange: visible => {
					if (visible) {
						setTimeout(() => this.searchInput.current?.select(), 100);
					}
				},
				render: (providerInfo) => `${providerInfo?.firstName} ${providerInfo?.lastName}`
			},
			{
				title: 'Services', dataIndex: 'providerInfo', key: 'skillSet',
				filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
					<div className='service-dropdown'>
						<Checkbox.Group
							options={skills}
							value={selectedServices}
							onChange={(values) => {
								this.setState({ selectedServices: values });
								setSelectedKeys(values);
							}}
						/>
						<div className='service-dropdown-footer'>
							<Button type="primary" size="small" onClick={() => {
								confirm();
								this.getProviderList();
							}}>
								Filter
							</Button>
							<Button size="small" onClick={() => {
								this.setState({ selectedServices: [] }, () => {
									this.getProviderList();
								});
								clearFilters();
								confirm();
							}}>
								Reset
							</Button>
						</div>
					</div>
				),
				filterIcon: filtered => (
					<FilterFilled style={{ color: filtered ? '#3E92CF' : undefined }} />
				),
				render: (providerInfo) => <div className='services grid grid-columns-2'>{providerInfo?.skillSet?.map((skill, index) => (<div key={index} className='services'>{skill.name}</div>))}</div>,
			},
			{
				title: 'Address', dataIndex: 'providerInfo', key: 'address',
				sorter: (a, b) => a?.providerInfo?.serviceAddress > b?.providerInfo?.serviceAddress ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							name='SearchName'
							ref={this.searchInput}
							placeholder={`Search Address`}
							value={searchAddress}
							onChange={e => {
								this.setState({ searchAddress: e.target.value });
								setSelectedKeys(e.target.value ? [e.target.value] : []);
							}}
							onPressEnter={() => {
								confirm();
								this.getProviderList();
							}}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => {
									confirm();
									this.getProviderList();
								}}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => {
									this.setState({ searchAddress: '' }, () => {
										this.getProviderList();
									});
									clearFilters();
									confirm();
								}}
								size="small"
								style={{ width: 90 }}
							>
								Reset
							</Button>
						</Space>
					</div>
				),
				filterIcon: (filtered) => (
					<SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
				),
				onFilterDropdownOpenChange: visible => {
					if (visible) {
						setTimeout(() => this.searchInput.current?.select(), 100);
					}
				},
				render: (providerInfo) => providerInfo?.serviceAddress,
			},
			{
				title: 'Active', dataIndex: 'isActive', key: 'isActive',
				filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
					<div className='service-dropdown'>
						<Checkbox.Group
							options={[
								{ label: 'True', value: 1 },
								{ label: 'False', value: 0 },
							]}
							value={selectedStatus}
							onChange={(values) => {
								this.setState({ selectedStatus: values });
								setSelectedKeys(values);
							}}
						/>
						<div className='service-dropdown-footer'>
							<Button type="primary" size="small" onClick={() => {
								confirm();
								this.getProviderList();
							}}>
								Filter
							</Button>
							<Button size="small" onClick={() => {
								this.setState({ selectedStatus: [] }, () => {
									this.getProviderList();
								});
								clearFilters();
								confirm();
							}}>
								Reset
							</Button>
						</div>
					</div>
				),
				filterIcon: filtered => (
					<FilterFilled style={{ color: filtered ? '#3E92CF' : undefined }} />
				),
				render: (isActive) => isActive ? 'True' : 'False',
			},
			{
				title: 'Action', key: 'action', fixed: 'right', render: (user) => (
					<Space size="middle">
						<span className='text-primary cursor' onClick={() => this.onShowModalInputCode(user)}>Edit</span>
						<span className='text-red cursor' onClick={() => this.handleActivate(user._id, user.isActive ? 0 : 1)}>{user.isActive ? 'Deactivate' : 'Activate'}</span>
					</Space>
				),
			},
		];

		if (user?.role < 900) {
			columns.splice(-1);
		}

		const modalInputCodeProps = {
			visible: visibleInputCode,
			onSubmit: this.verifyCode,
			onCancel: this.onCloseModalInputCode,
		}

		const confirmModalProps = {
			visible: isConfirmModal,
			message: confirmMessage,
			onSubmit: this.handleConfirm,
			onCancel: this.handleCancel,
		}

		const modalProviderDetailProps = {
			visible: visibleProviderDetail,
			onSubmit: this.closeModalProviderDetail,
			onCancel: this.closeModalProviderDetail,
			jewishHolidays: jewishHolidays,
			legalHolidays: legalHolidays,
			provider: selectedProvider,
			auth: store.getState().auth,
		}

		return (
			<div className="full-layout page providerlist-page">
				<div className='div-title-admin'>
					<p className={`font-16 font-500 ${store.getState().auth.user.role === 3 ? 'p-0' : ''}`}>{intl.formatMessage(mgsSidebar.providerList)}</p>
					<Divider />
				</div>
				<Space direction='vertical' className='flex'>
					<Table bordered size='middle' pagination={false} dataSource={providers} columns={columns} scroll={{ x: 1200, y: 'calc(100vh - 260px)' }} onRow={(school) => ({
						onClick: (e) => (e.target.className.includes('ant-table-cell') || e.target.className.includes('services')) && this.openModalProviderDetail(school),
						onDoubleClick: (e) => (e.target.className.includes('ant-table-cell') || e.target.className.includes('services')) && this.openModalProviderDetail(school),
					})} />
					<Pagination current={pageNumber} total={totalSize} pageSize={pageSize} pageSizeOptions={true} onChange={this.handleChangePagination} />
				</Space>
				{visibleInputCode && <ModalInputCode {...modalInputCodeProps} />}
				{visibleProviderDetail && <ModalProviderDetail {...modalProviderDetailProps} />}
				<ModalConfirm {...confirmModalProps} />
				<PageLoading loading={loading} isBackground={true} />
			</div>
		);
	}
}
