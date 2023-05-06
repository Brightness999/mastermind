import React, { useEffect, useState } from "react";
import { message, Tabs } from "antd";
import { connect } from 'react-redux';
import { compose } from 'redux';
import intl from 'react-intl-universal';

import messages from '../messages';
import msgModal from '../../../components/Modal/messages';
import request from "../../../utils/api/request";
import { acceptSubsidyRequest, denySubsidyRequest, reorderRequests } from "../../../utils/api/apiList";
import { ModalCreateNote, ModalSchoolSubsidyApproval, ModalSubsidyProgress } from "../../../components/Modal";
import { getSubsidyRequests, setSubsidyRequests } from "../../../redux/features/appointmentsSlice";
import Pending from "./pending";
import Declined from "./declined";
import Approved from "./approved";

const Subsidiaries = (props) => {
  const { user, skillSet, academicLevels } = props.auth;
  const skills = JSON.parse(JSON.stringify(skillSet ?? []))?.map(skill => { skill['text'] = skill.name, skill['value'] = skill._id; return skill; });
  const grades = JSON.parse(JSON.stringify(academicLevels ?? []))?.slice(6)?.map(level => ({ text: level, value: level }));
  const [requests, setRequests] = useState(props.listSubsidiaries?.filter(s => s.status === 0));
  const [status, setStatus] = useState(0);
  const [selectedSubsidyId, setSelectedSubsidyId] = useState(undefined);
  const [visibleSubsidy, setVisibleSubsidy] = useState(false);
  const [visibleSchoolApproval, setVisibleSchoolApproval] = useState(false);
  const [visibleDeclineExplanation, setVisibleDeclineExplanation] = useState(false);

  const onShowModalSubsidy = (subsidyId) => {
    setSelectedSubsidyId(subsidyId);
    setVisibleSubsidy(true);
  }

  useEffect(() => {
    setRequests(props.listSubsidiaries?.filter(s => s.status == status));
  }, [props.listSubsidiaries]);

  const handleChangeTab = v => {
    setRequests(props.listSubsidiaries?.filter(s => s.status == v));
    setStatus(v);
  }

  const onCloseModalSubsidy = () => {
    setVisibleSubsidy(false);
  }

  const handleReorder = (updatedList) => {
    const requestIds = updatedList?.map(a => a?._id);
    const orders = updatedList?.map(a => a.orderPosition)?.sort((a, b) => b - a);
    if (requestIds?.length > 0 && orders?.length > 0 && requestIds?.length === orders?.length) {
      request.post(reorderRequests, { requestIds, orders }).then(res => res.success && props.getSubsidyRequests({ role: user.role }));
    }
  }

  const onShowModalDeclineExplanation = (subsidyId) => {
    setSelectedSubsidyId(subsidyId);
    setVisibleDeclineExplanation(true);
  }

  const onCloseModalDeclineExplanation = () => {
    setVisibleDeclineExplanation(false);
    setSelectedSubsidyId(undefined);
  }

  const onShowModalSchoolApproval = (subsidyId) => {
    setVisibleSchoolApproval(true);
    setSelectedSubsidyId(subsidyId);
  }

  const onCloseModalSchoolApproval = () => {
    setVisibleSchoolApproval(false);
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
        const newSubsidyRequests = JSON.parse(JSON.stringify(props.listSubsidiaries));
        props.setSubsidyRequests(newSubsidyRequests?.map(s => {
          if (s._id === selectedSubsidyId) {
            s.status = data.status;
            s.selectedProvider = data.selectedProvider;
            s.otherProvider = data.otherProvider;
          }
          return s;
        }));
      }
    }).catch(err => {
      message.error(err.message);
    })
  }

  const schoolDenySubsidy = (declineExplanation) => {
    if (declineExplanation?.trim()?.length) {
      onCloseModalDeclineExplanation();
      request.post(denySubsidyRequest, { subsidyId: selectedSubsidyId, declineExplanation }).then(result => {
        const { success, data } = result;
        if (success) {
          const newSubsidyRequests = JSON.parse(JSON.stringify(props.listSubsidiaries));
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
    } else {
      message.warn("Please fill in the decline explaintion");
    }
  }

  const items = [
    {
      key: '0',
      label: <span className="font-16">{intl.formatMessage(messages.pending)}</span>,
      children: (
        <Pending
          requests={requests}
          skills={skills}
          grades={grades}
          onShowModalSubsidy={onShowModalSubsidy}
          onShowModalSchoolApproval={onShowModalSchoolApproval}
          onShowModalDeclineExplanation={onShowModalDeclineExplanation}
        />
      ),
    },
    {
      key: '1',
      label: <span className="font-16">{intl.formatMessage(messages.approved)}</span>,
      children: (
        <Approved
          requests={requests}
          skills={skills}
          grades={grades}
          setRequests={setRequests}
          onShowModalSubsidy={onShowModalSubsidy}
          handleReorder={handleReorder}
        />
      ),
    },
    {
      key: '2',
      label: <span className="font-16">{intl.formatMessage(messages.declined)}</span>,
      children: (
        <Declined
          requests={requests}
          skills={skills}
          grades={grades}
          onShowModalSubsidy={onShowModalSubsidy}
        />
      ),
    }
  ];

  useEffect(() => {
    if (props.subsidyId) {
      onShowModalSubsidy(props.subsidyId)
    }
  }, [props.subsidyId]);

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

  const modalDeclineExplanationProps = {
    visible: visibleDeclineExplanation,
    onSubmit: schoolDenySubsidy,
    onCancel: onCloseModalDeclineExplanation,
    title: intl.formatMessage(msgModal.declineExplanation),
  }

  return (
    <div className="full-layout page school-dashboard h-100">
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
      {visibleDeclineExplanation && <ModalCreateNote {...modalDeclineExplanationProps} />}
    </div>
  );
}

const mapStateToProps = state => ({
  listSubsidiaries: state.appointments.dataSubsidyRequests,
  auth: state.auth,
})

export default compose(connect(mapStateToProps, { getSubsidyRequests, setSubsidyRequests }))(Subsidiaries);