import React, { useState, useRef, useContext } from 'react';
import { newModeration } from '../../js/modules/DiscordModerations';
import Swal from 'sweetalert2';

import '../../css/popups/CreateRobloxBan.css';
import '../../css/Popup.css';

import Button from '../Button';
import TextBox from '../TextBox';
import TextArea from '../TextArea';

import AuthContext from '../modules/AuthContext';

function CreateDiscordWarningPopup({setState}) {
    const authContext = useContext(AuthContext);
    const [popupState, setPopupState] = useState('available');

    const [discordID, setDiscordID] = useState();
    const [modID, setModID] = useState();
    const [evidence, setEvidence] = useState();
    const [reason, setReason] = useState();

    const finalize = () => {
        const final_evidence = evidence.split(' ');
        setPopupState('loading');

        newModeration(discordID, modID, 'Warn', final_evidence, {}, reason)
            .then((res) => {
                if (res.message == 'Success') {
                    Swal.fire({title: 'Success', icon: 'success', text: `Discord Automation has been sent the request to create this moderation. If it is not created in the next 5 minutes, retry.`, confirmButtonText: 'Ok'})
                        .then((res) => {
                            if (res.isConfirmed) {
                                setState('closed');
                            }
                        });
                } else {
                    Swal.fire({title: 'Error', icon: 'error', text: `There was an issue trying to process your request.`, confirmButtonText: 'Ok'});
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
                    <h2>Create a Warning</h2>
                    <div className='create-roblox-ban-popup-header'>
                        <span><i style={{'marginRight': '4px'}} className='fa-solid fa-circle-exclamation'/> Please review your inputs carefully before you save</span>
                    </div>

                    <form onSubmit={(e) => {e.preventDefault(); if (!discordID || !modID || !evidence || !reason || popupState == 'loading') return; finalize();}} className='create-roblox-ban-popup-content'>
                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Discord ID</span>
                            <TextBox setState={setDiscordID} placeholder={'Input a Valid Discord ID'}/>
                        </div>

                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Moderator ID</span>
                            <TextBox setState={setModID} placeholder={'Input a Valid Discord ID'}/>
                        </div>

                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Reason</span>
                            <TextArea setState={setReason} placeholder={'Input a Reason'}/>
                        </div>

                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Evidence</span>
                            <TextArea setState={setEvidence} placeholder={'Input Evidence Links separated using one space'}/>
                        </div>

                        <div className='create-roblox-ban-buttons'>
                            <Button animation='raise' scheme='btn-cancel' type='submit'>{popupState == 'available' && <><i class="fa-solid fa-gavel"></i> Issue Moderation</> || (popupState == 'loading' && <i className='fa-solid fa-spinner loader'/>)}</Button>
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

export default CreateDiscordWarningPopup;