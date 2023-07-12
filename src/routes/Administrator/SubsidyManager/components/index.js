import React, { useEffect, useState } from 'react';
import { Divider, message, Tabs } from 'antd';
import intl from 'react-intl-universal';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Cookies from 'js-cookie';

import mgsSidebar from 'components/SideBar/messages';
import messages from 'routes/User/Dashboard/messages';
import msgCreateAccount from 'routes/Sign/CreateAccount/messages';
import msgModal from 'components/Modal/messages';
import request from 'utils/api/request'
import { ModalCreateNote, ModalSchoolSubsidyApproval, ModalSubsidyProgress } from 'components/Modal';
import { acceptSubsidyRequest, denySubsidyRequest, preApproveSubsidy, reorderRequests } from 'utils/api/apiList';
import PageLoading from 'components/Loading/PageLoading';
import { getSubsidyRequests, setSubsidyRequests } from "src/redux/features/appointmentsSlice";
import SchoolPending from './SchoolPending';
import SchoolApproved from './SchoolApproved';
import SchoolDeclined from './SchoolDeclined';
import AdminPreApproved from './AdminPreApproved';
import AdminDeclined from './AdminDeclined';
import AdminApproved from './AdminApproved';
import SchoolAppealed from './SchoolAppealed';
import AdminAppealed from './AdminAppealed';
import { socketUrl } from 'utils/api/baseUrl';
import { CANCELLED, CLOSED, DECLINED, NOSHOW, PENDING } from 'routes/constant';
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
  const [visibleSchoolApproval, setVisibleSchoolApproval] = useState(false);
  const [visibleDeclineExplanation, setVisibleDeclineExplanation] = useState(false);
  const [socket, setSocket] = useState(undefined);

  const onShowModalSubsidy = (subsidyId) => {
    setSelectedSubsidyId(subsidyId);
    setVisibleSubsidy(true);
  }

  const onSubmitModalSubsidy = () => {
    props.getSubsidyRequests({ role: user.role });
    setVisibleSubsidy(false);
    setSelectedSubsidyId(undefined);
  };

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
    if (['0', '1', '5'].includes(v)) {
      setRequests(props.listSubsidy?.filter(s => s.status == v));
    } else if (v === '2') {
      setRequests(props.listSubsidy?.filter(s => s.status == v && s.isAppeal < 1));
    } else if (v === '3') {
      setRequests(props.listSubsidy?.filter(s => s.status == v && [PENDING, CANCELLED, undefined].includes(s.consultation?.status)));
    } else if (v === '4') {
      setRequests(props.listSubsidy?.filter(s => s.status == v && s.isAppeal < 1));
    } else if (v === '6') {
      setRequests(props.listSubsidy?.filter(s => s.status == 2 && s.isAppeal === 1));
    } else if (v === '7') {
      setRequests(props.listSubsidy?.filter(s => s.status == 4 && s.isAppeal === 1));
    } else if (v === '8') {
      setRequests(props.listSubsidy?.filter(s => s.status == 3 && [CLOSED, DECLINED, NOSHOW].includes(s.consultation?.status)));
    }
    setStatus(v);
  }

  const onShowModalSchoolApproval = (subsidyId) => {
    setSelectedSubsidyId(subsidyId);
    setVisibleSchoolApproval(true);
  }

  const onCloseModalSchoolApproval = () => {
    setVisibleSchoolApproval(false);
    setSelectedSubsidyId(undefined);
  }

  const onShowModalDeclineExplanation = (subsidyId) => {
    setSelectedSubsidyId(subsidyId);
    setVisibleDeclineExplanation(true);
  }

  const onCloseModalDeclineExplanation = () => {
    setVisibleDeclineExplanation(false);
    setSelectedSubsidyId(undefined);
  }

  const updateSubsidiaries = (subsidyId, data) => {
    const newSubsidyRequests = JSON.parse(JSON.stringify(props.listSubsidy));
    props.setSubsidyRequests(newSubsidyRequests?.map(s => {
      if (s._id === subsidyId) {
        s.status = data.status;
        s.isAppeal = data.isAppeal;
        s.selectedProvider = data.selectedProvider;
        s.otherProvider = data.otherProvider;
      }
      return s;
    }));
  }

  const schoolAcceptSubsidy = (data) => {
    const { selectedProvider, decisionExplanation, otherProvider } = data;
    setVisibleSchoolApproval(false);

    request.post(acceptSubsidyRequest, {
      subsidyId: selectedSubsidyId,
      student: requests?.find(a => a._id === selectedSubsidyId)?.student?._id,
      selectedProvider,
      decisionExplanation,
      otherProvider,
    }).then(result => {
      const { success, data } = result;
      if (success) {
        updateSubsidiaries(selectedSubsidyId, data);
      }
    }).catch(err => {
      message.error(err.message);
    })
  }

  const schoolDenySubsidy = (declineExplanation) => {
    setVisibleDeclineExplanation(false);
    request.post(denySubsidyRequest, { subsidyId: selectedSubsidyId, declineExplanation }).then(result => {
      const { success, data } = result;
      if (success) {
        updateSubsidiaries(selectedSubsidyId, data);
      }
    }).catch(err => {
      message.error(err.message);
    })
  }

  const adminPreApproveSubsidy = (subsidyId) => {
    request.post(preApproveSubsidy, { subsidyId }).then(result => {
      const { success, data } = result;
      if (success) {
        updateSubsidiaries(subsidyId, data);
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
          onShowModalDeclineExplanation={onShowModalDeclineExplanation}
          adminPreApproveSubsidy={adminPreApproveSubsidy}
          socket={socket}
          user={user}
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
          onShowModalDeclineExplanation={onShowModalDeclineExplanation}
          adminPreApproveSubsidy={adminPreApproveSubsidy}
          socket={socket}
          user={user}
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
          socket={socket}
          user={user}
        />
      ),
    },
    {
      key: '6',
      label: <span className="font-16">{intl.formatMessage(msgCreateAccount.school)} {intl.formatMessage(msgModal.appealed)}</span>,
      children: (
        <SchoolAppealed
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
          socket={socket}
          user={user}
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
          socket={socket}
          user={user}
        />
      ),
    },
    {
      key: '8',
      label: <span className="font-16">{intl.formatMessage(messages.postConsultation)}</span>,
      children: (
        <AdminPreApproved
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
          socket={socket}
          user={user}
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
          socket={socket}
          user={user}
        />
      ),
    },
    {
      key: '7',
      label: <span className="font-16">{intl.formatMessage(msgModal.appealed)}</span>,
      children: (
        <AdminAppealed
          requests={requests}
          skills={skills}
          grades={grades}
          schools={schoolInfos}
          onShowModalSubsidy={onShowModalSubsidy}
          socket={socket}
          user={user}
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
          socket={socket}
          user={user}
        />
      ),
    }
  ];

  useEffect(() => {
    setRequests(props.listSubsidy?.filter(s => s.status == status));
  }, [props.listSubsidy]);

  useEffect(() => {
    props.getSubsidyRequests({ role: user.role });
    const opts = {
      query: {
        token: Cookies.get('tk'),
      },
      withCredentials: true,
      autoConnect: true,
    };
    setSocket(io(socketUrl, opts))
  }, []);

  const modalSubsidyProps = {
    visible: visibleSubsidy,
    onSubmit: onSubmitModalSubsidy,
    onCancel: onCloseModalSubsidy,
    subsidyId: selectedSubsidyId,
  }

  const modalSchoolApprovalProps = {
    visible: visibleSchoolApproval,
    onSubmit: schoolAcceptSubsidy,
    onCancel: onCloseModalSchoolApproval,
    subsidy: requests?.find(a => a._id === selectedSubsidyId),
  }

  const modalDeclineExplanationProps = {
    visible: visibleDeclineExplanation,
    onSubmit: schoolDenySubsidy,
    onCancel: onCloseModalDeclineExplanation,
    title: intl.formatMessage(msgModal.declineExplanation),
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
      />
      {visibleSubsidy && <ModalSubsidyProgress {...modalSubsidyProps} />}
      {visibleSchoolApproval && <ModalSchoolSubsidyApproval {...modalSchoolApprovalProps} />}
      {visibleDeclineExplanation && <ModalCreateNote {...modalDeclineExplanationProps} />}
      <PageLoading loading={loading} isBackground={true} />
    </div>
  );
}

const mapStateToProps = state => ({
  auth: state.auth,
  listSubsidy: state.appointments.dataSubsidyRequests,
});

export default compose(connect(mapStateToProps, { getSubsidyRequests, setSubsidyRequests }))(SubsidyManager);