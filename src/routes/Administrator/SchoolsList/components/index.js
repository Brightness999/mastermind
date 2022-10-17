import { Divider, Table, Space, Button, Modal, Input } from 'antd';
import { routerLinks } from '../../../constant';
import { ModalConfirm, ModalEditUser } from '../../../../components/Modal';
import React, { createRef } from 'react';
import intl from 'react-intl-universal';
import mgsSidebar from '../../../../components/SideBar/messages';
import { checkPermission } from '../../../../utils/auth/checkPermission';
import request, { generateSearchStructure } from '../../../../utils/api/request';
import { SearchOutlined } from '@ant-design/icons';

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			visibleEdit: false,
			schools: [],
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
				request.post('admin/get_schools').then(result => {
					console.log(result.data);
					if (result.success) {
						this.setState({
							schools: result.data?.map((user, i) => {
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

	handleNewSchool = () => {
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
			confirmMessage: `Are you sure to ${state ? 'activate' : 'deactivate'} this school?`,
			userId: id,
			userState: state,
		});
	}

	handleConfirm = () => {
		request.post('admin/activate_user', { userId: this.state.userId, isActive: this.state.userState }).then(() => {
			this.state.schools.map(user => {
				if (user._id == this.state.userId) {
					user.isActive = this.state.userState;
				}
				return user;
			})
			this.setState({
				schools: JSON.parse(JSON.stringify(this.state.schools)),
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
		const { visibleEdit, schools, isConfirmModal, confirmMessage } = this.state;
		const columns = [
			{ title: 'User Name', dataIndex: 'username', key: 'username', sorter: (a, b) => a.username > b.username ? 1 : -1 },
			{ title: 'Email', dataIndex: 'email', key: 'email', sorter: (a, b) => a.email > b.email ? 1 : -1 },
			{ title: 'School Name', dataIndex: 'schoolInfo', key: 'schoolname', sorter: (a, b) => a?.schoolInfo?.name > b?.schoolInfo?.name ? 1 : -1, render: (schoolInfo) => schoolInfo?.name },
			{ title: 'Community', dataIndex: 'schoolInfo', key: 'communityserved', sorter: (a, b) => a?.schoolInfo?.communityServed?.name > b?.schoolInfo?.communityServed?.name ? 1 : -1, render: (schoolInfo) => schoolInfo?.communityServed?.name },
			{ title: 'Address', dataIndex: 'schoolInfo', key: 'address', sorter: (a, b) => a?.schoolInfo?.valueForContact > b?.schoolInfo?.valueForContact ? 1 : -1, render: (schoolInfo) => schoolInfo?.valueForContact },
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
					<p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.schoolsList)}</p>
					<Divider />
				</div>
				<div className='text-right mb-20'>
					<Button type='primary' onClick={() => this.handleNewSchool()}>Create New School</Button>
				</div>
				<Table bordered size='middle' dataSource={schools} columns={columns} />
				<ModalEditUser {...modalEditUserProps} />
				<ModalConfirm {...confirmModalProps} />
			</div>
		);
	}
}
