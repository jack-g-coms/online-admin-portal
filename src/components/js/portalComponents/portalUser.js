import React, { useState, useContext, useRef } from "react";
import Swal from "sweetalert2";

import '../../css/portalComponents/ManageUsers.css';

import Button from '../Button';
import Loader from '../Loader';
import TextBox from '../TextBox';
import ApplyModifyUserPopup from "../popups/ApplyModifyUser";

import AuthContext from "../modules/AuthContext";
import { convertToLocal } from '../../../shared';
import { deleteUser } from '../../js/modules/User';

function PortalUser({user}) {
    const [actionsVisible, setActionsVisible] = useState('hidden');
    const [state, setState] = useState('available');
    const [applyModifyPopup, setApplyModifyPopup] = useState('closed');

    const editedUser = useRef();
    const changed = useRef({});

    const authContext = useContext(AuthContext);
    const canEdit = user.permissions.Level < authContext.user.permissions.Level;

    const deleteTrigger = () => {
        deleteUser(user.id)
            .then(response => {
                if (response.message == 'Error') {
                    Swal.fire({title: 'Error', icon: 'error', text: `There was a problem while trying to update this user.`, confirmButtonText: 'Ok'});
                } else {
                    Swal.fire({title: 'Success', text: 'Portal user has been successfully deleted.', icon: 'success', confirmButtonText: 'Ok'})
                        .then(() => {
                            window.location.reload();
                        });
                }
            }).catch(console.log);
    };

    return (
        <>
            {applyModifyPopup == 'open' && <ApplyModifyUserPopup editedUser={editedUser.current} setState={setApplyModifyPopup} changes={changed.current}/>}
            <div className='manage-users-table-row'>
                {actionsVisible == 'hidden' &&
                    <>
                        <div className='manage-users-table-info fade-up'>
                            <img src={user.rbxUser.imageUrl}/>

                            <div className='manage-users-table-row-info' style={{'minWidth': '220px'}}>
                                <strong><span>{user.rbxUser.username}</span></strong>
                                <span style={{'color': '#f0be48'}}>{user.permissions.Name}</span>
                            </div>

                            <div style={{'marginLeft': '25px'}} className='manage-users-table-row-info'>
                                {user.verified &&
                                    <span style={{'color': '#34c939'}}><i style={{'fontSize': '15px'}} class="fa-solid fa-signal"/> Authenticated Portal User</span>
                                }
                                {!user.verified &&
                                    <span style={{'color': '#c93434'}}>Unauthenticated Portal User</span>
                                }
                                <span>Created on {convertToLocal(user.accountCreated)}</span>
                            </div>

                            <div style={{'marginLeft': '25px'}} className='manage-users-table-row-info'>
                                <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-id-card"/> ID</span></strong>
                                <TextBox style={{'marginTop': '3px', 'padding': '5px 10px', 'cursor': 'pointer'}} onClick={(e) => {navigator.clipboard.writeText(user.id);}} disabled={true} children={user.id}/>
                            </div>

                            <div style={{'marginLeft': '25px'}} className='manage-users-table-row-info'>
                                <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-user"/> Roblox Profile</span></strong>
                                <TextBox style={{'marginTop': '3px', 'padding': '5px 10px', 'cursor': 'pointer'}} onClick={(e) => {window.open('https://www.roblox.com/users/' + user.rbxUser.id + '/profile', '_blank', 'noreferrer')}} disabled={true} children={'https://www.roblox.com/users/' + user.rbxUser.id + '/profile'}/>
                            </div>

                            <div style={{'marginRight': '15px', 'marginLeft': 'auto'}} className='manage-users-table-row-info'>
                                <Button scheme='btn-clear' onClick={(e) => {setActionsVisible('visible'); editedUser.current = JSON.parse(JSON.stringify(user)); changed.current = {};}} animation='color pop-out'><i class="fa-solid fa-pencil"></i></Button>
                            </div>
                        </div>
                    </>
                || 
                    <>
                        <div className='manage-users-table-row-edit-container fade-in'>
                            <div style={{'alignItems': 'start', 'marginBottom': '10px'}} className='manage-users-table-row-edit-info'>
                                {!canEdit ?
                                    <Button animation='raise' scheme='btn-cancel' onClick={(e) => {setActionsVisible('hidden'); setState('available');}}><i class="fa-solid fa-ban"></i> Close</Button>
                                :
                                    <>
                                        <Button animation='raise' scheme='btn-confirm' onClick={(e) => {if (changed.current.email || changed.current.username || changed.current.permissions || changed.current.authenticated) {setApplyModifyPopup('open');}}}>{state != 'loading' && <><i class="fa-solid fa-gear"></i> Save</> || <><i className='fa-solid fa-spinner loader'/> Saving...</>}</Button>
                                    
                                        {state != 'loading' &&
                                            <>
                                                <Button animation='raise' scheme='btn-cancel' onClick={(e) => {setActionsVisible('hidden'); setState('available');}}><i class="fa-solid fa-ban"></i> Close</Button>
                                                {authContext.user.permissions.Flags.DELETE_USERS &&
                                                    <Button animation='raise' scheme='btn-cancel' onClick={(e) => {deleteTrigger();}}><i class="fa-solid fa-trash"></i> Delete</Button>
                                                }
                                            </>
                                        }
                                    </>
                                }
                            </div>

                            <div style={{'gap': '15px'}} className='manage-users-table-row-edit-info'>
                                <div className='manage-users-table-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-envelope"/> Email</span></strong>
                                    <TextBox type='email' setState={(newState) => {
                                        changed.current.email = {new: newState, old: user.email};
                                        editedUser.current.email = newState;
                                        setState('changedEmail');
                                    }} children={editedUser.current.email} disabled={!canEdit}/>
                                </div>

                                <div className='manage-users-table-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-user"/> Username</span></strong>
                                    <TextBox setState={(newState) => {
                                        changed.current.username = {new: newState, old: user.rbxUser.username};
                                        editedUser.current.rbxUser.username = newState;
                                        setState('changedUsername');
                                    }} children={editedUser.current.rbxUser.username} disabled={!canEdit}/>
                                </div>

                                <div className='manage-users-table-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-user"/> Permission</span></strong>
                                    <TextBox setState={(newState) => {
                                        changed.current.permissions = {new: newState, old: user.permissions.Name};
                                        editedUser.current.permissions.Name = newState;
                                        setState('changedPermissions');
                                    }} children={editedUser.current.permissions.Name} disabled={!canEdit}/>
                                </div>

                                <div className='manage-users-table-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-id-card"/> ID</span></strong>
                                    <TextBox style={{'cursor': 'pointer'}} onClick={(e) => {navigator.clipboard.writeText(editedUser.current.id);}} disabled={true} children={editedUser.current.id}/>
                                </div>
                            </div>

                            <div style={{'alignItems': 'center'}} className='manage-users-table-row-edit-info'>
                                {editedUser.current.verified &&
                                    <div className='manage-users-table-row-edit-grouping'>
                                        <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-signal"/> Status</span></strong>
                                        <span style={{'color': '#34c939'}}>Authenticated Portal User</span>

                                        {canEdit &&
                                            <Button onClick={(e) => {changed.current.authenticated = {new: 'false', old: user.verified.toString()}; editedUser.current.verified = false; setState('changedUnauthorized');}} style={{'marginTop': '5px'}} size='btn-small' animation='raise' scheme='btn-cancel'>Unauthorize</Button>
                                        }
                                    </div>
                                ||
                                    <div className='manage-users-table-row-edit-grouping'>
                                        <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-signal"/> Status</span></strong>
                                        <span style={{'color': '#c93434'}}>Unauthenticated Portal User</span>
                                        {canEdit &&
                                            <Button onClick={(e) => {changed.current.authenticated = {new: 'true', old: user.verified.toString()}; editedUser.current.verified = true; setState('changedAuthorized');}} style={{'marginTop': '5px'}} size='btn-small' animation='raise' scheme='btn-confirm'>Authorize</Button>
                                        }
                                    </div>
                                }
                            </div>

                            {(changed.current.email || changed.current.username || changed.current.permissions || changed.current.authenticated) &&
                                <span style={{'color': '#f0be48', 'marginTop': '8px'}}><i style={{'marginRight': '2px'}} className='fa-solid fa-circle-exclamation'/> You have made unsaved changes</span>
                            }
                        </div>   
                    </>
                }
            </div>
        </>
    );
};

export default PortalUser;