import React from 'react';
import { Modal, Input, Divider, Card, Button } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import './style/index.less';
import '../../assets/styles/login.less';
import { createPrivateNote, deletePrivateNote, updatePrivateNote } from '../../utils/api/apiList';
import request from '../../utils/api/request';
import moment from 'moment';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { CheckCircleTwoTone, CloseCircleTwoTone, DeleteTwoTone, EditTwoTone } from '@ant-design/icons';
import ModalNewSubsidyRequest from './ModalNewSubsidyRequest';

class ModalDependentDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dependent: this.props.dependent,
			selectedNoteId: -1,
			note: '',
			isNew: false,
			visibleNewSubsidy: false,
		}
	}

	onEdit = (noteId) => {
		this.setState({ selectedNoteId: noteId, note: this.state.dependent?.notes?.find(n => n._id == noteId)?.note });
	}

	onCancel = () => {
		this.setState({ selectedNoteId: -1, isNew: false });
	}

	onSave = (noteId) => {
		const { dependent, note } = this.state;
		if (noteId) {
			const data = {
				_id: noteId,
				note: note,
			}
			request.post(updatePrivateNote, data).then(res => {
				const { success, data } = res;
				if (success) {
					dependent.notes = dependent.notes.map(note => note._id == data._id ? data : note);
					this.setState({
						dependent: dependent,
						selectedNoteId: -1,
					});
				}
			}).catch(err => {
				console.log('update private note error---', err);
			})
		}
	}

	onDelete = (noteId) => {
		request.post(deletePrivateNote, { noteId: noteId }).then((res) => {
			if (res.success) {
				const { dependent, selectedNoteId } = this.state;
				dependent.notes = dependent.notes?.filter((note => note._id != noteId));
				this.setState({
					dependent: dependent,
					note: dependent.notes[selectedNoteId]?.note,
				})
				if (selectedNoteId == dependent.notes.length) {
					this.setState({
						selectedNoteId: selectedNoteId - 1,
						note: dependent.notes[selectedNoteId - 1]?.note,
					});
				}
			}
		}).catch(err => {
			console.log('activate user error---', err);
		})
	}

	onAddComment = () => {
		this.setState({ note: '', isNew: true });
	}

	onCreate = () => {
		const { dependent, note } = this.state;
		const data = {
			user: this.props.user?._id,
			dependent: dependent?._id,
			note: note,
		}
		request.post(createPrivateNote, data).then(res => {
			const { success, data } = res;
			if (success) {
				this.state.dependent.notes?.push(data);
				this.setState({ dependent: this.state.dependent, isNew: false });
			}
		}).catch(err => {
			console.log('update private note error---', err);
		})
	}

	onOpenModalNewSubsidy = () => {
		this.setState({ visibleNewSubsidy: true });
	}

	onCloseModalNewSubsidy = () => {
		this.setState({ visibleNewSubsidy: false });
	}

	render() {
		const { dependent, selectedNoteId, isNew, visibleNewSubsidy } = this.state;
		const { user } = this.props;
		const modalProps = {
			className: 'modal-dependent',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			footer: null,
		};

		const modalNewSubsidyProps = {
			visible: visibleNewSubsidy,
			onSubmit: this.onCloseModalNewSubsidy,
			onCancel: this.onCloseModalNewSubsidy,
			dependent: dependent,
		};

		return (
			<Modal {...modalProps} bodyStyle={{ overflowY: 'scroll', height: '60vh' }}>
				<div className='flex bg-primary text-white header'>
					<b className='font-20'>{`${dependent?.firstName ?? ''} ${dependent?.lastName ?? ''}`}</b>
				</div>
				<Card className='bg-white'>
					<div className='flex'>
						<div className='flex-1'>
							<div><span className='text-bold'>Grade:</span> {dependent?.currentGrade ?? ''}</div>
							<div><span className='text-bold'>Age:</span> {moment().diff(moment(dependent?.birthday), 'years')}</div>
							<div><span className='text-bold'>School:</span> {dependent?.school?.name}</div>
							<div><span className='text-bold'>Birthday:</span> {moment(dependent.birthday)?.format('MM/DD/YYYY')}</div>
						</div>
						<div className='flex-1'>
							{dependent?.subsidy?.length && <a>Subsidy History</a>}
							<div><span className='text-bold'>Sessions:</span> {dependent?.appointments?.filter(d => d.status == -1 && d.flagStatus != 1)?.length ?? 0}</div>
							<div><span className='text-bold'>Flags:</span> {dependent?.appointments?.filter(d => d.flagStatus == 1)?.length ?? 0}</div>
						</div>
					</div>
					<Divider />
					<div className='flex'>
						<div className='flex-1'>
							<div className='text-bold'>Skillsets:</div>
							{dependent?.services?.map((service, index) => (
								<div key={index}>{service.name}</div>
							))}
							<br />
							<div className='text-bold'>Providers:</div>
							{[...new Set(dependent?.appointments?.filter(a => a.type != 4)?.map(a => `${a.provider?.firstName} ${a.provider?.lastName}`))].map((name, index) => (
								<div key={index}>{name}</div>
							))}
						</div>
						<Card className='flex-1'>
							<div>{dependent?.backgroundInfor ?? ''}</div>
						</Card>
					</div>
					<Divider />
					<div className='content'>
						{dependent?.notes?.length ? (
							<Card className='note-card'>
								{dependent?.notes?.map((note, index) => (
									<div key={index} className="mt-2">
										<Input.TextArea
											rows={3}
											defaultValue={note.note}
											disabled={selectedNoteId != note._id}
											onChange={e => this.setState({ note: e.target.value })}
											placeholder={intl.formatMessage(messages.privateNote)}
											className="private-note"
										/>
										<div className='flex items-center gap-5 text-italic'>
											<div className='text-left'>{note.user?.role > 900 ? 'Admin' : note.user?.username}</div>
											<div className='text-left'>{moment(note?.updatedAt).format('MM/DD/YYYY hh:mm')}</div>
										</div>
										{(user?.role > 900 || user?._id == note.user?._id) && (
											<div className='flex justify-end gap-2'>
												{selectedNoteId == note._id ? (
													<>
														<CheckCircleTwoTone twoToneColor='#02e06e' onClick={() => this.onSave(note._id)} />
														<CloseCircleTwoTone twoToneColor='#ff0000' onClick={() => this.onCancel()} />
													</>
												) : (
													<>
														<EditTwoTone onClick={() => this.onEdit(note._id)} />
														<DeleteTwoTone twoToneColor='#ff0000' onClick={() => this.onDelete(note._id)} />
													</>
												)}
											</div>
										)}
									</div>
								))}
							</Card>
						) : (
							<div className='h-50 text-center'>No internal notes</div>
						)}
						{isNew && (
							<div className="mt-2">
								<Input.TextArea
									rows={3}
									onChange={e => this.setState({ note: e.target.value })}
									placeholder={intl.formatMessage(messages.privateNote)}
									className="private-note"
								/>
								<div className='flex justify-end gap-2 mt-10'>
									<CheckCircleTwoTone twoToneColor='#02e06e' onClick={() => this.onCreate()} />
									<CloseCircleTwoTone twoToneColor='#ff0000' onClick={() => this.onCancel()} />
								</div>
							</div>
						)}
					</div>
					<div className='flex gap-5 mt-2'>
						<Button type='primary' block className={`${user?.role == 3 ? '' : 'display-none'}`} onClick={() => this.onOpenModalNewSubsidy()}>Request Subsidy</Button>
						<Button type='primary' block className={`${user?.role == 3 ? 'display-none' : ''}`} onClick={() => this.onAddComment()}>Add Comment</Button>
					</div>
				</Card>
				{visibleNewSubsidy && <ModalNewSubsidyRequest {...modalNewSubsidyProps} />}
			</Modal>
		);
	}
};

const mapStateToProps = state => {
	return ({ user: state.auth.user });
}

export default compose(connect(mapStateToProps))(ModalDependentDetail);