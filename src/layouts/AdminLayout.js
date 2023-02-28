import React from 'react';
import { Layout, Button } from 'antd';
import { Switch } from 'dva/router';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';
import MainHeader from '../components/MainHeader';
import LeftSiderBar from '../components/SideBar';
import PropTypes from 'prop-types';
import '../assets/styles/index.less';
import './styles/main.less';
import { checkPermission } from '../utils/auth/checkPermission';
import { routerLinks } from "../routes/constant";
import { setUser } from '../redux/features/authSlice';
import { store } from '../redux/store';
const { Header, Sider, Content } = Layout;

class AdminLayout extends React.PureComponent {
	constructor(props) {
		super(props);
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
			})
			return;
		} else {
			this.props.history.push('/');
		}
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