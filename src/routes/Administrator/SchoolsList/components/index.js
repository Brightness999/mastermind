import React, { createRef } from 'react';
import { Divider, Table, Space, Button, Input, message, Pagination, Checkbox } from 'antd';
import intl from 'react-intl-universal';
import { FilterFilled, SearchOutlined } from '@ant-design/icons';

import { routerLinks, BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY, BASE_CALENDAR_URL, GOOGLE_CALENDAR_API_KEY, JEWISH_CALENDAR_REGION, USA_CALENDAR_REGION } from 'routes/constant';
import { ModalConfirm, ModalInputCode, ModalSchoolDetail } from 'components/Modal';
import mgsSidebar from 'components/SideBar/messages';
import request from 'utils/api/request';
import { activateUser, getSchools } from 'utils/api/apiList';
import PageLoading from 'components/Loading/PageLoading';
import { setSelectedUser } from 'src/redux/features/authSlice';
import { store } from 'src/redux/store';
import './index.less';

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visibleInputCode: false,
			schools: [],
			isConfirmModal: false,
			confirmMessage: '',
			userId: '',
			userState: 1,
			loading: false,
			pageSize: 10,
			pageNumber: 1,
			totalSize: 0,
			visibleSchoolDetail: false,
			selectedSchool: undefined,
			jewishHolidays: [],
			legalHolidays: [],
			searchAddress: '',
			selectedStatus: [],
			searchUsername: '',
			searchEmail: '',
			searchSchoolName: '',
		};
		this.searchInput = createRef(null);
	}

	componentDidMount() {
		this.getSchoolList();
		this.getHolidays();
	}

	handleChangePagination = (newPageNumber, newPageSize) => {
		this.setState({ pageNumber: newPageNumber, pageSize: newPageSize }, () => {
			this.getSchoolList();
		});
	}

	getSchoolList = () => {
		this.setState({ loading: true });
		const { pageNumber, pageSize, searchAddress, searchEmail, searchSchoolName, searchUsername, selectedStatus } = this.state;
		const postData = {
			pageNumber, pageSize,
			address: searchAddress,
			email: searchEmail,
			name: searchSchoolName,
			username: searchUsername,
			status: selectedStatus,
		}

		request.post(getSchools, postData).then(result => {
			this.setState({ loading: false });
			const { success, data } = result;
			if (success) {
				this.setState({
					schools: data?.schools?.map((user, i) => {
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
		this.setState({ visibleInputCode: true, selectedSchool: user })
	}

	onCloseModalInputCode = () => {
		this.setState({ visibleInputCode: false })
	}

	verifyCode = (code) => {
		if (code == 613) {
			this.onCloseModalInputCode();
			store.dispatch(setSelectedUser(this.state.selectedSchool));
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
		const { userId, userState, schools } = this.state;

		request.post(activateUser, { userId: userId, isActive: userState }).then(res => {
			if (res.success) {
				schools.map(user => {
					if (user._id == userId) {
						user.isActive = userState;
					}
					return user;
				})
				this.setState({
					schools: JSON.parse(JSON.stringify(schools)),
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

	openModalSchoolDetail = (school) => {
		this.setState({ visibleSchoolDetail: true, selectedSchool: school });
	}

	closeModalSchoolDetail = () => {
		this.setState({ visibleSchoolDetail: false, selectedSchool: undefined });
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
		const { jewishHolidays, legalHolidays, pageNumber, pageSize, searchAddress, searchEmail, searchSchoolName, searchUsername, selectedStatus, totalSize, visibleInputCode, schools, isConfirmModal, confirmMessage, loading, selectedSchool, visibleSchoolDetail } = this.state;
		const columns = [
			{
				title: 'User Name', dataIndex: 'username', key: 'username', fixed: 'left',
				sorter: (a, b) => a.username > b.username ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							name='SearchUsername'
							ref={this.searchInput}
							placeholder={`Search Username`}
							value={searchUsername}
							onChange={e => {
								setSelectedKeys(e.target.value ? [e.target.value] : []);
								this.setState({ searchUsername: e.target.value });
							}}
							onPressEnter={() => {
								confirm();
								this.getSchoolList();
							}}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => {
									confirm();
									this.getSchoolList();
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
										this.getSchoolList();
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
							name='SearchEmail'
							ref={this.searchInput}
							placeholder={`Search Email`}
							value={searchEmail}
							onChange={e => {
								setSelectedKeys(e.target.value ? [e.target.value] : []);
								this.setState({ searchEmail: e.target.value });
							}}
							onPressEnter={() => {
								confirm();
								this.getSchoolList();
							}}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => {
									confirm();
									this.getSchoolList();
								}}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => {
									clearFilters();
									confirm();
									this.setState({ searchEmail: '' }, () => {
										this.getSchoolList();
									});
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
				title: 'School Name', dataIndex: 'schoolInfo', key: 'schoolname',
				sorter: (a, b) => a?.schoolInfo?.name > b?.schoolInfo?.name ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							name='SearchSchoolName'
							ref={this.searchInput}
							placeholder={`Search School Name`}
							value={searchSchoolName}
							onChange={e => {
								setSelectedKeys(e.target.value ? [e.target.value] : []);
								this.setState({ searchSchoolName: e.target.value });
							}}
							onPressEnter={() => {
								confirm();
								this.getSchoolList();
							}}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => {
									confirm();
									this.getSchoolList();
								}}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => {
									clearFilters();
									confirm();
									this.setState({ searchSchoolName: '' }, () => {
										this.getSchoolList();
									});
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
				render: (schoolInfo) => schoolInfo?.name,
			},
			{
				title: 'Address', dataIndex: 'schoolInfo', key: 'address',
				sorter: (a, b) => a?.schoolInfo?.valueForContact > b?.schoolInfo?.valueForContact ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							name='SearchName'
							ref={this.searchInput}
							placeholder={`Search Address`}
							value={searchAddress}
							onChange={e => {
								setSelectedKeys(e.target.value ? [e.target.value] : []);
								this.setState({ searchAddress: e.target.value });
							}}
							onPressEnter={() => {
								confirm();
								this.getSchoolList();
							}}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => {
									confirm();
									this.getSchoolList();
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
										this.getSchoolList();
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
				render: (schoolInfo) => schoolInfo?.valueForContact,
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
								this.getSchoolList();
							}}>
								Filter
							</Button>
							<Button size="small" onClick={() => {
								this.setState({ selectedStatus: [] }, () => {
									this.getSchoolList();
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

		const modalSchoolDetailProps = {
			visible: visibleSchoolDetail,
			onSubmit: this.closeModalSchoolDetail,
			onCancel: this.closeModalSchoolDetail,
			jewishHolidays: jewishHolidays,
			legalHolidays: legalHolidays,
			school: selectedSchool,
			user: store.getState().auth.user,
		}

		return (
			<div className="full-layout page schoollist-page">
				<div className='div-title-admin'>
					<p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.schoolsList)}</p>
					<Divider />
				</div>
				<Space direction='vertical' className='flex'>
					<Table bordered size='middle' pagination={false} dataSource={schools} columns={columns} head scroll={{ x: 1200, y: 'calc(100vh - 260px)' }} onRow={(school) => ({
						onClick: (e) => e.target.className.includes('ant-table-cell') && this.openModalSchoolDetail(school),
						onDoubleClick: (e) => e.target.className.includes('ant-table-cell') && this.openModalSchoolDetail(school),
					})} />
					<Pagination current={pageNumber} total={totalSize} pageSize={pageSize} pageSizeOptions={true} onChange={this.handleChangePagination} />
				</Space>
				{visibleInputCode && <ModalInputCode {...modalInputCodeProps} />}
				{visibleSchoolDetail && <ModalSchoolDetail {...modalSchoolDetailProps} />}
				<ModalConfirm {...confirmModalProps} />
				<PageLoading loading={loading} isBackground={true} />
			</div>
		);
	}
}
