import React, { useState, useRef, useContext } from 'react';

import '../../css/popups/RobloxUserLookup.css';
import '../../css/popups/Disconnect.css';
import '../../css/Popup.css';

import Button from '../Button';

import AuthContext from '../modules/AuthContext';

function DisconnectedPopup({reason}) {
    const authContext = useContext(AuthContext);
    
    return (
        <>
            <div className='popup-background-center'>
                <div className='popup-container'>
                    <h2>Forcefully Disconnected</h2>
                    <div className='header'>
                        <span><i style={{'marginRight': '4px'}} className='fa-solid fa-circle-exclamation'/> You are no longer connected to the Portal Gateway</span>
                    </div>

                    <div style={{'alignItems': 'center', 'justifyContent': 'center', 'marginTop': '-2px', 'gap': '10px', 'fontSize': '20px', 'textAlign': 'center'}} className='content'>
                        <span className='disconnect-notice' style={{'fontSize': '20px', 'textAlign': 'center'}}><i style={{'fontSize': '15px', 'marginRight': '5px'}} class="fa-solid fa-signal"/>Your connection to the portal has been forcefully disconnected</span>
                        {reason == 'User Change' &&
                            <span style={{'color': '#f0be48'}}>Your user has been modified by a Portal Management member and, in order to enact the changes, you must reload your page.</span>
                        }
                        {reason == 'Access Removed' &&
                            <span style={{'color': '#f0be48'}}>Your user has been deleted by a Portal Management member and you need to refresh.</span>
                        }
                    </div>

                    <div className='disconnect-btns'>
                        <Button onClick={(e) => {window.location.reload();}} scheme='btn-confirm'><i style={{'marginRight': '4px'}} class="fa-solid fa-arrows-rotate"></i> Refresh</Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DisconnectedPopup;