import React from 'react';
import { Modal, Button, Input } from 'antd';
import intl from 'react-intl-universal';
import messages from './messages';
import msgCreateAccount from '../../routes/Sign/CreateAccount/messages';
import './style/index.less';
import '../../assets/styles/login.less';
import { deletePrivateNote, updatePrivateNote } from '../../utils/api/apiList';
import request from '../../utils/api/request';
import { GoArrowLeft, GoArrowRight } from 'react-icons/go';
import { store } from '../../redux/store';

class ModalDependentDetail extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			dependent: this.props.dependent,
			academicLevels: [],
			isEdit: false,
			selectedNoteIndex: 0,
			note: this.props.dependent?.notes[0]?.note ?? '',
		}
	}

	onEdit = () => {
		this.setState({ isEdit: true });
	}

	onCancel = () => {
		this.setState({ isEdit: false });
	}

	onSave = (noteId) => {
		const { dependent, note } = this.state;
		const data = {
			_id: noteId,
			note: note,
		}
		request.post(updatePrivateNote, data).then(res => {
			if (res.success) {
				dependent.notes = dependent.notes.map(note => note._id == res.data._id ? res.data : note);
				this.setState({
					dependent: dependent,
					isEdit: false,
				});
			}
		}).catch(err => {
			console.log('update private note error---', err);
		})
	}

	onDelete = (noteId) => {
		request.post(deletePrivateNote, { noteId: noteId }).then((res) => {
			if (res.success) {
				const { dependent, selectedNoteIndex } = this.state;
				dependent.notes = dependent.notes?.filter((note => note._id != noteId));
				this.setState({
					dependent: dependent,
					note: dependent.notes[selectedNoteIndex]?.note,
				})
				if (selectedNoteIndex == dependent.notes.length) {
					this.setState({
						selectedNoteIndex: selectedNoteIndex - 1,
						note: dependent.notes[selectedNoteIndex - 1]?.note,
					});
				}
			}
		}).catch(err => {
			console.log('activate user error---', err);
		})
	}

	handlePreveNote = () => {
		const { selectedNoteIndex, dependent } = this.state;
		this.setState({
			selectedNoteIndex: selectedNoteIndex - 1,
			note: dependent.notes[selectedNoteIndex - 1]?.note,
		});
	}

	handleNextNote = () => {
		const { selectedNoteIndex, dependent } = this.state;
		this.setState({
			selectedNoteIndex: this.state.selectedNoteIndex + 1,
			note: dependent.notes[selectedNoteIndex + 1]?.note,
		});
	}

	render() {
		const { dependent, isEdit, selectedNoteIndex, note } = this.state;
		const modalProps = {
			className: 'modal-dependent',
			title: "",
			open: this.props.visible,
			onOk: this.props.onSubmit,
			onCancel: this.props.onCancel,
			closable: false,
			footer: null,
		};

		return (
			<Modal {...modalProps}>
				<div className='flex bg-primary text-white header'>
					<div className='flex-1'>
						<b className='font-20'>{`${dependent?.firstName ?? ''} ${dependent?.lastName ?? ''}`}</b>
						<div>{dependent?.currentGrade ?? ''}</div>
					</div>
					<div className='flex-1'>
						<b className='font-16'>{intl.formatMessage(msgCreateAccount.services)}</b>
						{dependent?.services?.map((service, index) => (
							<div key={index}>{service.name}</div>
						))}
					</div>
				</div>
				<div className='content p-10'>
					{dependent?.notes?.length ? (
						<div>
							<Input.TextArea
								rows={5}
								defaultValue={dependent.notes[selectedNoteIndex]?.note}
								value={note}
								disabled={!isEdit}
								onChange={e => this.setState({ note: e.target.value })}
								placeholder={intl.formatMessage(messages.privateNote)}
								className="private-note"
							/>
							<div className='text-left mt-1'>{dependent.notes[selectedNoteIndex]?.user?.role == 999 ? 'Admin' : dependent.notes[selectedNoteIndex]?.user?.username}</div>
							<div className='text-left'>{new Date(dependent.notes[selectedNoteIndex]?.updatedAt).toLocaleDateString()}</div>
							<div className='flex justify-between'>
								<GoArrowLeft size={20} className={`cursor ${selectedNoteIndex < 1 ? 'display-none' : ''}`} onClick={() => selectedNoteIndex > 0 && this.handlePreveNote()} />
								<GoArrowRight size={20} className={`cursor ${selectedNoteIndex == dependent.notes?.length - 1 ? 'display-none' : ''}`} onClick={() => selectedNoteIndex < dependent.notes?.length - 1 && this.handleNextNote()} />
							</div>
							<div className='flex justify-end gap-2 p-10'>
								{isEdit ? (
									<>
										<Button key="back" type='primary' className='w-20' onClick={this.onCancel}>
											{intl.formatMessage(messages.cancel)}
										</Button>
										<Button
											key="submit"
											type='primary'
											className='w-20'
											onClick={() => this.onSave(dependent?.notes[selectedNoteIndex]?._id)}
										>
											{intl.formatMessage(messages.save)}
										</Button>
									</>
								) : (
									<>
										<Button
											key="back"
											className='w-20'
											onClick={this.onEdit}
											disabled={dependent.notes[selectedNoteIndex]?.user?._id != store.getState().auth.user?._id}
										>
											{intl.formatMessage(messages.edit)}
										</Button>
										<Button
											key="submit"
											danger
											className='w-20'
											onClick={() => this.onDelete(dependent?.notes[selectedNoteIndex]?._id)}
											disabled={dependent.notes[selectedNoteIndex]?.user?._id != store.getState().auth.user?._id}
										>
											{intl.formatMessage(messages.delete)}
										</Button>
									</>
								)}
							</div>
						</div>
					) : (
						<div className='h-50 text-center'>No internal notes</div>
					)}
				</div>
			</Modal>
		);
	}
};

export default ModalDependentDetail;