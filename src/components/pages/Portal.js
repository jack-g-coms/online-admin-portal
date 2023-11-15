import React, { useContext, useState, useEffect, useRef } from 'react';
import { socket } from '../js/modules/Socket';

import '../css/Portal.css';

import Button from '../js/Button';
import TextBox from '../js/TextBox';

import AuthContext from '../js/modules/AuthContext';
import { timeFormat } from '../../shared';

import ManageUsers from '../js/portalComponents/manageUsers';
import ManageRobloxBans from '../js/portalComponents/RobloxSystem/manageRobloxBans';

function Portal() {
    const [viewProfileState, setProfileViewState] = useState('closed');
    const [portalComponentState, setPortalComponentState] = useState();

    const authContext = useContext(AuthContext);
    const gateways = useRef();
    
    useEffect(() => {
        socket.emit('getConnectedGateways', (res) => {
            gateways.current = res;
        });
    }, []);

    return (
        <>
            <div className='portal-container'>
                <div className='sidebar-options'>
                    {authContext.user &&
                        <>
                            <div onClick={(e) => {
                                if (viewProfileState == 'closed') {
                                    setProfileViewState('opened');
                                } else {
                                    setProfileViewState('closed');
                                }
                            }} className='sidebar-profile-view'>
                                <img src={authContext.user.rbxUser.imageUrl}/>

                                <div className='sidebar-profile-view-info'>
                                    <strong><span>{authContext.user.rbxUser.username}</span></strong>
                                    <span style={{'color': '#f0be48'}}>{authContext.user.permissions.Name}</span>
                                </div>

                                {viewProfileState == 'closed' ? <i style={{'marginLeft': '15px'}} class="fa-solid fa-angle-up"></i> : <i style={{'marginLeft': '15px'}} class="fa-solid fa-angle-down"></i>}
                            </div>

                            <div className={viewProfileState == 'closed' ? 'sidebar-profile-view-dropdown-hidden' : 'sidebar-profile-view-dropdown'}>
                                <div>
                                    <span style={{'color': '#f0be48'}}>Email: </span><span>{authContext.user.email}</span>
                                </div>
                                <div>
                                    <span style={{'color': '#f0be48'}}>Username: </span><span>{authContext.user.rbxUser.username}</span>
                                </div>
                                <div>
                                    <span style={{'color': '#f0be48'}}>ID: </span><span>{authContext.user.id}</span>
                                </div>
                                <div>
                                    <span style={{'color': '#f0be48'}}>Permission Name: </span><span>{authContext.user.permissions.Name}</span>
                                </div>
                                <div>
                                    <span style={{'color': '#f0be48'}}>Permission Level: </span><span>{authContext.user.permissions.Level}</span>
                                </div>
                                {localStorage.getItem('signOn') && 
                                    <div>
                                        <span style={{'color': '#349fc9'}}>Session Time: </span><span>{timeFormat(((Date.now() / 1000) - localStorage.getItem('signOn')))}</span>
                                    </div>
                                }
                                <div>
                                    <span style={{'color': '#34c939'}}>Authenticated Portal User</span>
                                </div>
                                {gateways.current &&
                                    <div>
                                        <span style={{'color': '#34c939'}}>Connected Gateways: </span><span>{gateways.current.join(', ')}</span>
                                    </div>
                                }
                            </div>
                        </>
                    }

                    <div className='sidebar-profile-view-grouping' id='sidetop-item'>
                    <div className='sidebar-grouping-title'>
                            <img style={{'marginRight': '3px', 'width': '30px', 'height': '30px'}} src='/media/images/discord-logo.png'/> 
                            <h1>Discord System</h1>
                        </div>
                        <Button animation='pop-out color' style={{'width': '100%'}} onClick={(e) => {setPortalComponentState('manageDiscordBans');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-gavel'/>Bans</Button>
                        <Button animation='pop-out color' style={{'width': '100%'}} onClick={(e) => {}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-clipboard-user'/>Moderations</Button>
                    </div>

                    <div className='sidebar-profile-view-grouping'>
                        <div className='sidebar-grouping-title'>
                            <img style={{'marginRight': '3px', 'width': '30px', 'height': '30px'}} src='/media/images/roblox-logo-red.png'/> 
                            <h1>Roblox System</h1>
                        </div>
                        <Button animation='pop-out color-red' style={{'width': '100%'}} onClick={(e) => {setPortalComponentState('manageRobloxBans');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-gavel'/>Bans</Button>
                        <Button animation='pop-out color-red' style={{'width': '100%'}} onClick={(e) => {}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-circle-exclamation'/>Warnings</Button>
                    </div>

                    {authContext.user.permissions.Flags.MANAGE_USERS &&
                        <div className='sidebar-profile-view-grouping'>
                            <div className='sidebar-grouping-title'>
                                <img style={{'marginRight': '3px', 'width': '30px', 'height': '30px'}} src='/media/images/management-logo.png'/> 
                                <h1>Management System</h1>
                            </div>
                            <Button animation='pop-out color-yellow' style={{'width': '100%'}} onClick={(e) => {setPortalComponentState('manageUsers');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-user'/>Users</Button>
                        </div>
                    }

                    <div className='sidebar-profile-view-bottom'>
                        <i class="fa-solid fa-circle-info"></i>
                        <span>All actions are logged and processed by Portal Administrators apart of Technical Services.</span>
                    </div>
                </div>

                {portalComponentState == 'manageUsers' &&
                    <ManageUsers hidden={false}/>
                } 

                {portalComponentState == 'manageRobloxBans' &&
                    <ManageRobloxBans/>
                }
            </div>
        </>
    );
};

export default Portal;