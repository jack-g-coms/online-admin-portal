import React, { useContext, useState, useEffect, useRef } from 'react';
import { socket } from '../js/modules/Socket';

import '../css/Portal.css';

import Button from '../js/Button';
import TextBox from '../js/TextBox';

import AuthContext from '../js/modules/AuthContext';
import { timeFormat } from '../../shared';

import RobloxUserLookupPopup from '../js/popups/RobloxUserLookup';
import DiscordUserLookupPopup from '../js/popups/DiscordUserLookup';
import PortalNoticePopup from '../js/popups/PortalNotice';
import DevNoticePopup from '../js/popups/DevelopmentNotice';
import DisconnectedPopup from '../js/popups/Disconnected';
import MonthlyOverviewReportPopup from '../js/popups/MonthlyOverviewReport';

import Dashboard from '../js/portalComponents/Dashboard';

import ManageUsers from '../js/portalComponents/manageUsers';
import ManageRobloxBans from '../js/portalComponents/RobloxSystem/manageRobloxBans';
import ManageRobloxWarnings from '../js/portalComponents/RobloxSystem/manageRobloxWarnings';

import ManageDiscordBans from '../js/portalComponents/DiscordSystem/manageDiscordBans';
import ManageDiscordModerations from '../js/portalComponents/DiscordSystem/manageDiscordModerations';

import ManageGlobalBans from '../js/portalComponents/DiscordSystem/manageGlobalBans';

import CreateEmbed from '../js/portalComponents/BotAutomation/CreateEmbed';

