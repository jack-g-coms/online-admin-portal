import React, { useState, useRef } from "react";
import { update } from "../../js/modules/User";
import Swal from "sweetalert2";

import '../../css/Popup.css';
import '../../css/popups/ApplyModifyUser.css';

import Button from "../Button";

function ApplyModifyUserPopup({setState, editedUser, changes}) {
    const [popupState, setPopupState] = useState('available');

    const applyChanges = () => {
        update(editedUser.id, editedUser, changes)
            .then(response => {
                setState('closed');
                if (response.message == 'No Roblox User') {
                    Swal.fire({title: 'Error', icon: 'error', text: `No Roblox User under the username ${editedUser.rbxUser.username} was found. Ensure that you have the correct username, and that it is spelt correctly.`, confirmButtonText: 'Ok'});
                } else if (response.message == 'No Permission Level') {
                    Swal.fire({title: 'Error', icon: 'error', text: `No Permission Level under the name ${editedUser.permissions.Name} was found. Ensure that you have the correct permission name, and that it is spelt correctly.`, confirmButtonText: 'Ok'});
                } else if (response.message == 'Success') {
                    Swal.fire({title: 'Success', text: 'Portal user has been successfully updated per your specifications.', icon: 'success', confirmButtonText: 'Ok'})
                        .then(() => {
                            window.location.reload();
                        });
                } else if (response.message == 'Unauthorized') {
                    Swal.fire({title: 'Error', icon: 'error', text: `You are not authorized to update this user with your specifications.`, confirmButtonText: 'Ok'});
                } else {
                    Swal.fire({title: 'Error', icon: 'error', text: `There was a problem while trying to update this user.`, confirmButtonText: 'Ok'});
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
                                console.log(changes)
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

export default ApplyModifyUserPopup;