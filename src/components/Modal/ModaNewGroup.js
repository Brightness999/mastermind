import React, { useState } from 'react';
import { Modal, Button, Input } from 'antd';
import {  Form,  Select } from 'antd';
import { BsPlus } from 'react-icons/bs';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend}  from 'react-dnd-html5-backend';
import { ItemTypes } from './ItemTypes.js';
import intl from 'react-intl-universal';
import messages from './messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import './style/index.less';
import '../../assets/styles/login.less';
import request,{generateSearchStructure} from '../../utils/api/request'
import {url , switchPathWithRole} from '../../utils/api/baseUrl'

class ModalNewGroup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [
                
            ],
            listHierachy:[],
            show: false,
            droppedBoxNames: [],
            schoolId: '',
            subsidyId:'',
        }
    }

    componentDidMount = () =>{
        this.props.setLoadData( this.loadAllMyHierachy );
    }

    loadAllMyHierachy = (subsidy, callbackAfterChanged) =>{
        this.callbackWhenFinished = callbackAfterChanged
        this.setState({schoolId:subsidy.school._id , subsidyId: subsidy._id});
        request.post('schools/get_all_hierachy' , {schoolId:subsidy.school._id}).then(result=>{
            console.log('get_all_hierachy', result);
            if(result.success){
                this.setState({listHierachy:result.data});
            }else{
                this.setState({listHierachy:[]});
            }
            
        }).catch(err=>{
            console.log(err)
            this.setState({listHierachy:[]});
        })
    }

    submitForm = () =>{

        if(!!this.form.getFieldValue('name')&&this.form.getFieldValue('name').length > 0){
            this.createHierachy(this.form.getFieldValue('name') , this.state.schoolId);
            return;
        }

        if(!!this.form.getFieldValue('selectedHierachy') && this.form.getFieldValue('selectedHierachy').length > 0){
            this.addHierachyToSubsidy(this.state.subsidyId , this.form.getFieldValue('selectedHierachy'));
            return;
        }

        this.form.setFields([{
            name: 'name',
            errors: ['please enter new name or select a hierachy '],
        }])
    }

    createHierachy = (name , schoolId) =>{
        request.post('schools/create_hierachy' , {name: name,schoolId:schoolId}).then(result=>{
            console.log('create_hierachy' , result);
            if(result.success){
                this.addHierachyToSubsidy(this.state.subsidyId , result.data._id);
                this.props.onCancel();
            }else{
                this.props.onCancel();
            }
        }).catch(err=>{
            this.props.onCancel();
        })
    }

    addHierachyToSubsidy = (subsidyId, hierachyId) => {
        request.post('schools/change_hierachy' , {subsidyId: subsidyId,hierachyId:hierachyId}).then(result=>{
            console.log('change_hierachy' , result);
            if(result.success){
                this.callbackWhenFinished(hierachyId);
            }else{
                this.props.onCancel();
            }
        }).catch(err=>{
            this.props.onCancel();
        })
    }


    onDragEnd = (fromIndex, toIndex) => {
        if (toIndex < 0) return;
        const items = [...this.state.data];
        const item = items.splice(fromIndex, 1)[0];
        items.splice(toIndex, 0, item);
        this.setState({ data: items });
    };

    isDropped = (id) => {
        return this.state.droppedBoxNames.indexOf(id) > -1;
    }

    render = () => {
        const {listHierachy} = this.state;
        const modalProps = {
            className: 'modal-new-group',
            title: "Create New Group",
            visible: this.props.visible,
            closable: false,
            // width: 900,
            footer: [
                // <Button key="back" onClick={this.props.onCancel}>
                //     {intl.formatMessage(messages.cancel)}
                // </Button>,
                // <Button key="submit" type="primary" onClick={this.submitForm}>
                //     Add to this hierachy
                // </Button>
            ]
        };

        const inputChangeGroup = (
            <div className='div-new-group'>
                <BsPlus size={24} style={{ verticalAlign: 'bottom' }} />
                <span className='font-500 font-16 mb-0'>Create new group</span>
            </div>
        )
        const that = this;

        return (
            <Modal {...modalProps}>
                <div className='col-form col-subsidy mt-0'>
                <Form
                            name="formHierachy"
                            ref={ref => this.form = ref}
                        >
                    <Form.Item name="name">
                    <Input size="small" placeholder='Enter new hierachy' />
                            </Form.Item>
                            <Form.Item name="selectedHierachy"
                                
                            >
                                <Select placeholder='Choose existing hierachy'>
                                    {!!listHierachy&&listHierachy.length>0&& listHierachy.map((item, index) => {
                                        return (
                                            <Select.Option key={index} value={item._id}>{item.name}</Select.Option>
                                        )
                                    })}
                                    
                                </Select>
                            </Form.Item>
                            <Form.Item name="buttons">
                            <Button key="back" onClick={this.props.onCancel}>
                    {intl.formatMessage(messages.cancel)}
                </Button>,
                <Button key="submit" type="primary" onClick={this.submitForm}>
                    Add to this hierachy
                </Button>
                            </Form.Item>
                </Form>
                </div>
                {/* <p className='font-12 text-center'>Drag & drop the item to create new group</p>
                <DndProvider backend={HTML5Backend}>
                    <div>
                        <div style={{ overflow: 'hidden', clear: 'both' }}>
                            <BoxChange />
                        </div>
                        <div style={{ overflow: 'hidden', clear: 'both' }}>
                            {this.state.data.map((item, index) => <Item name={item.name} isDropped={this.isDropped(item.id)} key={index}/>
                            )}
                           
                        </div>
                    </div>
                </DndProvider> */}
            </Modal>
        );
    }
};
export default ModalNewGroup;

const Item = ({ name, isDropped }) => {
    const [, drag] = useDrag(() => ({
        type: ItemTypes.BOX,
        item: { name },
        // end: (item, monitor) => {
        //     const dropResult = monitor.getDropResult()
        //     if (item && dropResult) {
        //         alert(`You dropped ${item.name} into ${dropResult.name}!`)
        //     }
        // },
        collect: (monitor) => ({
            handlerId: monitor.getHandlerId(),
        }),
    }))
    const opacity = isDropped ? 0.4 : 1

    return (
        <div ref={drag} className='item-drag' style={{ opacity }} data-testid={`box`}>
            <p className='font-500 mb-5'>Name:  {name}</p>
            <p className='font-500 mb-5'>Skill: Occupational</p>
            <p className='font-500 mb-5'>Provider: Provider Name</p>
        </div>
    )
};


const BoxChange = ({ greedy, children }) => {
    const [hasDropped, setHasDropped] = useState(false)
    const [hasDroppedOnChild, setHasDroppedOnChild] = useState(false)
    const [, drop] = useDrop(
      () => ({
        accept: ItemTypes.BOX,
        drop(_item, monitor) {
          const didDrop = monitor.didDrop()
          if (didDrop && !greedy) {
            return
          }
          setHasDropped(true)
          setHasDroppedOnChild(didDrop)
        },
        
      }),
      [greedy, setHasDropped, setHasDroppedOnChild],
    )
    
    return (
        <>
            {hasDropped ? 
                <Input placeholder='Enter group name' size='large'/>
                : <div className='div-new-group' ref={drop}>
                    <BsPlus size={24} style={{ verticalAlign: 'bottom' }} />
                    <span className='font-500 font-16 mb-0'>Create new group</span>
                </div>
        }</>
    )
  }