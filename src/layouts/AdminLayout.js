import React from 'react';
import { Layout, Button } from 'antd';
import { Switch } from 'dva/router';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';

import MainHeader from 'components/MainHeader';
import LeftSiderBar from 'components/SideBar';
import { checkPermission } from 'utils/auth/checkPermission';
import { routerLinks } from "routes/constant";
import { setUser, initializeAuth } from 'src/redux/features/authSlice';
import { initializeAppointments } from 'src/redux/features/appointmentsSlice';
import { store } from 'src/redux/store';
import { socketUrl } from 'utils/api/baseUrl';
import '../assets/styles/index.less';
import './styles/main.less';

const { Header, Sider, Content } = Layout;

class AdminLayout extends React.PureComponent {
	constructor(props) {
		super(props);
		this.socket = undefined;
		this.state = {
			route: this.props.routerData.childRoutes,
			collapsed: false,
		};
	}

	componentDidMount() {
		const token = Cookies.get('tk');
		if (token?.length > 0) {
			checkPermission().then(loginData => {
				loginData?.role < 900 && this.props.history.push(routerLinks.Dashboard);
				store.dispatch(setUser(loginData));
				this.handleSocketEvents();
			}).catch(err => {
				Cookies.remove('tk');
				this.logout();
				this.props.history.push(routerLinks.Home);
			})
			return;
		} else {
			this.logout();
			this.props.history.push(routerLinks.Home);
		}
	}

	logout = () => {
		store.dispatch(initializeAuth());
		store.dispatch(initializeAppointments());
	}

	handleSocketEvents = () => {
		let opts = {
			query: {
				token: Cookies.get('tk'),
			},
			withCredentials: true,
			autoConnect: true,
		};
		this.socket = io(socketUrl, opts);
		this.socket.on('connect_error', e => {
			console.log('connect error ', e);
		});

		this.socket.on('connect', () => {
			console.log('socket connect success');
			this.socket.emit('join_room', this.props.auth?.user?._id);
		});

		this.socket.on('disconnect', e => {
			console.log('socket disconnect', e);
		});
	}

	toggleCollapsed = () => {
		this.setState({ collapsed: !this.state.collapsed });
	};

	render() {
		const { route, collapsed } = this.state;

		return (
			<Layout className="full-layout admin-layout">
				<Header>
					<MainHeader />
				</Header>
				<Layout>
					<Sider trigger={null} collapsible collapsed={collapsed}>
						<LeftSiderBar />
					</Sider>
					<Content>
						<Button
							type="primary"
							onClick={this.toggleCollapsed}
							className='btn-collapsed'
						>
							{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						</Button>
						<Switch>
							{route}
						</Switch>
					</Content>
				</Layout>
			</Layout>
		);
	}
}

AdminLayout.propTypes = {
	routerData: PropTypes.object,
};

export default AdminLayout;