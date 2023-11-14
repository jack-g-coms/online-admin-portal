import React, { useState, useRef, useContext, useEffect } from 'react'; 
import '../../../css/portalComponents/RobloxSystem/ManageBans.css';

import Button from '../../Button';
import TextBox from '../../TextBox';
import Loader from '../../Loader';

import AuthContext from '../../modules/AuthContext';
import { getBans, searchBan, newBan } from '../../modules/RobloxModerations';

function ManageRobloxBans() {
    const authContext = useContext(AuthContext);

    const [state, setState] = useState('loading');
    const bans = useRef();

    useEffect(() => {
        getBans()
            .then(bansReq => {
                bans.current = bansReq.data || {};

                setTimeout(() => {
                    setState('available');
                }, 3000);
            }).catch(console.log);
    }, []);

    return (
        <>
            <div className='manage-roblox-bans-page'>
                {state == 'loading' &&
                    <Loader style={{'margin': 'auto'}}/>
                }
                
                {state == 'available' && bans.current &&
                    <>
                        <div className='manage-roblox-bans-container'>
                            <div className='manage-roblox-bans-container-header-row'>
                                <h1><i style={{'marginRight': '4px'}} class='fa-solid fa-circle-info'/> Roblox Ban Actions</h1>
                            </div>

                            <div className='manage-roblox-bans-table'>
                                <div style={{'alignItems': 'center', 'justifyContent': 'center'}} className='manage-roblox-bans-container-row'>
                                    <Button animation='raise' scheme='btn-confirm'>Create Ban</Button>
                                </div>
                            </div>
                        </div>

                        <div className='manage-roblox-bans-container'>
                            <div className='manage-roblox-bans-container-header-row'>
                                <h1><i style={{'marginRight': '4px'}} class='fa-solid fa-gavel'/> Roblox Bans</h1>
                            </div>

                            <div className='manage-roblox-bans-container-header-notice'>
                                <span><i style={{'marginRight': '4px'}} className='fa-solid fa-circle-exclamation'/> All bans are pulled from a live API: <strong>request spamming is prohibited</strong></span>
                            </div>

                            <div className='manage-roblox-bans-table-container'>
                                <div className='manage-roblox-bans-table'>
                                    {bans.current.map((ban, i) => {
                                        return (
                                            <>
                                                <div className='manage-roblox-bans-container-row'>
                                                    <span>{ban.rbxID}</span>
                                                </div>
                                            </>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </>
                }
            </div>
        </>
    );
};

export default ManageRobloxBans;