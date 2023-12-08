import React, { useState, useEffect, useContext, useRef } from 'react';
import { LineChart, CartesianGrid, XAxis, YAxis, Legend, Line, Tooltip, Label } from 'recharts';
import '../../css/portalComponents/Dashboard.css';

import AuthContext from '../modules/AuthContext';
import { getRobloxModerationStatistics } from '../modules/Statistics';

import Loader from '../Loader';

function Dashboard () {
    const authContext = useContext(AuthContext);
    const [state, setState] = useState('loading');
    const [permDropdownState, setPermDropdownState] = useState('closed');

    const statistics = useRef();

    useEffect(() => {
        getRobloxModerationStatistics()
            .then(stats => {
                statistics.current = stats;
                setState('available');
            }).catch(console.log);
    }, []);

    return (
        <>
            {state == 'loading' &&
                <div className='loader-keeper'>
                    <Loader/>
                </div>
            }

            {state == 'available' && statistics.current &&
                <div className='page'>
                    <h2>Welcome back {authContext.user.rbxUser.username}!</h2>
                    <span id='sub-line'>The portal supplies you with all the info you need to make informed decisions.</span>
                    <span id='sub-line' style={{'color': '#f0be48'}}>Any concerns? Contact a portal authority.</span>

                    <div className='content'>
                        <div className='grouping profile-view' style={{'gap': '25px'}}>
                            <div className='vertical-grouping-dashboard'>
                                <img className='you' src={authContext.user.rbxUser.imageUrl}/>
                            </div>
                            
                            <div className='vertical-grouping-dashboard' style={{'marginTop': '10px'}}>
                                <span>{authContext.user.rbxUser.username}</span>
                                <span style={{'color': '#f0be48'}}>{authContext.user.permissions.Name}</span>

                                <div className='vertical-grouping-dashboard permissions-view'> 
                                    <span onClick={() => setPermDropdownState(permDropdownState == 'opened' ? 'closed' : 'opened')} className='perm-click' style={{'color': '#349fc9'}}>Permissions {permDropdownState == 'opened' ? <i style={{'marginLeft': 'auto', 'marginRight': '5px'}} class="fa-solid fa-angle-up"></i> : <i style={{'marginLeft': 'auto', 'marginRight': '5px'}} class="fa-solid fa-angle-down"></i>}</span>

                                    {permDropdownState == 'opened' &&
                                        <div className='permissions-container'>
                                            <span><i style={{'color': '#f0be48'}} class='fa-solid fa-flag'></i> Permission Flags</span>
                                            {Object.keys(authContext.user.permissions.Flags).map((flag, i) => {
                                                return <span>{flag}</span>
                                            })}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className='vertical-grouping-dashboard' style={{'marginTop': '50px'}}>
                            <h2>Statistics</h2>
                            <div className='weekly-stats'>
                                <div className='grouping'>
                                    {statistics.current.pastWeeksBans && <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>There have been <span style={{'color': '#c93434'}}>{statistics.current.pastWeeksBans[0].Bans} Roblox Bans</span> this week.</span>}
                                    {statistics.current.pastWeeksWarnings && <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>There have been <span style={{'color': '#c93434'}}>{statistics.current.pastWeeksWarnings[0].Warnings} Roblox Warnings</span> this week.</span>}
                                </div>

                                <div className='grouping'>
                                    {statistics.current.thisWeeksTopBanModerator && <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>Top Roblox Ban Moderator this week is <span style={{'color': '#c93434'}}>{statistics.current.thisWeeksTopBanModerator.Moderator.name}</span> with {statistics.current.thisWeeksTopBanModerator.Moderations} bans this week.</span>}
                                    {statistics.current.thisWeeksTopWarningModerator && <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>Top Roblox Warning Moderator this week is <span style={{'color': '#c93434'}}>{statistics.current.thisWeeksTopWarningModerator.Moderator.name}</span> with {statistics.current.thisWeeksTopWarningModerator.Moderations} warnings this week.</span>}
                                </div>
                            </div>
                        </div>

                        <div className='chart-holder'>
                            {statistics.current.pastWeeksBans && statistics.current.pastWeeksWarnings &&
                                <>
                                    <h2>Roblox Moderations for the Past 4 Weeks</h2>
                                    <span style={{'color': '#f0be48'}}><i class='fa-solid fa-flag' style={{'marginRight': '3px'}}></i> Note that week 0 is this week</span>
                                
                                    <LineChart style={{'marginTop': '15px', 'marginRight': 'none'}} width={730} height={350} data={[...statistics.current.pastWeeksBans.map((ban, i) => {
                                        return {Week: Number(ban.Week), Bans: ban.Bans, Warnings: statistics.current.pastWeeksWarnings[i].Warnings}
                                    })]}>
                                        <CartesianGrid/>
                                        <XAxis dataKey="Week" offset={25}/>
                                        <YAxis width={20}/>
                                        <Tooltip contentStyle={{'backgroundColor': '#222222', 'border': 'none', 'gap': '5px'}}/>
                                        <Legend />
                                        <Line type="monotone" dataKey="Bans" stroke="#c93434" />
                                        <Line type="monotone" dataKey="Warnings" stroke="#f0be48" />
                                    </LineChart>
                                </>
                            }
                        </div>
                    </div>
                </div>
            }
        </>
    );
};

export default Dashboard