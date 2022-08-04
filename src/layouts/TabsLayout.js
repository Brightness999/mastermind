import './styles/tabs.less';
import React from 'react';
import { Layout, Tabs, Dropdown, Button, Menu } from 'antd';
import {DownOutlined} from '@ant-design/icons'
import { Switch, Route } from 'dva/router';
import intl from "react-intl-universal";
import NotFound from '../components/Pages/404';
import messages from './messages';


const { Content } = Layout;
const {TabPane} = Tabs;

function getTitle(pathName) {
  const map = window.dva_router_pathMap[pathName];
  return <div className="tab-title">{map ? map.title : 'Tag'}</div>;
}

class TabsLayout extends React.Component {
  constructor(props) {
    const {
      location: { pathname }
    } = props;
    super(props);
    this.state = this.setCurPanes(pathname, []);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const {
      location: { pathname }
    } = this.props;
    const nextpathname = nextProps.location.pathname;
    if (pathname !== nextpathname) {
      const newState = this.setCurPanes(nextpathname);
      this.setState(newState);
    }
  }

  setCurPanes = (pathName, _panes) => {
    const { childRoutes } = this.props;
    const panes = _panes || this.state.panes;
    const existPane = panes.some(item => item.key === pathName);
    if (existPane) {
      return {
        activeKey: pathName,
        panes,
        noMatch: false
      };
    }
    const nextPanes = childRoutes.filter(item => item.key === pathName);
    if (nextPanes.length) {
      return {
        activeKey: pathName,
        panes: panes.concat(nextPanes),
        noMatch: false
      };
    } if (
      window.dva_router_pathMap[pathName] &&
        window.dva_router_pathMap[pathName].parentPath
    ) {
      // If there is no childRoutes (in two cases, there is really no, or may be a sub-route in subChildRoute)
      // If it is a sub-route
      const {parentPath} = window.dva_router_pathMap[pathName];
      return this.setCurPanes(parentPath, panes);
    }
    return {
      activeKey: pathName,
      panes,
      noMatch: true
    };


  };

  onChange = activeKey => {
    this.history.push(activeKey);
  };

  onRemove = targetKey => {
    const { panes } = this.state;
    let { activeKey } = this.state;
    let lastIndex = -1;
    panes.forEach((pane, i) => {
      if (pane.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newpanes = panes.filter(pane => pane.key !== targetKey);
    if (newpanes.length && activeKey === targetKey) {
      activeKey = lastIndex >= 0 ? newpanes[lastIndex].key : newpanes[0].key;
    }
    this.setState({ panes: newpanes, activeKey }, () => {
      if (activeKey !== targetKey) this.onChange(activeKey);
    });
  };

  onRemoveOther = () => {
    const { activeKey, panes } = this.state;
    const newpanes = panes.filter(pane => pane.key === activeKey);
    this.setState({ panes: newpanes });
  };

  onRemoveAll = () => {
    this.setState({ panes: [], activeKey: null });
  };

  onTabsActions = ({ key }) => {
    const { activeKey } = this.state;
    switch (key) {
      case 'close':
        this.onRemove(activeKey);
        break;
      case 'closeother':
        this.onRemoveOther();
        break;
      case 'closeall':
        this.onRemoveAll();
        break;
      default:
        break;
    }
  };

  render() {
    const { panes, activeKey, noMatch } = this.state;

    return (
      <Layout className="full-layout tabs-layout">
        <Content>
          <Switch>
            {noMatch ? (
              <Route component={NotFound} />
            ) : (
              <Tabs
                hideAdd
                type="editable-card"
                className="lanif-tabs-content"
                tabBarExtraContent={
                  <Dropdown
                    overlay={
                      <Menu onClick={this.onTabsActions}>
                        <Menu.Item key="close">{intl.formatMessage(messages.Closecurrent)}</Menu.Item>
                        <Menu.Item key="closeother">{intl.formatMessage(messages.Closeother)}</Menu.Item>
                        <Menu.Item key="closeall">{intl.formatMessage(messages.Closeall)}</Menu.Item>
                      </Menu>
                    }
                  >
                    <Button type="primary" ghost>
                      {intl.formatMessage(messages.operating)}
                      <DownOutlined />
                    </Button>
                  </Dropdown>
                }
                onEdit={this.onRemove}
                onChange={this.onChange}
                activeKey={activeKey}
              >
                {panes.map(item => (
                  <TabPane tab={getTitle(item.key)} key={item.key}>
                    {item}
                  </TabPane>
                ))}
              </Tabs>
            )}
          </Switch>
        </Content>
      </Layout>
    );
  }
}

export default TabsLayout