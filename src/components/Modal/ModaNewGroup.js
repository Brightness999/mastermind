import React from 'react';
import { Modal, Button, List, message } from 'antd';
import intl from 'react-intl-universal';
import ReactDragListView from "react-drag-listview";

import messages from './messages';
import request from '../../utils/api/request'
import './style/index.less';
import '../../assets/styles/login.less';

class ModalNewGroup extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: [],
			arrListOrderPosition: [],
			show: false,
			droppedBoxNames: []
		}
	}

	componentDidMount = () => {
		this.props.setLoadData(this.loadListHierachyForSchool);
	}

	loadListHierachyForSchool = () => {
		this.setState({ data: [], arrListOrderPosition: [] });
		request.post('schools/get_all_sub_order_by_hierachy', {}).then(result => {
			if (result.success) {
				var arr = [];
				for (var i = 0; i < result.data.length; i++) {
					arr.push(result.data[i].orderPosition);
				}
				this.setState({ data: result.data, arrListOrderPosition: arr });
			}
		})
	}

	onDragEnd = (fromIndex, toIndex) => {
		if (toIndex < 0) return; // Ignores if outside designated area
		const items = [...this.state.data];
		const item = items.splice(fromIndex, 1)[0];
		items.splice(toIndex, 0, item);
		this.setState({ data: items });
	};

	onDragEnd = (fromIndex, toIndex) => {
		if (toIndex < 0) return;
		const items = [...this.state.data];
		const item = items.splice(fromIndex, 1)[0];
		items.splice(toIndex, 0, item);
		this.setState({ data: items });
	};

	isDropped = (id) => {
		console.log('dropped item');
		return this.state.droppedBoxNames.indexOf(id) > -1;
	}

	getProviderNames = (item) => {
		var name = '';
		for (var i = 0; i < item.providers.length; i++) {
			name += item.providers[i].referredToAs ?? item.providers[i].name + ' ';
		}
		return name;
	}

	saveOrderForSubsidaries = () => {
		var list = [];
		for (var i = 0; i < this.state.data.length; i++) {
			list.push({ _id: this.state.data[i]._id, orderPosition: this.state.arrListOrderPosition[i] });
		}
		request.post('schools/sort_subsidary_by_hierachy', { orderedList: list }).then(result => {
			if (result.success) {
				message.success('Saved successfully ')
				this.props.onCancel();
			} else {
				message.error('Cannot save hierachy');
			}
		}).catch(err => {
			message.error('Cannot save hierachy');
		})
	}

	renderListItem(item, index) {
		return (
			<List.Item className="draggble">
				<div className='item-drag' data-testid={`box`}>
					<p className='font-500 mb-5'>Name: {item.student.firstName} {item.student.lastName}</p>
					<p className='font-500 mb-5'>Skill: {this.props.SkillSet[item.skillSet]}</p>
					<p className='font-500 mb-5'>Provider: {this.getProviderNames(item)}</p>
				</div>
			</List.Item>
		)
	}

	render = () => {
		const modalProps = {
			className: 'modal-new-group',
			title: "Create New Group",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			footer: [
				<Button key="back" onClick={this.props.onCancel}>
					{intl.formatMessage(messages.cancel)}
				</Button>,
				<Button key="submit" type="primary" onClick={this.saveOrderForSubsidaries}>
					{intl.formatMessage(messages.save)}
				</Button>
			]
		};

		return (
			<Modal {...modalProps}>
				<ReactDragListView nodeSelector=".ant-list-item.draggble" onDragEnd={this.onDragEnd}>
					<List
						size="small"
						bordered
						dataSource={this.state.data}
						renderItem={(item, index) => {
							const draggble =
								item !== "Racing car sprays burning fuel into crowd.";
							return this.renderListItem(item, index);
						}}
					/>
				</ReactDragListView>
			</Modal>
		);
	}
};

export default ModalNewGroup;