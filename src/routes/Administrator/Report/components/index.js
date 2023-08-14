import React from 'react';
import { Divider, Select, DatePicker, Button, Checkbox, message } from 'antd';
import intl from 'react-intl-universal';
import { FaDownload } from 'react-icons/fa';
import { CSVLink } from "react-csv";
import moment from 'moment';

import { ReportTypes } from 'routes/constant';
import mgsSidebar from 'components/SideBar/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import PageLoading from 'components/Loading/PageLoading';
import { store } from 'src/redux/store';
import request from 'utils/api/request';
import { getDataForReport, getInvoicesForReport, getNotes, getSubsidizedSessions } from 'utils/api/apiList';
import './index.less';

export default class extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			reportType: '',
			csvData: [],
			csvHeaders: [],
			invoices: [],
			subsidizedSessions: [],
			notes: {},
			providers: [],
			dependents: [],
			schools: [],
			selectedCommunities: [],
			selectedSchools: [],
			selectedProviders: [],
			selectedDependents: [],
			allProviders: [],
			allDependents: [],
			allSchools: [],
		};
	}

	componentDidMount() {
		this.setState({ loading: true });
		request.post(getDataForReport).then(res => {
			this.setState({ loading: false });
			const { success, data } = res;
			if (success) {
				this.setState({
					allDependents: data.dependents,
					allProviders: data.providers,
					allSchools: data.schools,
					dependents: data.dependents,
					providers: data.providers,
					schools: data.schools,
				})
			}
		}).catch((err) => {
			this.setState({ loading: false });
			message.error(err.response?.data?.message || err.message);
		})
	}

	getInvoicesList = () => {
		this.setState({ loading: true });

		request.post(getInvoicesForReport).then(res => {
			this.setState({ loading: false });
			if (res.success) {
				this.setState({ invoices: res.data });
			}
		}).catch(err => {
			message.error(err.response?.data?.message || err.message);
			this.setState({ loading: false });
		})
	}

	getSubsidizedSessionsList = () => {
		this.setState({ loading: true });
		request.post(getSubsidizedSessions).then(res => {
			this.setState({ loading: false });
			if (res.success) {
				this.setState({
					subsidizedSessions: res.data,
					csvData: [{ 'Count of all subsidized sessions': res.data.length }] || []
				});
			}
		}).catch((err) => {
			message.error(err.response?.data?.message || err.message);
			this.setState({ loading: false });
		})
	}

	getNotesList = () => {
		this.setState({ loading: true });
		request.post(getNotes).then(res => {
			this.setState({ loading: false });
			if (res.success) {
				const notes = [...res.data.publicFeedbacks, ...res.data.privateNotes];
				this.setState({
					notes: notes,
					csvData: notes?.map(note => ({
						'Notes': note.publicFeedback || note.note,
						'Student': `${note.dependent.firstName} ${note.dependent.lastName}`,
						'Date': note.date ? moment(note.date).format('MM/DD/YYYY') : moment(note.createdAt).format('MM/DD/YYYY'),
						'Provider': note.user ? `${note.user?.providerInfo?.firstName} ${note.user?.providerInfo?.lastName}` : `${note.provider?.firstName} ${note.provider?.lastName}`
					})) || []
				});
			}
		}).catch((err) => {
			message.error(err.response?.data?.message || err.message);
			this.setState({ loading: false });
		})
	}

	changeType = (type) => {
		this.setState({ reportType: type, csvData: [] });
		switch (type) {
			case 1: this.setState({ csvHeaders: ['Payment Date', 'Payment Amounts', 'Session Date', 'Session Type', 'Student', 'Provider'] }); this.getInvoicesList(); break;
			case 2: this.setState({ csvHeaders: ['Payment Date', 'Payment Amounts', 'Session Date', 'Session Type', 'Provider', 'Service', 'School'] }); this.getInvoicesList(); break;
			case 3: this.setState({ csvHeaders: ['Count of all subsidized sessions'] }); this.getSubsidizedSessionsList(); break;
			case 4: this.setState({ csvHeaders: ['Name', 'Amount', 'Date', 'Start Date', 'End Date'] }); break;
			case 5: this.setState({ csvHeaders: ['Notes', 'Student', 'Date', 'Provider'] }); this.getNotesList(); break;
		}
	}

	exportToExcel = () => {
		const { dependents, invoices, notes, providers, reportType, selectedDependents, selectedProviders, subsidizedSessions } = this.state;
		if (!reportType) return false;

		switch (reportType) {
			case 1:
				if (selectedProviders.length) {
					this.setState({
						csvData: invoices?.filter(invoice => selectedProviders.includes(invoice?.provider?._id))?.map(invoice => ({
							'Payment Date': moment(invoice.updatedAt).format('MM/DD/YYYY'),
							'Payment Amounts': invoice.paidAmount || invoice.totalPayment,
							'Session Date': moment(invoice.data[0]?.appointment?.date).format('MM/DD/YYYY'),
							'Session Type': invoice.data[0]?.appointment?.type === 2 ? 'Evaluation' : invoice.data[0]?.appointment?.type === 3 ? 'Standard Session' : invoice.data[0]?.appointment?.type === 5 ? 'Subsidized Session' : '',
							'Student': `${invoice.dependent?.firstName || ''} ${invoice.dependent?.lastName || ''}`,
							'Provider': `${invoice.provider?.firstName || ''} ${invoice.provider?.lastName || ''}`,
						})) || []
					});
					return true;
				} else {
					const providerIds = providers?.map(provider => provider?._id);
					this.setState({
						csvData: invoices?.filter(invoice => providerIds.includes(invoice?.provider?._id))?.map(invoice => ({
							'Payment Date': moment(invoice.updatedAt).format('MM/DD/YYYY'),
							'Payment Amounts': invoice.paidAmount || invoice.totalPayment,
							'Session Date': moment(invoice.data[0]?.appointment?.date).format('MM/DD/YYYY'),
							'Session Type': invoice.data[0]?.appointment?.type === 2 ? 'Evaluation' : invoice.data[0]?.appointment?.type === 3 ? 'Standard Session' : invoice.data[0]?.appointment?.type === 5 ? 'Subsidized Session' : '',
							'Student': `${invoice.dependent?.firstName || ''} ${invoice.dependent?.lastName || ''}`,
							'Provider': `${invoice.provider?.firstName || ''} ${invoice.provider?.lastName || ''}`,
						})) || []
					});
					return true;
				}
			case 2:
				if (selectedDependents.length) {
					this.setState({
						csvData: invoices?.filter(invoice => selectedDependents.includes(invoice?.dependent?._id))?.map(invoice => ({
							'Payment Date': moment(invoice.updatedAt).format('MM/DD/YYYY'),
							'Payment Amounts': invoice.paidAmount || invoice.totalPayment,
							'Session Date': moment(invoice.data[0]?.appointment?.date).format('MM/DD/YYYY'),
							'Session Type': invoice.data[0]?.appointment?.type === 2 ? 'Evaluation' : invoice.data[0]?.appointment?.type === 3 ? 'Standard Session' : invoice.data[0]?.appointment?.type === 5 ? 'Subsidized Session' : '',
							'Provider': `${invoice.provider?.firstName || ''} ${invoice.provider?.lastName || ''}`,
							'Student': `${invoice.dependent?.firstName || ''} ${invoice.dependent?.lastName || ''}`,
							'Service': invoice.data[0]?.appointment?.skillSet?.name,
							'School': invoice.dependent?.school?.name,
						})) || []
					});
					return true;
				} else {
					const dependentIds = dependents?.map(dependent => dependent?._id);
					this.setState({
						csvData: invoices?.filter(invoice => dependentIds.includes(invoice?.dependent?._id))?.map(invoice => ({
							'Payment Date': moment(invoice.updatedAt).format('MM/DD/YYYY'),
							'Payment Amounts': invoice.paidAmount || invoice.totalPayment,
							'Session Date': moment(invoice.data[0]?.appointment?.date).format('MM/DD/YYYY'),
							'Session Type': invoice.data[0]?.appointment?.type === 2 ? 'Evaluation' : invoice.data[0]?.appointment?.type === 3 ? 'Standard Session' : invoice.data[0]?.appointment?.type === 5 ? 'Subsidized Session' : '',
							'Provider': `${invoice.provider?.firstName || ''} ${invoice.provider?.lastName || ''}`,
							'Student': `${invoice.dependent?.firstName || ''} ${invoice.dependent?.lastName || ''}`,
							'Service': invoice.data[0]?.appointment?.skillSet?.name,
							'School': invoice.dependent?.school?.name,
						})) || []
					});
					return true;
				}
			case 3:
				if (selectedDependents.length && selectedProviders.length) {
					const dependentData = subsidizedSessions.reduce((a, b) => {
						if (a[b.dependent?._id]?.count) {
							a[b.dependent?._id] = { count: a[b.dependent?._id]?.count + 1, dependent: b.dependent }
						} else {
							a[b.dependent?._id] = { count: 1, dependent: b.dependent }
						}
						return a;
					}, {});
					const providerData = subsidizedSessions.reduce((a, b) => {
						if (a[b.provider?._id]?.count) {
							a[b.provider?._id] = { count: a[b.provider?._id]?.count + 1, provider: b.provider }
						} else {
							a[b.provider?._id] = { count: 1, provider: b.provider }
						}
						return a;
					}, {});

					const data = [...Object.values(dependentData)?.filter(d => selectedDependents.includes(d.dependent?._id)) || [], ...Object.values(providerData)?.filter(p => selectedProviders.includes(p.provider?._id)) || []];
					this.setState({
						csvHeaders: ['Count of all subsidized sessions', 'Student', 'Provider'],
						csvData: data.map(d => ({
							'Count of all subsidized sessions': d.count,
							'Student': `${d.dependent?.firstName || ''} ${d.dependent?.lastName || ''}`,
							'Provider': `${d.provider?.firstName || ''} ${d.provider?.lastName || ''}`,
						})) || []
					})
				} else if (selectedDependents.length && !selectedProviders.length) {
					const data = subsidizedSessions.reduce((a, b) => {
						if (a[b.dependent?._id]?.count) {
							a[b.dependent?._id] = { count: a[b.dependent?._id]?.count + 1, dependent: b.dependent }
						} else {
							a[b.dependent?._id] = { count: 1, dependent: b.dependent }
						}
						return a;
					}, {});
					this.setState({
						csvHeaders: ['Count of all subsidized sessions', 'Student'],
						csvData: Object.values(data)?.filter(d => selectedDependents.includes(d.dependent?._id))?.map(d => ({
							'Count of all subsidized sessions': d.count,
							'Student': `${d.dependent?.firstName || ''} ${d.dependent?.lastName || ''}`,
						})) || []
					})
				} else if (!selectedDependents.length && selectedProviders.length) {
					const data = subsidizedSessions.reduce((a, b) => {
						if (a[b.provider?._id]?.count) {
							a[b.provider?._id] = { count: a[b.provider?._id]?.count + 1, provider: b.provider }
						} else {
							a[b.provider?._id] = { count: 1, provider: b.provider }
						}
						return a;
					}, {});
					this.setState({
						csvHeaders: ['Count of all subsidized sessions', 'Provider'],
						csvData: Object.values(data)?.filter(p => selectedProviders.includes(p.provider?._id))?.map(p => ({
							'Count of all subsidized sessions': p.count,
							'Provider': `${p.provider?.firstName || ''} ${p.provider?.lastName || ''}`,
						})) || []
					})
				} else {
					const dependentIds = dependents?.map(dependent => dependent?._id);
					const providerIds = providers?.map(provider => provider?._id);
					const dependentData = subsidizedSessions.reduce((a, b) => {
						if (a[b.dependent?._id]?.count) {
							a[b.dependent?._id] = { count: a[b.dependent?._id]?.count + 1, dependent: b.dependent }
						} else {
							a[b.dependent?._id] = { count: 1, dependent: b.dependent }
						}
						return a;
					}, {});
					const providerData = subsidizedSessions.reduce((a, b) => {
						if (a[b.provider?._id]?.count) {
							a[b.provider?._id] = { count: a[b.provider?._id]?.count + 1, provider: b.provider }
						} else {
							a[b.provider?._id] = { count: 1, provider: b.provider }
						}
						return a;
					}, {});

					const data = [...Object.values(dependentData)?.filter(d => dependentIds.includes(d.dependent?._id)) || [], ...Object.values(providerData)?.filter(p => providerIds.includes(p.provider?._id)) || []];
					this.setState({
						csvHeaders: ['Count of all subsidized sessions', 'Student', 'Provider'],
						csvData: data.map(d => ({
							'Count of all subsidized sessions': d.count,
							'Student': `${d.dependent?.firstName || ''} ${d.dependent?.lastName || ''}`,
							'Provider': `${d.provider?.firstName || ''} ${d.provider?.lastName || ''}`,
						})) || []
					})
				}
			case 5:
				if (selectedProviders.length) {
					this.setState({
						csvData: notes?.filter(note => selectedProviders.includes(note.user?.providerInfo?._id || note.provider?._id))?.map(note => ({
							'Notes': note.publicFeedback || note.note,
							'Student': `${note.dependent.firstName} ${note.dependent.lastName}`,
							'Date': note.date ? moment(note.date).format('MM/DD/YYYY') : moment(note.updatedAt).format('MM/DD/YYYY'),
							'Provider': note.user ? `${note.user?.providerInfo?.firstName} ${note.user?.providerInfo?.lastName}` : `${note.provider?.firstName} ${note.provider?.lastName}`
						})) || []
					});
				} else {
					const providerIds = providers?.map(dependent => dependent?._id);
					this.setState({
						csvData: notes?.filter(note => providerIds.includes(note.user?.providerInfo?._id || note.provider?._id))?.map(note => ({
							'Notes': note.publicFeedback || note.note,
							'Student': `${note.dependent.firstName} ${note.dependent.lastName}`,
							'Date': note.date ? moment(note.date).format('MM/DD/YYYY') : moment(note.updatedAt).format('MM/DD/YYYY'),
							'Provider': note.user ? `${note.user?.providerInfo?.firstName} ${note.user?.providerInfo?.lastName}` : `${note.provider?.firstName} ${note.provider?.lastName}`
						})) || []
					});
				}
		}
	}

	changeSelectedCommunities = (connectionIds) => {
		const { allDependents, allProviders, allSchools } = this.state;
		if (connectionIds.length) {
			this.setState({
				dependents: allDependents.filter(dependent => connectionIds.includes(dependent?.parent?.cityConnection)),
				providers: allProviders.filter(provider => connectionIds.includes(provider?.cityConnection?._id)),
				schools: allSchools.filter(school => connectionIds.includes(school?.communityServed?._id)),
				selectedCommunities: connectionIds,
			})
		} else {
			this.setState({
				dependents: allDependents,
				providers: allProviders,
				schools: allSchools,
				selectedCommunities: [],
			});
		}
	}

	changeSelectedDependents = (dependentIds) => {
		this.setState({ selectedDependents: dependentIds })
	}

	changeSelectedProviders = (providerIds) => {
		this.setState({ selectedProviders: providerIds })
	}

	changeSelectedSchools = (schoolIds) => {
		const { selectedCommunities, allDependents, allProviders } = this.state;
		if (schoolIds.length) {
			this.setState({
				selectedSchools: schoolIds,
				dependents: allDependents.filter(dependent => schoolIds.includes(dependent?.school?._id)),
				providers: allProviders.filter(provider => provider?.serviceableSchool?.find(school => schoolIds.includes(school?._id))),
			})
		} else {
			if (selectedCommunities.length) {
				this.setState({
					selectedSchools: schoolIds,
					dependents: allDependents.filter(dependent => selectedCommunities.includes(dependent?.parent.cityConnection)),
					providers: allProviders.filter(provider => selectedCommunities.includes(provider?.cityConnection?._id)),
				})
			} else {
				this.setState({
					selectedSchools: schoolIds,
					dependents: allDependents,
					providers: allProviders,
				})
			}
		}
	}

	selectAllOptions = (option) => {
		const { allDependents, allProviders, allSchools } = this.state;
		const { user } = store.getState().auth;
		switch (option) {
			case 'community': this.changeSelectedCommunities(user.adminCommunity?.map(c => c?._id) || []); return;
			case 'school': this.changeSelectedSchools(allSchools?.map(s => s?._id) || []); return;
			case 'provider': this.changeSelectedProviders(allProviders?.map(p => p?._id)); return;
			case 'dependent': this.changeSelectedDependents(allDependents?.map(d => d?._id)); return;
		}
	}

	deselectAllOptions = (option) => {
		switch (option) {
			case 'community': this.changeSelectedCommunities([]); return;
			case 'school': this.changeSelectedSchools([]); return;
			case 'provider': this.changeSelectedProviders([]); return;
			case 'dependent': this.changeSelectedDependents([]); return;
		}
	}

	render() {
		const { loading, reportType, csvData, csvHeaders, dependents, providers, schools, selectedCommunities, selectedDependents, selectedProviders, selectedSchools } = this.state;
		const { user } = store.getState().auth;
		const communityOptions = user.adminCommunity?.map(city => ({
			label: city?.name || '',
			value: city?._id || '',
		}))
		const schoolOptions = schools?.map(school => ({
			label: school?.name || '',
			value: school?._id || '',
		}))
		const providerOptions = providers?.map(provider => ({
			label: `${provider?.firstName} ${provider?.lastName}` || '',
			value: provider?._id || '',
		}))
		const dependentOptions = dependents?.map(dependent => ({
			label: `${dependent?.firstName} ${dependent?.lastName}` || '',
			value: dependent?._id || '',
		}))

		return (
			<div className="full-layout page report-page">
				<div className='div-title-admin'>
					<p className="font-16 font-500">{intl.formatMessage(mgsSidebar.report)}</p>
					<Divider />
				</div>
				<div className='report-type'>
					<Select
						placeholder={intl.formatMessage(msgCreateAccount.type)}
						onChange={(value) => this.changeType(value)}
						className='flex-1'
					>
						{ReportTypes?.map((type, index) => (
							<Select.Option key={index} value={type.value}>{type.label}</Select.Option>
						))}
					</Select>
					<DatePicker format='MM/DD/YYYY' className='flex-1' />
					<DatePicker format='MM/DD/YYYY' className='flex-1' />
				</div>
				<div className='font-18 text-bold'>Filter by:</div>
				<div className='report-filters'>
					<div className='filter'>
						<div className='font-16'>Communities</div>
						<Checkbox.Group options={communityOptions} value={selectedCommunities} onChange={this.changeSelectedCommunities} className='options' />
						<div className='flex justify-center gap-2 mt-10'>
							<Button type='primary' size='small' onClick={() => this.selectAllOptions('community')}>Select all</Button>
							<Button type='primary' size='small' onClick={() => this.deselectAllOptions('community')}>Select none</Button>
						</div>
					</div>
					<div className='filter'>
						<div className='font-16'>Schools</div>
						<div className='options'>
							<Checkbox.Group options={schoolOptions} value={selectedSchools} onChange={this.changeSelectedSchools} className='options' />
						</div>
						<div className='flex justify-center gap-2 mt-10'>
							<Button type='primary' size='small' onClick={() => this.selectAllOptions('school')}>Select all</Button>
							<Button type='primary' size='small' onClick={() => this.deselectAllOptions('school')}>Select none</Button>
						</div>
					</div>
					{[1, 3, 5].includes(reportType) ? (
						<div className='filter'>
							<div className='font-16'>Providers</div>
							<div className='options'>
								<Checkbox.Group options={providerOptions} value={selectedProviders} onChange={this.changeSelectedProviders} className='options' />
							</div>
							<div className='flex justify-center gap-2 mt-10'>
								<Button type='primary' size='small' onClick={() => this.selectAllOptions('provider')}>Select all</Button>
								<Button type='primary' size='small' onClick={() => this.deselectAllOptions('provider')}>Select none</Button>
							</div>
						</div>
					) : null}
					{[2, 3].includes(reportType) ? (
						<div className='filter'>
							<div className='font-16'>Students</div>
							<div className='options'>
								<Checkbox.Group options={dependentOptions} value={selectedDependents} onChange={this.changeSelectedDependents} className='options' />
							</div>
							<div className='flex justify-center gap-2 mt-10'>
								<Button type='primary' size='small' onClick={() => this.selectAllOptions('dependent')}>Select all</Button>
								<Button type='primary' size='small' onClick={() => this.deselectAllOptions('dependent')}>Select none</Button>
							</div>
						</div>
					) : null}
				</div>
				<Divider />
				<CSVLink onClick={this.exportToExcel} data={csvData} headers={csvHeaders} filename="Report">
					<Button icon={<FaDownload />} type='primary' className='download' block >Download report</Button>
				</CSVLink>
				<PageLoading loading={loading} isBackground={true} />
			</div>
		);
	}
}
