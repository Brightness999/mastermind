import React from 'react';
import { Modal, Button, Input, Tabs, Table, Space } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgDrawer from '../DrawerDetail/messages';
import './style/index.less';
import '../../assets/styles/login.less';
import request from '../../utils/api/request'
import { } from '../../utils/api/apiList';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { SearchOutlined } from '@ant-design/icons';

class ModalFlagExpand extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeFlags: [],
			clearedFlags: [],
			skillSet: [],
		}
		this.searchInput = React.createRef(null);
	}

	componentDidMount() {
		const flags = JSON.parse(JSON.stringify(this.props.flags));
		const skillSet = JSON.parse(JSON.stringify(this.props.auth.skillSet));
		this.setState({
			activeFlags: flags?.filter(f => f.flagStatus == 1)?.map(f => { f['key'] = f._id; return f; }),
			clearedFlags: flags?.filter(f => f.flagStatus == 2)?.map(f => { f['key'] = f._id; return f; }),
			skillSet: skillSet?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; })
		})
	}

	render() {
		const { activeFlags, clearedFlags, skillSet } = this.state;
		const { user } = this.props.auth;
		const modalProps = {
			className: 'modal-referral-service',
			title: "Flags",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: (e) => e.target.className !== 'ant-modal-wrap' && this.props.onCancel(),
			width: 900,
			footer: []
		};
		const columns = [
			{
				title: 'Dependent', key: 'dependent',
				sorter: (a, b) => a.dependent?.firstName + a.dependent?.lastName > b.dependent?.firstName + b.dependent?.lastName ? 1 : -1,
				render: (appointment) => `${appointment?.dependent.firstName ?? ''} ${appointment?.dependent.lastName ?? ''}`,
				filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
					<div style={{ padding: 8 }}>
						<Input
							ref={this.searchInput}
							placeholder={`Search Dependent Name`}
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
				onFilter: (value, record) => record.dependent?.firstName?.toString()?.toLowerCase()?.includes((value).toLowerCase()) || record.dependent?.lastName?.toString()?.toLowerCase()?.includes((value).toLowerCase()),
				onFilterDropdownOpenChange: visible => {
					if (visible) {
						setTimeout(() => this.searchInput.current?.select(), 100);
					}
				},
			},
			{
				title: 'Skill', key: 'skillSet', filters: skillSet,
				onFilter: (value, record) => record.skillSet?._id == value,
				render: (record) => record.skillSet?.name,
			},
			{
				title: 'Session Type', dataIndex: 'type', key: 'sessionType',
				filters: [
					{ text: 'Evaluation', value: 2 },
					{ text: 'Standard Session', value: 3 },
					{ text: 'Subsidized Session', value: 5 },
				],
				onFilter: (value, record) => record.type == value,
				render: (type) => type == 2 ? intl.formatMessage(messages.evaluation) : type == 3 ? intl.formatMessage(messages.standardSession) : type == 5 ? intl.formatMessage(messages.subsidizedSession) : '',
			},
			{ title: 'Session Date', dataIndex: 'date', key: 'date', type: 'datetime', sorter: (a, b) => a.date > b.date ? 1 : -1, render: (date) => new Date(date).toLocaleString() },
		];

		if (user.role == 3) {
			columns.splice(1, 0, {
				title: 'Provider',
				key: 'provider',
				sorter: (a, b) => a.provider?.firstName + a.provider?.lastName > b.provider?.firstName + b.provider?.lastName ? 1 : -1,
				render: (appointment) => `${appointment?.provider.firstName ?? ''} ${appointment?.provider.lastName ?? ''}`,
			});
			columns.splice(5, 0, {
				title: 'Action', key: 'action', render: (appointment) => (
					<Space size="middle">
						<a className='btn-blue request' onClick={() => { }}>{intl.formatMessage(msgDrawer.requestClearance)}</a>
						<a className='btn-blue pay' onClick={() => { }}>{intl.formatMessage(msgDrawer.payFlag)}</a>
					</Space>
				)
			});
		} else {
			columns.splice(4, 0, {
				title: 'Action', key: 'action', render: (appointment) => (
					<Space size="middle">
						<a className='btn-blue clear' onClick={() => { }}>{intl.formatMessage(msgDrawer.clearFlag)}</a>
					</Space>
				)
			});
		}

		return (
			<Modal {...modalProps}>
				<Tabs defaultActiveKey="1" type="card" size='small'>
					<Tabs.TabPane tab={intl.formatMessage(messages.active)} key="1">
						<Table
							bordered
							size='middle'
							dataSource={activeFlags}
							columns={columns}
							className="p-10"
							onRow={(appointment) => {
								return {
									onClick: (e) => { },
									onDoubleClick: (e) => { },
								}
							}}
						/>
					</Tabs.TabPane>
					<Tabs.TabPane tab={intl.formatMessage(messages.cleared)} key="2">
						<Table
							bordered
							size='middle'
							dataSource={clearedFlags}
							columns={columns.slice(0, -1)}
							className="p-10"
							onRow={(appointment) => {
								return {
									onClick: (e) => { },
									onDoubleClick: (e) => { },
								}
							}}
						/>
					</Tabs.TabPane>
				</Tabs>
			</Modal>
		);
	}
};

const mapStateToProps = state => {
	return ({
		auth: state.auth,
	})
}

export default compose(connect(mapStateToProps))(ModalFlagExpand);