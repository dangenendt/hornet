import * as React from 'react';
import {inject, observer} from "mobx-react";
import NodeStore from "app/stores/NodeStore";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import {Dashboard} from "app/components/Dashboard";
import Badge from "react-bootstrap/Badge";
import {RouterStore} from 'mobx-react-router';
import {Explorer} from "app/components/Explorer";
import {NavExplorerSearchbar} from "app/components/NavExplorerSearchbar";
import {Redirect, Route, Switch} from 'react-router-dom';
import {LinkContainer} from 'react-router-bootstrap';
import {ExplorerTransactionQueryResult} from "app/components/ExplorerTransactionQueryResult";
import {ExplorerBundleQueryResult} from "app/components/ExplorerBundleQueryResult";
import {ExplorerAddressQueryResult} from "app/components/ExplorerAddressResult";
import {ExplorerTagQueryResult} from "app/components/ExplorerTagResult";
import {Explorer404} from "app/components/Explorer404";
import {Misc} from "app/components/Misc";
import {Neighbors} from "app/components/Neighbors";
import {Explorer420} from "app/components/Explorer420";

interface Props {
    history: any;
    routerStore?: RouterStore;
    nodeStore?: NodeStore;
}

@inject("nodeStore")
@inject("routerStore")
@observer
export class Root extends React.Component<Props, any> {
    renderDevTool() {
        if (process.env.NODE_ENV !== 'production') {
            const DevTools = require('mobx-react-devtools').default;
            return <DevTools/>;
        }
    }

    componentDidMount(): void {
        this.props.nodeStore.connect();
    }

    render() {
        return (
            <div className="container">
                <Navbar expand="lg" bg="light" variant="light" className={"mb-4"}>
                    <Navbar.Brand>
                        <img
                            src="/assets/favicon.svg"
                            width="40"
                            className="d-inline-block"
                            alt="Hornet"
                        />
                    </Navbar.Brand>
                    <Nav className="mr-auto">
                        <LinkContainer to="/dashboard">
                            <Nav.Link>Dashboard</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/neighbors">
                            <Nav.Link>Neighbors</Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/explorer">
                            <Nav.Link>
                                Tangle Explorer
                            </Nav.Link>
                        </LinkContainer>
                        <LinkContainer to="/debug">
                            <Nav.Link>
                                Misc
                            </Nav.Link>
                        </LinkContainer>
                    </Nav>
                    <Navbar.Collapse className="justify-content-end">
                        <NavExplorerSearchbar/>
                        <Navbar.Text>
                            {!this.props.nodeStore.websocketConnected &&
                            <Badge variant="danger">WS not connected!</Badge>
                            }
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Navbar>
                <Switch>
                    <Route exact path="/dashboard" component={Dashboard}/>
                    <Route exact path="/debug" component={Misc}/>
                    <Route exact path="/neighbors" component={Neighbors}/>
                    <Route exact path="/explorer/tx/:hash" component={ExplorerTransactionQueryResult}/>
                    <Route exact path="/explorer/bundle/:hash" component={ExplorerBundleQueryResult}/>
                    <Route exact path="/explorer/addr/:hash" component={ExplorerAddressQueryResult}/>
                    <Route exact path="/explorer/tag/:hash" component={ExplorerTagQueryResult}/>
                    <Route exact path="/explorer/404/:search" component={Explorer404}/>
                    <Route exact path="/explorer/420" component={Explorer420}/>
                    <Route exact path="/explorer" component={Explorer}/>
                    <Redirect to="/dashboard"/>
                </Switch>
                {this.props.children}
                {this.renderDevTool()}
            </div>
        );
    }
}
