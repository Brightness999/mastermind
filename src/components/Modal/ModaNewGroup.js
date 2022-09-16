import React, { useState } from 'react';
import { Modal, Button, Input } from 'antd';
import { BsPlus } from 'react-icons/bs';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend}  from 'react-dnd-html5-backend';
import { ItemTypes } from './ItemTypes.js';
import intl from 'react-intl-universal';
import messages from './messages';
import msgReview from '../../routes/Sign/SubsidyReview/messages';
import './style/index.less';
import '../../assets/styles/login.less';

class ModalNewGroup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [
                {
                    id: 1,
                    name: "Japanese princess to wed commoner.",
                },
                {
                    id: 2,
                    name: "Australian walks 100km after outback crash.",
                },
                {
                    id: 3,
                    name: "Man charged over missing wedding girl.",
                }
                
            ],
            show: false,
            droppedBoxNames: []
        }
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

    render() {

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
                <Button key="submit" type="primary" onClick={this.props.onSubmit}>
                    {intl.formatMessage(messages.create)}
                </Button>
            ]
        };

        const inputChangeGroup = (
            <div className='div-new-group'>
                <BsPlus size={24} style={{ verticalAlign: 'bottom' }} />
                <span className='font-500 font-16 mb-0'>Create new group</span>
            </div>
        )

        return (
            <Modal {...modalProps}>
                <p className='font-12 text-center'>Drag & drop the item to create new group</p>
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
                </DndProvider>
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