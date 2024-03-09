import React, { useState, useRef, useContext } from 'react';
import Swal from 'sweetalert2';

import '../../css/popups/CreateRobloxBan.css';
import '../../css/Popup.css';

import Button from '../Button';
import TextBox from '../TextBox';
import TextArea from '../TextArea';

import AuthContext from '../modules/AuthContext';
import * as DiscordModeration from '../../js/modules/DiscordModerations';

function CreateGlobalBanPopup({setState}) {
    const authContext = useContext(AuthContext);
    const [popupState, setPopupState] = useState('available');

    const [discordID, setDiscordID] = useState();
    const [robloxID, setRobloxID] = useState();
    const [modID, setModID] = useState(authContext.user.discordId);
    const [reason, setReason] = useState();

    const finalize = () => {
        if (!discordID || !modID || !reason) return;
        setPopupState('loading');

        DiscordModeration.newGlobalBan(discordID, robloxID, modID, reason)
            .then((res) => {
                if (res.message == 'Ban Exists') {
                    Swal.fire({title: 'Error', icon: 'error', text: `That user is already globally banned.`, confirmButtonText: 'Ok'});
                } else if (res.message == 'Error') {
                    Swal.fire({title: 'Error', icon: 'error', text: `There was an issue trying to process your request.`, confirmButtonText: 'Ok'});
                } else {
                    Swal.fire({title: 'Success', icon: 'success', text: `Discord Automation has been sent the request to create this ban. If it is not created in the next 5 minutes, retry.`, confirmButtonText: 'Ok'})
                        .then((res) => {
                            if (res.isConfirmed) {
                                setState('closed');
                            }
                        });
                }
                setPopupState('available');
            });
    };

    return (
        <>
            <div className='popup-background-center' onClick={(e) => {
                if (e.target != e.currentTarget || popupState == 'loading') return;
                setState('closed');
            }}>
                <div className='create-roblox-ban-popup-container'>
                    <h2>Create a Ban</h2>
                    <div className='create-roblox-ban-popup-header'>
                        <span><i style={{'marginRight': '4px'}} className='fa-solid fa-circle-exclamation'/> Please review your inputs carefully before you save</span>
                    </div>

                    <form onSubmit={(e) => {e.preventDefault(); finalize();}} className='create-roblox-ban-popup-content'>
                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Discord ID</span>
                            <TextBox setState={setDiscordID} placeholder={'Input a Valid Discord ID'}/>
                        </div>

                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Roblox ID</span>
                            <TextBox setState={setRobloxID} placeholder={'Input a Valid Roblox ID'}/>
                            <span style={{'fontSize': '15px', 'color': '#f0be48'}}>* Not required, if you want the system to automatically issue a Roblox ban as well, it is.</span>
                        </div>

                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Moderator ID</span>
                            <TextBox setState={setModID} defaultValue={modID} placeholder={'Input a Valid Discord ID'}/>
                        </div>

                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Reason</span>
                            <TextArea setState={setReason} placeholder={'Input a Reason'}/>
                        </div>

                        <div className='create-roblox-ban-buttons'>
                            <Button animation='raise' scheme='btn-cancel' type='submit'>{popupState == 'available' && <><i class="fa-solid fa-gavel"></i> Issue Ban</> || (popupState == 'loading' && <i className='fa-solid fa-spinner loader'/>)}</Button>
                            {popupState != 'loading' &&
                                <Button animation='raise' scheme='btn-confirm' onClick={(e) => {setState('closed')}}><i class="fa-solid fa-ban"></i> Cancel</Button>
                            }
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateGlobalBanPopup;