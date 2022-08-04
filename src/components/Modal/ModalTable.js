// import React, { Component } from 'react';
// import intl from 'react-intl-universal';
// import { Modal, Button } from 'antd';
// import cx from 'classnames';
// import isEqual from 'react-fast-compare';
// import PropTypes from 'prop-types';
// import DataTable from '../DataTable';
// import SearchBar from '../SearchBar';
// import './style/index.less';
// import messages from './messages';

// const {Pagination} = DataTable;

// class ModalTable extends Component {
//   constructor(props) {
//     super(props);
//     const { value, dataItems, visible, loading } = props;
//     this.state = {
//       value,
//       dataItems,
//       visible,
//       loading,
//       selectedRows: [],
//     };
//   }

//   componentWillMount() {
//     const { dataItems, visible } = this.props;

//     if (visible) {
//       this.onChange({
//         pageNum: 1,
//         pageSize: dataItems.pageSize,
//         filters: dataItems.filters
//       });
//     }
//   }

//   componentWillReceiveProps(nextProps, nextContext) {
//     const { dataItems, value, visible, loading } = nextProps;
//     if (
//       !isEqual(this.props.dataItems, dataItems) ||
//       !isEqual(this.props.value, value) ||
//       !isEqual(this.props.loading, loading)
//     ) {
//       this.setState({
//         dataItems,
//         value,
//         loading
//       });
//     }
//     if ('visible' in nextProps) {
//       this.setState({
//         visible
//       });

//       if (visible) {
//         this.onChange({
//           pageNum: 1,
//           pageSize: dataItems.pageSize,
//           filters: dataItems.filters
//         });
//       }
//     }
//   }

//   onSelect = (keys, rows) => {
//     this.setState({ value: keys, selectedRows: rows });
//   };

//   onSearch = (values) => {
//     const { dataItems } = this.state;
//     this.onChange({
//       pageNum: 1,
//       pageSize: dataItems.pageSize,
//       filters: values
//     });
//   };

//   async onChange({ pageNum, pageSize, filters }) {
//     const {loadData} = this.props;

//     if (loadData) {
//       this.setState({
//         loading: true
//       });

//       const dataItems = await loadData({ pageNum, pageSize, filters });

//       this.setState({
//         loading: false,
//         dataItems: dataItems || this.props.dataItems
//       });
//     }
//   }

//   closeModal = () => {
//     if (this.props.onCancel) {
//       this.props.onCancel();
//       return;
//     }
//     this.setState({
//       visible: false
//     });
//   };

//   onOk = () => {
//     const { value, selectedRows } = this.state;
//     const {onSubmit} = this.props;
//     if (onSubmit) {
//       onSubmit(value, selectedRows);
//     }
//   };

//   render() {
//     const {
//       title,
//       className,
//       columns,
//       modalOpts,
//       rowKey,
//       full,
//       width,
//       selectType,
//       onCancel,
//       onSubmit
//     } = this.props;

//     const { dataItems, value, loading, visible } = this.state;

//     const classname = cx(className, 'antui-table-modal', 'antui-modalform', {
//       'full-modal': full
//     });

//     const dataTableProps = {
//       loading,
//       columns,
//       rowKey,
//       dataItems,
//       selectedRowKeys: value,
//       selectType,
//       showNum: true,
//       isScroll: true,
//       onChange: ({ pageNum, pageSize }) => this.onChange({ pageNum, pageSize }),
//       onSelect: (keys, rows) => this.onSelect(keys, rows)
//     };

//     const searchBarProps = {
//       columns,
//       onSearch: this.onSearch
//     };

//     const comp = <DataTable {...dataTableProps} />;

//     const titleComp = (
//       <div className="with-search-title">
//         <div className="left-title">{title}</div>
//         <SearchBar {...searchBarProps} />
//       </div>
//     );

//     const modalProps = {
//       className: classname,
//       confirmLoading: loading,
//       visible,
//       width: width || 600,
//       style: { top: 20 },
//       title: titleComp,
//       destroyOnClose: true,
//       onCancel: this.closeModal,
//       onOk: this.onOk,
//       footer: [
//         <Pagination
//           key="paging"
//           size="small"
//           showSizeChanger={false}
//           showQuickJumper={false}
//           {...dataTableProps}
//         />,
//         onCancel && (
//           <Button key="back" onClick={this.closeModal}>
//             {intl.formatMessage(messages.cancel)}
//           </Button>
//         ),
//         onSubmit && (
//           <Button key="submit" type="primary" onClick={this.onOk}>
//             {intl.formatMessage(messages.determine)}
//           </Button>
//         )
//       ],
//       ...modalOpts
//     };

//     return <Modal {...modalProps}>{comp}</Modal>;
//   }
// }

// ModalTable.propTypes = {
//   visible: PropTypes.bool,
//   loading: PropTypes.bool,
//   loadData: PropTypes.bool,
//   full: PropTypes.bool,
//   value: PropTypes.string,
//   title: PropTypes.string,
//   rowKey: PropTypes.string,
//   width: PropTypes.string,
//   selectType: PropTypes.string,
//   className: PropTypes.string,
//   dataItems: PropTypes.object,
//   modalOpts: PropTypes.object,
//   columns: PropTypes.array,
//   onCancel: PropTypes.func,
//   onSubmit: PropTypes.func,
// };

// export default ModalTable;