function Portal({view}) {
    const [viewProfileState, setProfileViewState] = useState('closed');
    const [robloxUserLookupPopupState, setRobloxUserLookupPopupState] = useState('closed');
    const [discordUserLookupPopupState, setDiscordUserLookupPopupState] = useState('closed');

    const [noticePopupState, setNoticePopupState] = useState('closed');
    const [devNoticePopupState, setDevNoticePopupState] = useState('closed');
    const [monthlyOverviewPopupState, setMonthlyOverviewPopupState] = useState('closed');
    const [disconnectPopupState, setDisconnectPopupState] = useState({open: false});

    const authContext = useContext(AuthContext);
    const gateways = useRef();

    const params = new URLSearchParams(window.location.search);
    const [portalComponentState, setPortalComponentState] = useState(view || 'dashboard');

    useEffect(() => {
        socket.emit('getConnectedGateways', (res) => {
            gateways.current = res;
        });

        socket.on('forceDisconnect', (data, response) => {
            if (!data.reason) return;
            if (response) response();
            setDisconnectPopupState({open: true, reason: data.reason});
        });
    }, []);

    useEffect(() => {
        if (!portalComponentState) return;
        const newURl = window.location.protocol + '//' + window.location.host + '/portal/' + portalComponentState

        if (newURl != window.location.protocol + '//' + window.location.host + window.location.pathname) {
            window.history.pushState({path: newURl}, '', newURl);
        }
    }, [portalComponentState]);

    return (
        <>
            <div className='portal-container'>
                {robloxUserLookupPopupState == 'open' && <RobloxUserLookupPopup setState={setRobloxUserLookupPopupState}/>}
                {discordUserLookupPopupState == 'open' && <DiscordUserLookupPopup setState={setDiscordUserLookupPopupState}/>}
                {noticePopupState == 'open' && <PortalNoticePopup setState={setNoticePopupState}/>}
                {devNoticePopupState == 'open' && <DevNoticePopup setState={setDevNoticePopupState}/>}
                {disconnectPopupState.open == true && <DisconnectedPopup reason={disconnectPopupState.reason}/>}
                {monthlyOverviewPopupState == 'open' && <MonthlyOverviewReportPopup setState={setMonthlyOverviewPopupState}/>}

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

                                {viewProfileState == 'closed' ? <i style={{'marginLeft': 'auto', 'marginRight': '5px'}} class="fa-solid fa-angle-up"></i> : <i style={{'marginLeft': 'auto', 'marginRight': '5px'}} class="fa-solid fa-angle-down"></i>}
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

                    <div className='sidebar-profile-view-grouping' id='sidebar-top-item'>
                        <Button animation='pop-out color-purple' style={{'width': '100%'}} onClick={(e) => {setPortalComponentState('dashboard');}} size='btn-large' scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-home'/>Dashboard</Button>
                    </div>

                    <div className='sidebar-profile-view-grouping'>
                        <div className='sidebar-grouping-title'>
                            <img style={{'marginRight': '3px', 'width': '30px', 'height': '30px'}} src='/media/images/discord-logo.png'/> 
                            <h1>Discord System</h1>
                        </div>
                        <Button animation='pop-out color' style={{'width': '100%'}} onClick={(e) => {setPortalComponentState('discordBans');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-gavel'/>Bans</Button>
                        {authContext.user.permissions.Flags.VIEW_GLOBAL_BANS && <Button animation='pop-out color' style={{'width': '100%'}} onClick={(e) => {setPortalComponentState('globalBans');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-gavel'/>Global Bans</Button>}
                        <Button animation='pop-out color' style={{'width': '100%'}} onClick={(e) => {setPortalComponentState('discordModerations');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-clipboard-user'/>Moderations</Button>
                        <Button animation='pop-out color' style={{'width': '100%'}} onClick={(e) => {setDiscordUserLookupPopupState('open');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-user'/>User Lookup</Button>
                    </div>

                    <div className='sidebar-profile-view-grouping'>
                        <div className='sidebar-grouping-title'>
                            <img style={{'marginRight': '3px', 'width': '30px', 'height': '30px'}} src='/media/images/roblox-logo-red.png'/> 
                            <h1>Roblox System</h1>
                        </div>
                        <Button animation='pop-out color-red' style={{'width': '100%'}} onClick={(e) => {setPortalComponentState('robloxBans');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-gavel'/>Bans</Button>
                        <Button animation='pop-out color-red' style={{'width': '100%'}} onClick={(e) => {setPortalComponentState('robloxWarnings');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-circle-exclamation'/>Warnings</Button>
                        <Button animation='pop-out color-red' style={{'width': '100%'}} onClick={(e) => {setRobloxUserLookupPopupState('open');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-user'/>User Lookup</Button>
                    </div>

                    {authContext.user.permissions.Flags.MANAGE_USERS &&
                        <div className='sidebar-profile-view-grouping'>
                            <div className='sidebar-grouping-title'>
                                <img style={{'marginRight': '3px', 'width': '30px', 'height': '30px'}} src='/media/images/management-logo.png'/> 
                                <h1>Management System</h1>
                            </div>
                            <Button animation='pop-out color-yellow' style={{'width': '100%'}} onClick={(e) => {setPortalComponentState('users');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-user'/>Users</Button>
                            {authContext.user.permissions.Flags.CREATE_PORTAL_NOTICE && <Button animation='pop-out color-yellow' style={{'width': '100%'}} onClick={(e) => {setNoticePopupState('open');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-flag'/>Portal Notice</Button>}
                            {authContext.user.permissions.Flags.CREATE_PORTAL_NOTICE && <Button animation='pop-out color-yellow' style={{'width': '100%'}} onClick={(e) => {setDevNoticePopupState('open');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-hammer'/>Development Notice</Button>}
                        </div>
                    }

                    <div className='sidebar-profile-view-grouping'>
                        <div className='sidebar-grouping-title'>
                            <i style={{'marginRight': '10px', 'marginLeft': '5px', 'marginBottom': '.5px'}} id='stats-logo' class="fa-solid fa-square-poll-vertical"></i>
                            <h1>Statistics</h1>
                        </div>
                        <Button animation='pop-out color-purple' style={{'width': '100%'}} onClick={(e) => {setMonthlyOverviewPopupState('open');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-square-poll-horizontal'/>Monthly Overview Report</Button>
                        
                    </div>

                    {authContext.user.permissions.Flags.BOT_ACTIONS &&
                        <div className='sidebar-profile-view-grouping'>
                            <div className='sidebar-grouping-title'>
                                <i style={{'marginRight': '10px', 'marginLeft': '5px', 'marginBottom': '4px'}} id='robot-logo' class="fa-solid fa-robot"></i>
                                <h1>Bot Actions</h1>
                            </div>
                            <Button animation='pop-out color-purple' style={{'width': '100%'}} onClick={(e) => {setPortalComponentState('createEmbed');}} scheme='btn-outlinebottom'><i style={{'marginRight': '8px'}} className='fa-solid fa-envelope'/>Create Embed</Button>
                        </div>
                    }

                    <div className='sidebar-profile-view-bottom'>
                        <i class="fa-solid fa-circle-info"></i>
                        <span>All actions are logged and processed by Portal Administrators apart of Technical Services.</span>
                    </div>
                </div>

                {portalComponentState == 'dashboard' &&
                    <Dashboard/>
                }

                {portalComponentState == 'users' &&
                    <ManageUsers/>
                } 

                {portalComponentState == 'robloxBans' &&
                    <ManageRobloxBans/>
                }

                {portalComponentState == 'robloxWarnings' &&
                    <ManageRobloxWarnings/>
                }

                {portalComponentState == 'discordBans' &&
                    <ManageDiscordBans/>
                }

                {portalComponentState == 'discordModerations' &&
                    <ManageDiscordModerations/>
                }

                {portalComponentState == 'createEmbed' &&
                    <CreateEmbed/>
                }
                
                {portalComponentState == 'globalBans' &&
                    <ManageGlobalBans/>
                }
            </div>
        </>
    );
};

export default Portal;