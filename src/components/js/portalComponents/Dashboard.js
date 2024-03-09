import React, { useState, useEffect, useContext, useRef } from 'react';
import Swal from 'sweetalert2';
import { LineChart, CartesianGrid, XAxis, YAxis, Legend, Line, Tooltip, Label } from 'recharts';
import '../../css/portalComponents/Dashboard.css';

import AuthContext from '../modules/AuthContext';
import { getModerationStatistics, getMonthReport } from '../modules/Statistics';
import { getConfiguration } from '../modules/Configuration';
import { getWeek, getMonth } from '../../../shared';

import Loader from '../Loader';
import Button from '../Button';
import TextBox from '../TextBox';
import Dropdown from '../Dropdown';
import moment from 'moment';

function Dashboard () {
    const authContext = useContext(AuthContext);
    const [state, setState] = useState('loading');
    const [permDropdownState, setPermDropdownState] = useState('closed');

    const statistics = useRef();
    const configuration = useRef();

    const getGraphData = (arr1, arr2, key1, key2) => {
        const weekNumber = getWeek();
        var data = [];

        for (var i = 0; i < 5; i++) {
            var newWeekNumber = weekNumber - i;
            var array1Index = arr1.findIndex(({ Week }) => Week === newWeekNumber);
            var array2Index = arr2.findIndex(({ Week }) => Week === newWeekNumber);
            if (newWeekNumber <= 0) break;

            data[i] = {Week: newWeekNumber, [key1]: (array1Index != -1 && arr1[array1Index][key1]) || 0, [key2]: (array2Index != -1 && arr2[array2Index][key2]) || 0};
        }
        return data.reverse();
    }

    useEffect(() => {
        getModerationStatistics()
            .then(stats => {
                statistics.current = stats;

                getConfiguration()
                    .then(config => {
                        configuration.current = config;
                        setState('available');
                    }).catch(console.log);
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

                        {configuration.current && configuration.current.Announcement &&
                            <div className='vertical-grouping-dashboard' style={{'marginTop': '45px'}}>
                                <h2><i class="fa-solid fa-circle-exclamation" style={{'color': '#349fc9'}}/> Notice from Portal Administration</h2>
                                <div className='dashboard-notice'>
                                    <span>{configuration.current.Announcement}</span>
                                </div>
                            </div>
                        }

                        <div className='vertical-grouping-dashboard' style={{'marginTop': '45px'}}>
                            <h2><i class="fa-solid fa-chart-simple" style={{'marginRight': '5px', 'color': '#349fc9'}}/> Your Statistical Outlook</h2>

                            <div className='weekly-stats'>
                                <div className='grouping'>
                                    {statistics.current.Roblox.pastWeeksBans && <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>There have been <span style={{'color': '#c93434'}}>{statistics.current.Roblox.pastWeeksBans[0].Bans} Roblox Bans</span> this week.</span>}
                                    {statistics.current.Roblox.pastWeeksWarnings && <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>There have been <span style={{'color': '#c93434'}}>{statistics.current.Roblox.pastWeeksWarnings[0].Warnings} Roblox Warnings</span> this week.</span>}
                                </div>

                                <div className='grouping'>
                                    {((statistics.current.Roblox.thisWeeksTopBanModerator && statistics.current.Roblox.thisWeeksTopBanModerator.Moderator == 'none') || !statistics.current.Roblox.thisWeeksTopBanModerator) ? <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>There have been no roblox bans this week so there is<span style={{'color': '#c93434'}}> no top moderator yet.</span></span> : <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>Top Roblox Ban Moderator this week is <span style={{'color': '#c93434'}}>{statistics.current.Roblox.thisWeeksTopBanModerator.Moderator.name}</span> with {statistics.current.Roblox.thisWeeksTopBanModerator.Bans} bans.</span>}
                                    {((statistics.current.Roblox.thisWeeksTopWarningModerator && statistics.current.Roblox.thisWeeksTopWarningModerator.Moderator == 'none') || !statistics.current.Roblox.thisWeeksTopWarningModerator) ? <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>There have been no roblox warnings this week so there is<span style={{'color': '#c93434'}}> no top moderator yet.</span></span> : <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>Top Roblox Warning Moderator this week is <span style={{'color': '#c93434'}}>{statistics.current.Roblox.thisWeeksTopWarningModerator.Moderator.name}</span> with {statistics.current.Roblox.thisWeeksTopWarningModerator.Warnings} warnings.</span>}
                                </div>
                            </div>
                        </div>

                        <div className='chart-holder'>
                            {statistics.current.Roblox.pastWeeksBans && statistics.current.Roblox.pastWeeksWarnings &&
                                <>
                                    <h2>Roblox Moderations for the Past 4 Weeks</h2>
                                    <span style={{'color': '#f0be48'}}><i class='fa-solid fa-flag' style={{'marginRight': '3px'}}></i> Note that the right most week is this week</span>

                                    <LineChart style={{'marginTop': '15px', 'marginRight': 'none'}} width={730} height={350} data={getGraphData(statistics.current.Roblox.pastWeeksBans || [], statistics.current.Roblox.pastWeeksWarnings || [], "Bans", "Warnings", "Week")}>
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

                        <div className='vertical-grouping-dashboard' style={{'marginTop': '25px'}}>
                            <div className='weekly-stats'>
                                <div className='grouping'>
                                    {statistics.current.Discord.pastWeeksBans && <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>There have been <span style={{'color': '#349fc9'}}>{statistics.current.Discord.pastWeeksBans[0].Bans} Discord Bans</span> this week.</span>}
                                    {statistics.current.Discord.pastWeeksModerations && <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>There have been <span style={{'color': '#349fc9'}}>{statistics.current.Discord.pastWeeksModerations[0].Moderations} Discord Moderations</span> this week.</span>}
                                </div>

                                <div className='grouping' style={{'flexWrap': 'wrap'}}>
                                    {((statistics.current.Discord.thisWeeksTopBanModerator && statistics.current.Discord.thisWeeksTopBanModerator.Moderator == 'none') || !statistics.current.Discord.thisWeeksTopBanModerator) ? <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>There have been no discord bans this week so there is<span style={{'color': '#349fc9'}}> no top moderator yet.</span></span> : <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>Top Discord Ban Moderator this week is <span style={{'color': '#349fc9'}}>{statistics.current.Discord.thisWeeksTopBanModerator.Moderator}</span> with {statistics.current.Discord.thisWeeksTopBanModerator.Bans} bans.</span>}
                                    {((statistics.current.Discord.thisWeeksTopModerationModerator && statistics.current.Discord.thisWeeksTopModerationModerator.Moderator == 'none') || !statistics.current.Discord.thisWeeksTopModerationModerator) ? <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>There have been no discord moderations this week so there is<span style={{'color': '#349fc9'}}> no top moderator yet.</span></span> : <span style={{'backgroundColor': '#303030', 'padding': '10px 10px', 'borderRadius': '5px'}}>Top Discord Moderation Moderator this week is <span style={{'color': '#349fc9'}}>{statistics.current.Discord.thisWeeksTopModerationModerator.Moderator}</span> with {statistics.current.Discord.thisWeeksTopModerationModerator.Moderations} moderations.</span>}
                                </div>
                            </div>
                        </div>

                        <div className='chart-holder'>
                            {statistics.current.Discord.pastWeeksBans && statistics.current.Discord.pastWeeksModerations &&
                                <>
                                    <h2>Discord Moderations for the Past 4 Weeks</h2>
                                    <span style={{'color': '#f0be48'}}><i class='fa-solid fa-flag' style={{'marginRight': '3px'}}></i> Note that the right most week is this week</span>
                                    <LineChart style={{'marginTop': '15px', 'marginRight': 'none'}} width={730} height={350} data={getGraphData(statistics.current.Discord.pastWeeksBans || [], statistics.current.Discord.pastWeeksModerations || [], "Bans", "Moderations", "Week")}>
                                        <CartesianGrid/>
                                        <XAxis dataKey="Week" offset={25}/>
                                        <YAxis width={20}/>
                                        <Tooltip contentStyle={{'backgroundColor': '#222222', 'border': 'none', 'gap': '5px'}}/>
                                        <Legend />
                                        <Line type="monotone" dataKey="Bans" stroke="#c93434" />
                                        <Line type="monotone" dataKey="Moderations" stroke="#f0be48" />
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