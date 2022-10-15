import { Divider, Table, Space, Button, Modal } from 'antd';
import { routerLinks } from '../../../constant';
import { ModalConfirm, ModalEditUser } from '../../../../components/Modal';
import React from 'react';
import intl from 'react-intl-universal';
import mgsSidebar from '../../../../components/SideBar/messages';
import './index.less';
import { checkPermission } from '../../../../utils/auth/checkPermission';
import request, { generateSearchStructure } from '../../../../utils/api/request';

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
		}
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
			confirmMessage: `Are you sure to ${state ? 'deactivate' : 'activate'} this user?`,
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
			{ title: 'UserName', dataIndex: 'username', key: 'name' },
			{ title: 'Email', dataIndex: 'email', key: 'email' },
			{ title: 'Role', dataIndex: 'role', key: 'role', render: (role) => role == 999 ? 'Admin' : role == 3 ? 'Parent' : role == 30 ? 'Provider' : role == 60 ? 'School' : role == 100 ? 'Consultant' : 'Banned User' },
			{ title: 'Active', dataIndex: 'isActive', key: 'isActive', render: (isActive) => isActive ? 'True' : 'False' },
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
