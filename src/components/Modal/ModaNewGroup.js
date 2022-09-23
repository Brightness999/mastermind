import React, { useState } from 'react';
import { Modal, Button, Input , List , message} from 'antd';
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
import ReactDragListView from "react-drag-listview";

class ModalNewGroup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [
                
            ],
            arrListOrderPosition:[],
            show: false,
            droppedBoxNames: []
        }
    }

    componentDidMount = () =>{
        this.props.setLoadData(this.loadListHierachyForSchool);
    }

    loadListHierachyForSchool = () =>{
        this.setState({data:[],arrListOrderPosition:[]});
        request.post('schools/get_all_sub_order_by_hierachy',{}).then(result=>{
            if(result.success){
                var arr = [];
                for(var i = 0 ;i < result.data.length ; i++){
                    arr.push(result.data[i].orderPosition);
                }
                console.log('old order',arr);
                this.setState({data: result.data , arrListOrderPosition:arr});

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
    // onDragEnd = (fromIndex, toIndex) => {
    //     if (toIndex < 0) return;
    //     const items = [...this.state.data];
    //     const item = items.splice(fromIndex, 1)[0];
    //     items.splice(toIndex, 0, item);
    //     this.setState({ data: items });
    // };

    // isDropped = (id) => {
    //     console.log('dropped item');
    //     return this.state.droppedBoxNames.indexOf(id) > -1;
    // }

    getProviderNames =(item)=>{
        var name = '';
        for(var i = 0 ; i < item.providers.length;i++){
            name += item.providers[i].referredToAs??item.providers[i].name + ' ';
        }
        return name;
    }

    saveOrderForSubsidaries = ()=>{
        var list = [];
        for(var i = 0 ; i< this.state.data.length; i++){
            list.push({_id: this.state.data[i]._id , orderPosition:this.state.arrListOrderPosition[i]  });
        }
        console.log(list);
        request.post('schools/sort_subsidary_by_hierachy' ,{orderedList: list}).then(result=>{
            if(result.success){
                message.success('Saved successfully ')
                this.props.onCancel();
            }else{
                message.error('Cannot save hierachy');
            }
            
        }).catch(err=>{
            message.error('Cannot save hierachy');
        })
    }

    renderListItem(item,index){
        return (
            <List.Item
            className="draggble" 
                >
                    <div className='item-drag'  data-testid={`box`}>
                <p className='font-500 mb-5'>Name: {item.student.firstName} {item.student.lastName}</p>
                <p className='font-500 mb-5'>Skill: {this.props.SkillSet[item.skillSet]}</p>
                <p className='font-500 mb-5'>Provider: {this.getProviderNames(item)}</p>
            </div>
            </List.Item>
            
        )
    }


    render =()=> {

        const modalProps = {
            className: 'modal-new-group',
            title: "Create New Group",
            visible: this.props.visible,
            onOk: this.props.onSubmit,
            onCancel: this.props.onCancel,
            closable: false,
            // width: 900,
            footer: [
                <Button key="back" onClick={this.props.onCancel}>
                    {intl.formatMessage(messages.cancel)}
                </Button>,
                <Button key="submit" type="primary" onClick={this.saveOrderForSubsidaries}>
                    {intl.formatMessage(messages.save)}
                </Button>
            ]
        };

        const inputChangeGroup = (
            <div className='div-new-group'>
                <BsPlus size={24} style={{ verticalAlign: 'bottom' }} />
                <span className='font-500 font-16 mb-0'>Hierachy for your subsidaries:</span>
            </div>
        )

        return (
            <Modal {...modalProps}>
                <ReactDragListView
                nodeSelector=".ant-list-item.draggble"
                onDragEnd={this.onDragEnd}
                >
                <List
                    size="small"
                    bordered
                    dataSource={this.state.data}
                    renderItem={(item,index) => {
                    const draggble =
                        item !== "Racing car sprays burning fuel into crowd.";
                    return this.renderListItem(item,index);
                    }}
                />
                </ReactDragListView>
                
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