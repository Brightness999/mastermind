import React, { createRef } from 'react';
import { Divider, Table, Space, Button, Input, message, Pagination, Checkbox } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux'
import { compose } from 'redux'
import { FilterFilled, SearchOutlined } from '@ant-design/icons';
import moment from 'moment';

import mgsSidebar from 'components/SideBar/messages';
import { routerLinks } from 'routes/constant';
import { ModalConfirm, ModalInputCode } from 'components/Modal';
import request from 'utils/api/request';
import { activateUser, getUsers } from 'utils/api/apiList';
import { removeRegisterData } from 'src/redux/features/registerSlice';
import { setSelectedUser } from 'src/redux/features/authSlice';
import PageLoading from 'components/Loading/PageLoading';

class UserManager extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visibleInputCode: false,
			users: [],
			isConfirmModal: false,
			confirmMessage: '',
			userId: '',
			userState: 1,
			selectedUser: {},
			loading: false,
			pageSize: 10,
			pageNumber: 1,
			totalSize: 0,
			selectedStatus: [],
			selectedRoles: [],
			searchEmail: '',
			searchUsername: '',
		};
		this.searchInput = createRef(null);
	}

	componentDidMount() {
		this.getUserList();
	}

	handleChangePagination = (newPageNumber, newPageSize) => {
		this.setState({ pageNumber: newPageNumber, pageSize: newPageSize }, () => {
			this.getUserList(newPageNumber, newPageSize);
		});
	}

	getUserList = () => {
		this.setState({ loading: true });
		const { pageNumber, pageSize, searchEmail, searchUsername, selectedRoles, selectedStatus } = this.state;
		const postData = {
			pageNumber, pageSize,
			email: searchEmail,
			username: searchUsername,
			roles: selectedRoles,
			status: selectedStatus,
		}

		request.post(getUsers, postData).then(result => {
			const { success, data } = result;
			this.setState({ loading: false });
			if (success) {
				this.setState({
					users: data?.users?.map((user, i) => {
						user['key'] = i; return user;
					}) ?? [],
					totalSize: data?.total,
				});
			}
		}).catch(err => {
			this.setState({ loading: false });
			message.error(err.message);
		})
	}

	handleNewUser = () => {
		this.props.removeRegisterData();
		this.props.history.push(routerLinks.CreateAccountForAdmin);
	}

	onShowModalInputCode = (user) => {
		this.setState({ visibleInputCode: true, selectedUser: user });
	}

	onCloseModalInputCode = () => {
		this.setState({ visibleInputCode: false });
	}

	verifyCode = (code) => {
		if (code == 613) {
			this.onCloseModalInputCode();
			this.props.setSelectedUser(this.state.selectedUser);
			this.props.history.push(routerLinks.ChangeUserProfile);
		} else {
			message.warning('Invalid code. Try again.');
		}
	}

	handleActivate = (id, state) => {
		this.setState({
			isConfirmModal: true,
			confirmMessage: <span>Are you sure you want to <span className='text-bold'>{state ? 'activate' : 'deactivate'}</span> this user?</span>,
			userId: id,
			userState: state,
		});
	}

	handleConfirm = () => {
		const data = {
			userId: this.state.userId,
			isActive: this.state.userState
		};

		request.post(activateUser, data).then(() => {
			this.state.users.map(user => {
				if (user._id == this.state.userId) {
					user.isActive = this.state.userState;
					user.updatedAt = new Date().toString();
				}
				return user;
			})
			this.setState({
				users: JSON.parse(JSON.stringify(this.state.users)),
				isConfirmModal: false,
			});
		}).catch(err => {
			message.error(err.message);
		})
	}

	handleCancel = () => {
		this.setState({ isConfirmModal: false });
	}

	render() {
		const { pageNumber, pageSize, searchEmail, searchUsername, selectedRoles, selectedStatus, totalSize, visibleInputCode, users, isConfirmModal, confirmMessage, loading } = this.state;
		const columns = [
			{
				title: 'UserName', dataIndex: 'username', key: 'name', fixed: 'left',
				sorter: (a, b) => a.username > b.username ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							name='SearchName'
							ref={this.searchInput}
							placeholder={`Search Username`}
							value={searchUsername}
							onChange={e => {
								setSelectedKeys(e.target.value ? [e.target.value] : []);
								this.setState({ searchUsername: e.target.value });
							}}
							onPressEnter={() => {
								confirm();
								this.getUserList();
							}}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => {
									confirm();
									this.getUserList();
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
									this.setState({ searchUsername: '' }, () => {
										this.getUserList();
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
				}
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
								this.getUserList();
							}}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => {
									confirm();
									this.getUserList();
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
										this.getUserList();
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
				}
			},
			{
				title: 'Role', dataIndex: 'role', key: 'role',
				filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
					<div className='service-dropdown'>
						<Checkbox.Group
							options={[
								{ label: 'Admin', value: 999 },
								{ label: 'Consultant', value: 100 },
								{ label: 'School', value: 60 },
								{ label: 'Provider', value: 30 },
								{ label: 'Parent', value: 3 },
							]}
							value={selectedRoles}
							onChange={(values) => {
								this.setState({ selectedRoles: values });
								setSelectedKeys(values);
							}}
						/>
						<div className='service-dropdown-footer'>
							<Button type="primary" size="small" onClick={() => {
								confirm();
								this.getUserList();
							}}>
								Filter
							</Button>
							<Button size="small" onClick={() => {
								clearFilters();
								confirm();
								this.setState({ selectedRoles: [] }, () => {
									this.getUserList();
								});
							}}>
								Reset
							</Button>
						</div>
					</div>
				),
				filterIcon: filtered => (
					<FilterFilled style={{ color: filtered ? '#3E92CF' : undefined }} />
				),
				render: (role) => {
					switch (role) {
						case 1000: return 'Super Admin';
						case 999: return 'Admin';
						case 3: return 'Parent';
						case 30: return 'Provider';
						case 60: return 'School';
						case 100: return 'Consultant';
						default: return 'Banner User';
					}
				},
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
								this.getUserList();
							}}>
								Filter
							</Button>
							<Button size="small" onClick={() => {
								clearFilters();
								confirm();
								this.setState({ selectedStatus: [] }, () => {
									this.getUserList();
								});
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
				title: 'Last Activity', dataIndex: 'activity', key: 'lastActivity', type: 'datetime',
				sorter: (a, b) => a?.activity?.createdAt > b?.activity?.createdAt ? 1 : -1,
				render: (activity) => activity?.createdAt ? moment(activity?.createdAt)?.format('MM/DD/YYYY hh:mm A') : '',
			},
			{
				title: 'Action', key: 'action', fixed: 'right',
				render: (user) => (
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

		return (
			<div className="full-layout page usermanager-page">
				<div className='div-title-admin'>
					<p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.userManager)}</p>
					<Divider />
				</div>
				<div className='text-right mb-20'>
					<Button type='primary' onClick={() => this.handleNewUser()}>Create New User</Button>
				</div>
				<Space direction='vertical' className='flex'>
					<Table bordered size='middle' pagination={false} dataSource={users} columns={columns} scroll={{ x: 1000 }} />
					<Pagination current={pageNumber} total={totalSize} pageSize={pageSize} pageSizeOptions={true} onChange={this.handleChangePagination} />
				</Space>
				{visibleInputCode && <ModalInputCode {...modalInputCodeProps} />}
				{isConfirmModal && <ModalConfirm {...confirmModalProps} />}
				<PageLoading loading={loading} isBackground={true} />
			</div>
		);
	}
}

const mapStateToProps = state => ({
	user: state.auth.user,
})

export default compose(connect(mapStateToProps, { removeRegisterData, setSelectedUser }))(UserManager);