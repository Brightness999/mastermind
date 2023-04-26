import React, { useEffect, useState } from 'react';
import { Divider, message, Tabs } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';

import mgsSidebar from '../../../../components/SideBar/messages';
import messages from '../../../Dashboard/messages';
import msgCreateAccount from '../../../Sign/CreateAccount/messages';
import request from '../../../../utils/api/request'
import { ModalConfirm, ModalSchoolSubsidyApproval, ModalSubsidyProgress } from '../../../../components/Modal';
import { acceptSubsidyRequest, denySubsidyRequest, reorderRequests } from '../../../../utils/api/apiList';
import PageLoading from '../../../../components/Loading/PageLoading';
import { getSubsidyRequests, setSubsidyRequests } from "../../../../redux/features/appointmentsSlice";
import SchoolPending from './SchoolPending';
import SchoolApproved from './SchoolApproved';
import SchoolDeclined from './SchoolDeclined';
import AdminPreApproved from './AdminPreApproved';
import AdminDeclined from './AdminDeclined';
import AdminApproved from './AdminApproved';
import './index.less';

const SubsidyManager = (props) => {
  const { user, skillSet, academicLevels, schools } = props.auth;
  const skills = JSON.parse(JSON.stringify(skillSet ?? []))?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; });
  const grades = JSON.parse(JSON.stringify(academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
  const schoolInfos = JSON.parse(JSON.stringify(schools ?? []))?.map(s => s?.schoolInfo)?.map(school => { school['text'] = school.name, school['value'] = school._id; return school; });
  const [visibleSubsidy, setVisibleSubsidy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState(props.listSubsidy?.filter(s => s.status === 0));
  const [status, setStatus] = useState(0);
  const [selectedSubsidyId, setSelectedSubsidyId] = useState(undefined);
  const [visibleConfirm, setVisibleConfirm] = useState(false);
  const [visibleSchoolApproval, setVisibleSchoolApproval] = useState(false);

  const onShowModalSubsidy = (subsidyId) => {
    setSelectedSubsidyId(subsidyId);
    setVisibleSubsidy(true);
  }

  const onCloseModalSubsidy = () => {
    setVisibleSubsidy(false);
    setSelectedSubsidyId(undefined);
  };

  const handleReorder = (updatedList) => {
    const requestIds = updatedList?.map(a => a?._id);
    const orders = updatedList?.map(a => a.orderPosition)?.sort((a, b) => b - a);
    if (requestIds?.length > 0 && orders?.length > 0 && requestIds?.length === orders?.length) {
      request.post(reorderRequests, { requestIds, orders }).then(res => res.success && props.getSubsidyRequests({ role: user.role }));
    }
  }

  const handleChangeTab = v => {
    setRequests(props.listSubsidy?.filter(s => s.status == v));
    setStatus(v);
  }

  const onShowModalConfirm = (subsidyId) => {
    setVisibleConfirm(true);
    setSelectedSubsidyId(subsidyId);
  }

  const onCloseModalConfirm = () => {
    setVisibleConfirm(false);
  }

  const onShowModalSchoolApproval = (subsidyId) => {
    setVisibleSchoolApproval(true);
    setSelectedSubsidyId(subsidyId);
  }

  const onCloseModalSchoolApproval = () => {
    setVisibleSchoolApproval(false);
  }

  const schoolAcceptSubsidy = (data) => {
    const { selectedProvider, decisionExplanation } = data;
    setVisibleSchoolApproval(false);

    request.post(acceptSubsidyRequest, {
      subsidyId: selectedSubsidyId,
      student: requests?.find(a => a._id === selectedSubsidyId)?.student?._id,
      selectedProvider,
      decisionExplanation,
    }).then(result => {
      const { success, data } = result;
      if (success) {
        const newSubsidyRequests = JSON.parse(JSON.stringify(props.listSubsidy));
        props.setSubsidyRequests(newSubsidyRequests?.map(s => {
          if (s._id === selectedSubsidyId) {
            s.status = data.status;
          }
          return s;
        }));
      }
    }).catch(err => {
      message.error(err.message);
    })
  }

  const schoolDenySubsidy = () => {
    setVisibleConfirm(false);
    request.post(denySubsidyRequest, { subsidyId: selectedSubsidyId }).then(result => {
      const { success, data } = result;
      if (success) {
        const newSubsidyRequests = JSON.parse(JSON.stringify(props.listSubsidy));
        props.setSubsidyRequests(newSubsidyRequests?.map(s => {
          if (s._id === selectedSubsidyId) {
            s.status = data.status;
          }
          return s;
        }));
      }
    }).catch(err => {
      message.error(err.message);
    })
  }

  const items = [
    {
      key: '0',
      label: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)} {intl.formatMessage(messages.pending)}</span>,
      children: (
        <SchoolPending
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
          onShowModalSchoolApproval={onShowModalSchoolApproval}
          onShowModalConfirm={onShowModalConfirm}
        />
      ),
    },
    {
      key: '1',
      label: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)} {intl.formatMessage(messages.approved)}</span>,
      children: (
        <SchoolApproved
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          setRequests={setRequests}
          onShowModalSubsidy={onShowModalSubsidy}
          handleReorder={handleReorder}
        />
      ),
    },
    {
      key: '2',
      label: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)} {intl.formatMessage(messages.declined)}</span>,
      children: (
        <SchoolDeclined
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
        />
      ),
    },
    {
      key: '3',
      label: <span className="font-16">{intl.formatMessage(messages.preApproved)}</span>,
      children: (
        <AdminPreApproved
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
        />
      ),
    },
    {
      key: '4',
      label: <span className="font-16">{intl.formatMessage(messages.declined)}</span>,
      children: (
        <AdminDeclined
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
        />
      ),
    },
    {
      key: '5',
      label: <span className="font-16">{intl.formatMessage(messages.approved)}</span>,
      children: (
        <AdminApproved
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
        />
      ),
    }
  ];

  useEffect(() => {
    setRequests(props.listSubsidy?.filter(s => s.status == status));
  }, [props.listSubsidy]);

  useEffect(() => {
    props.getSubsidyRequests({ role: user.role });
  }, []);

  const modalSubsidyProps = {
    visible: visibleSubsidy,
    onSubmit: onCloseModalSubsidy,
    onCancel: onCloseModalSubsidy,
    subsidyId: selectedSubsidyId,
  }

  const modalSchoolApprovalProps = {
    visible: visibleSchoolApproval,
    onSubmit: schoolAcceptSubsidy,
    onCancel: onCloseModalSchoolApproval,
    subsidy: requests?.find(a => a._id === selectedSubsidyId),
  }

  const modalConfirmProps = {
    visible: visibleConfirm,
    onSubmit: schoolDenySubsidy,
    onCancel: onCloseModalConfirm,
    message: "Are you sure to decline this request?",
  }

  return (
    <div className="full-layout page subsidymanager-page">
      <div className='div-title-admin'>
        <p className='font-16 font-500'>{intl.formatMessage(mgsSidebar.subsidyManager)}</p>
        <Divider />
      </div>
      <Tabs
        defaultActiveKey="0"
        type="card"
        size='small'
        items={items}
        className="bg-white p-10 h-100 overflow-y-scroll overflow-x-hidden"
        onChange={(v) => handleChangeTab(v)}
      >
      </Tabs>
      {visibleSubsidy && <ModalSubsidyProgress {...modalSubsidyProps} />}
      {visibleSchoolApproval && <ModalSchoolSubsidyApproval {...modalSchoolApprovalProps} />}
      {visibleConfirm && <ModalConfirm {...modalConfirmProps} />}
      <PageLoading loading={loading} isBackground={true} />
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  listSubsidy: state.appointments.dataSubsidyRequests,
});

export default compose(connect(mapStateToProps, { getSubsidyRequests, setSubsidyRequests }))(SubsidyManager);