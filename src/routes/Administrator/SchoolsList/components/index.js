import { Divider, Table, Space, Button, Input, message } from 'antd';
import { routerLinks } from '../../../constant';
import { ModalConfirm, ModalInputCode } from '../../../../components/Modal';
import React, { createRef } from 'react';
import intl from 'react-intl-universal';
import mgsSidebar from '../../../../components/SideBar/messages';
import { checkPermission } from '../../../../utils/auth/checkPermission';
import request from '../../../../utils/api/request';
import { SearchOutlined } from '@ant-design/icons';
import { activateUser, getSchools } from '../../../../utils/api/apiList';
import PageLoading from '../../../../components/Loading/PageLoading';
import { setSelectedUser } from '../../../../redux/features/authSlice';
import { store } from '../../../../redux/store';

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visibleInputCode: false,
			schools: [],
			userRole: -1,
			isConfirmModal: false,
			confirmMessage: '',
			userId: '',
			userState: 1,
			loading: false,
		};
		this.searchInput = createRef(null);
	}

	componentDidMount() {
		if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
			this.setState({ loading: true });
			checkPermission().then(loginData => {
				loginData.role < 900 && this.props.history.push(routerLinks.Dashboard);
				request.post(getSchools).then(result => {
					this.setState({ loading: false });
					const { success, data } = result;
					if (success) {
						this.setState({
							schools: data?.map((user, i) => {
								user['key'] = i; return user;
							}) ?? []
						});
					}
				}).catch(err => {
					message.error(err.message);
					this.setState({ loading: false });
				})
				this.setState({ userRole: loginData.role });
			}).catch(err => {
				this.props.history.push('/');
			})
		}
	}

	handleNewSchool = () => {
		this.props.history.push(routerLinks.CreateAccountForAdmin);
	}

	onShowModalInputCode = (user) => {
		this.setState({ visibleInputCode: true, selectedUser: user })
	}

	onCloseModalInputCode = () => {
		this.setState({ visibleInputCode: false })
	}

	verifyCode = (code) => {
		if (code == 613) {
			this.onCloseModalInputCode();
			store.dispatch(setSelectedUser(this.state.selectedUser));
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
			console.log('activate user error---', err);
			message.error(err.message);
		})
	}

	handleCancel = () => {
		this.setState({ isConfirmModal: false });
	}

	render() {
		const { visibleInputCode, schools, isConfirmModal, confirmMessage, loading } = this.state;
		const columns = [
			{ title: 'User Name', dataIndex: 'username', key: 'username', sorter: (a, b) => a.username > b.username ? 1 : -1 },
			{ title: 'Email', dataIndex: 'email', key: 'email', sorter: (a, b) => a.email > b.email ? 1 : -1 },
			{ title: 'School Name', dataIndex: 'schoolInfo', key: 'schoolname', sorter: (a, b) => a?.schoolInfo?.name > b?.schoolInfo?.name ? 1 : -1, render: (schoolInfo) => schoolInfo?.name },
			{
				title: 'Address', dataIndex: 'schoolInfo', key: 'address',
				sorter: (a, b) => a?.schoolInfo?.valueForContact > b?.schoolInfo?.valueForContact ? 1 : -1, render: (schoolInfo) => schoolInfo?.valueForContact,
				filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							ref={this.searchInput}
							placeholder={`Search Address`}
							value={selectedKeys[0]}
							onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
							onPressEnter={() => confirm()}
							style={{ marginBottom: 8, display: 'block' }}
						/>
						<Space>
							<Button
								type="primary"
								onClick={() => confirm()}
								icon={<SearchOutlined />}
								size="small"
								style={{ width: 90 }}
							>
								Search
							</Button>
							<Button
								onClick={() => clearFilters() && confirm()}
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
				onFilter: (value, record) => record?.schoolInfo?.valueForContact.toString().toLowerCase().includes((value).toLowerCase()),
				onFilterDropdownOpenChange: visible => {
					if (visible) {
						setTimeout(() => this.searchInput.current?.select(), 100);
					}
				}
			},
			{
				title: 'Active', dataIndex: 'isActive', key: 'isActive',
				render: (isActive) => isActive ? 'True' : 'False',
				filters: [
					{ text: 'True', value: 1 },
					{ text: 'False', value: 0 },
				],
				onFilter: (value, record) => record.isActive == value,
			},
			{
				title: 'Action', key: 'action', render: (user) => (
					<Space size="middle">
						<a className='btn-blue' onClick={() => this.onShowModalInputCode(user)}>Edit</a>
						<a className='btn-red' onClick={() => this.handleActivate(user._id, user.isActive ? 0 : 1)}>{user.isActive ? 'Deactivate' : 'Activate'}</a>
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
					<p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.schoolsList)}</p>
					<Divider />
				</div>
				<Table bordered size='middle' dataSource={schools} columns={columns} />
				{visibleInputCode && <ModalInputCode {...modalInputCodeProps} />}
				<ModalConfirm {...confirmModalProps} />
				<PageLoading loading={loading} isBackground={true} />
			</div>
		);
	}
}
