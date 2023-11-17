import React, { useState, useRef, useContext } from 'react';
import { newBan } from '../../js/modules/RobloxModerations';
import Swal from 'sweetalert2';

import '../../css/popups/CreateRobloxBan.css';
import '../../css/Popup.css';

import Button from '../Button';
import TextBox from '../TextBox';
import TextArea from '../TextArea';

import AuthContext from '../modules/AuthContext';

function CreateRobloxBanPopup({setState}) {
    const authContext = useContext(AuthContext);
    const [popupState, setPopupState] = useState('available');

    const [rbxID, setRbxID] = useState();
    const [modID, setModID] = useState();
    const [evidence, setEvidence] = useState();
    const [reason, setReason] = useState();
    const [banDuration, setBanDuration] = useState();

    const finalize = () => {
        const final_evidence = evidence.split(' ');
        const final_banType = {};

        if (banDuration.toLowerCase() == 'permanent' || (Number(banDuration) == 0)) {
            final_banType.Type = 'Permanent';
        } else if (Number(banDuration) && Number(banDuration) > 0) {
            if (Number(banDuration) == 1) {
                final_banType.Type = banDuration + ' Day';
            } else {
                final_banType.Type = banDuration + ' Days';
            }
            final_banType.Time = Number(banDuration) * 86400
        } else {
            Swal.fire({title: 'Error', icon: 'error', text: 'Unable to derive length of ban. Please follow the formatting specified.', showConfirmButton: true, confirmButtonText: 'Ok'});
        }

        if (!final_banType.Type) return;
        setPopupState('loading');

        newBan(rbxID, modID, final_evidence, reason, final_banType)
            .then((res) => {
                console.log(res);
                if (res.message == 'No Roblox User') {
                    Swal.fire({title: 'Error', icon: 'error', text: `No Roblox User under the ID ${rbxID} was found. Ensure that you have the correct Roblox ID.`, confirmButtonText: 'Ok'});
                } else if (res.message == 'Ban Exists') {
                    Swal.fire({title: 'Error', icon: 'error', text: `That user is already banned.`, confirmButtonText: 'Ok'});
                } else if (res.message == 'Error') {
                    Swal.fire({title: 'Error', icon: 'error', text: `There was an issue trying to process your request.`, confirmButtonText: 'Ok'});
                } else {
                    Swal.fire({title: 'Success', icon: 'success', text: `${res.data.username} has been successfully banned!`, confirmButtonText: 'Ok'})
                        .then((res) => {
                            if (res.isConfirmed) {
                                setState('closed');
                                window.location.reload();
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

                    <form onSubmit={(e) => {e.preventDefault(); if (!rbxID || !modID || !evidence || !reason || !banDuration || popupState == 'loading') return; finalize();}} className='create-roblox-ban-popup-content'>
                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Roblox ID</span>
                            <TextBox setState={setRbxID} placeholder={'Input a Valid Roblox ID'}/>
                        </div>

                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Moderator ID</span>
                            <TextBox setState={setModID} placeholder={'Input a Valid Roblox ID'}/>
                        </div>

                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Reason</span>
                            <TextArea setState={setReason} placeholder={'Input a Reason'}/>
                        </div>

                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Evidence</span>
                            <TextArea setState={setEvidence} placeholder={'Input Evidence Links separated using one space'}/>
                        </div>

                        <div className='create-roblox-ban-popup-grouping'>
                            <span>Duration</span>
                            <TextArea setState={setBanDuration} placeholder={'Input a Valid Ban Duration (0 for permanent, any other number will be expected to be a unit of days)'}/>
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

export default CreateRobloxBanPopup;