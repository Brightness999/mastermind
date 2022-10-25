import { Divider, Table, Space, Button, Modal, Input } from 'antd';
import { routerLinks } from '../../../constant';
import { ModalConfirm, ModalEditUser } from '../../../../components/Modal';
import React, { createRef } from 'react';
import intl from 'react-intl-universal';
import mgsSidebar from '../../../../components/SideBar/messages';
import './index.less';
import { checkPermission } from '../../../../utils/auth/checkPermission';
import request, { generateSearchStructure } from '../../../../utils/api/request';
import { SearchOutlined } from '@ant-design/icons';

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visibleEdit: false,
			users: [],
			userRole: -1,
			isConfirmModal: false,
			confirmMessage: '',
			userId: '',
			userState: 1,
		};
		this.searchInput = createRef(null);
	}

	componentDidMount() {
		if (!!localStorage.getItem('token') && localStorage.getItem('token').length > 0) {
			checkPermission().then(loginData => {
				loginData.user.role < 900 && this.props.history.push(routerLinks.Dashboard);
				request.post('admin/get_users').then(result => {
					if (result.success) {
						this.setState({
							users: result.data?.map((user, i) => {
								user['key'] = i; return user;
							}) ?? []
						});
					}
				})
				this.setState({ userRole: loginData.user.role });
			}).catch(err => {
				console.log(err);
				this.props.history.push('/');
			})
		}
	}

	handleNewUser = () => {
		localStorage.removeItem('token');
		this.props.history.push(routerLinks.CreateAccount);
	}

	onShowModalEdit = () => {
		this.setState({ visibleEdit: true })
	}

	onCloseModalEdit = () => {
		this.setState({ visibleEdit: false })
	}

	handleActivate = (id, state) => {
		this.setState({
			isConfirmModal: true,
			confirmMessage: `Are you sure you want to ${state ? 'activate' : 'deactivate'} this user?`,
			userId: id,
			userState: state,
		});
	}

	handleConfirm = () => {
		request.post('admin/activate_user', { userId: this.state.userId, isActive: this.state.userState }).then(() => {
			this.state.users.map(user => {
				if (user._id == this.state.userId) {
					user.isActive = this.state.userState;
				}
				return user;
			})
			this.setState({
				users: JSON.parse(JSON.stringify(this.state.users)),
				isConfirmModal: false,
			});

		}).catch(err => {
			console.log('activate user error---', err);
		})
	}

	handleCancel = () => {
		this.setState({ isConfirmModal: false });
	}

	render() {
		const { visibleEdit, users, isConfirmModal, confirmMessage } = this.state;
		const columns = [
			{
				title: 'UserName', dataIndex: 'username', key: 'name',
				sorter: (a, b) => a.username > b.username ? 1 : -1,
				filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							ref={this.searchInput}
							placeholder={`Search User Name`}
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
								onClick={() => clearFilters()}
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
				onFilter: (value, record) =>
					record['username']
						.toString()
						.toLowerCase()
						.includes((value).toLowerCase()),
				onFilterDropdownOpenChange: visible => {
					if (visible) {
						setTimeout(() => this.searchInput.current?.select(), 100);
					}
				}
			},
			{ title: 'Email', dataIndex: 'email', key: 'email', sorter: (a, b) => a.email > b.email ? 1 : -1 },
			{
				title: 'Role', dataIndex: 'role', key: 'role', render: (role) => {
					switch (role) {
						case 999: return 'Admin';
						case 3: return 'Parent';
						case 30: return 'Provider';
						case 60: return 'School';
						case 100: return 'Consultant';
						default: return 'Banner User';
					}
				},
				filters: [
					{ text: 'Admin', value: 999 },
					{ text: 'Parent', value: 3 },
					{ text: 'Provider', value: 30 },
					{ text: 'School', value: 60 },
					{ text: 'Consultant', value: 100 },
				],
				onFilter: (value, record) => record.role == value,
			},
			{ title: 'Active', dataIndex: 'isActive', key: 'isActive', render: (isActive) => isActive ? 'True' : 'False', sorter: (a, b) => a.isActive - b.isActive },
			{
				title: 'Action', key: 'action', render: (user) => (
					<Space size="middle">
						<a className='btn-blue' onClick={() => this.onShowModalEdit()}>Edit</a>
						<a className='btn-red' onClick={() => this.handleActivate(user._id, user.isActive ? 0 : 1)}>{user.isActive ? 'Deactivate' : 'Activate'}</a>
					</Space>
				),
			},
		];

		const modalEditUserProps = {
			visible: visibleEdit,
			onSubmit: this.onCloseModalEdit,
			onCancel: this.onCloseModalEdit,
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
				<Table bordered size='middle' dataSource={users} columns={columns} />
				<ModalEditUser {...modalEditUserProps} />
				<ModalConfirm {...confirmModalProps} />
			</div>
		);
	}
}
