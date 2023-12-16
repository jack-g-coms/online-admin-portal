import React, { useState, useRef } from "react";
import Swal from "sweetalert2";

import '../../css/Popup.css';
import '../../css/popups/ApplyModify.css';

import Button from "../Button";
import { updateModeration } from '../modules/DiscordModerations';

function ApplyModifyDiscordModerationPopup({setState, editedModeration, changes}) {
    const [popupState, setPopupState] = useState('available');

    const applyChanges = () => {
        updateModeration(editedModeration.moderationID, editedModeration.moderator, editedModeration.evidence, editedModeration.extraInfo, editedModeration.reason)
            .then(response => {
                setState('closed');
                if (response.message == 'Not Found') {
                    Swal.fire({title: 'Error', icon: 'error', text: `No Discord Moderation under the ID ${editedModeration.moderationID} was found. This moderation could've already been deleted.`, confirmButtonText: 'Ok'});
                } else if (response.message == 'Success') {
                    Swal.fire({title: 'Success', text: 'Discord Automation has been sent the request to update this moderation. If it is not updated in the next 5 minutes, retry.', icon: 'success', confirmButtonText: 'Ok'});
                } else {
                    Swal.fire({title: 'Error', icon: 'error', text: `There was a problem while trying to update this moderation.`, confirmButtonText: 'Ok'});
                }
            }).catch(console.log);
    };

    return (
        <>
            <div className='popup-background-center' onClick={(e) => {
                if (e.target != e.currentTarget || popupState == 'loading') return;
                setState('closed');
            }}>
                <div className='apply-modify-user-popup-container'>
                    <h2>Review Your Changes</h2>
                    <div className='apply-modify-user-popup-header'>
                        <span><i style={{'marginRight': '4px'}} className='fa-solid fa-circle-exclamation'/> Please review your changes carefully before you save</span>
                    </div>

                    <div className='apply-modify-user-popup-content'>
                        <div className='apply-modify-table'>
                            {Object.keys(changes).map((key, index) => {
                                const change = changes[key];
                                return (
                                    <>
                                        <p><span style={{'width': 'fit-content', 'marginRight': '5px'}}>{index + 1}</span>Change <span style={{'color': '#349fc9'}}>'{key}'</span> from <span style={{'color': '#f0be48'}}>'{change.old}'</span> to <span style={{'color': '#f0be48'}}>'{change.new}'</span></p>
                                    </>
                                );
                            })}
                        </div>

                        <div className='apply-modify-buttons'>
                            <Button animation='raise' scheme='btn-confirm' onClick={(e) => {applyChanges(); setPopupState('loading');}}>{popupState == 'available' && <><i class="fa-solid fa-gear"></i> Accept</> || (popupState == 'loading' && <i className='fa-solid fa-spinner loader'/>)}</Button>
                            {popupState != 'loading' &&
                                <Button animation='raise' scheme='btn-cancel' onClick={(e) => {setState('closed')}}><i class="fa-solid fa-ban"></i> Cancel</Button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ApplyModifyDiscordModerationPopup;