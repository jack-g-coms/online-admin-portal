import React, { useState, useRef, useContext } from 'react';
import '../../../css/portalComponents/DiscordSystem/ManageGlobalBansRow.css';

import Swal from 'sweetalert2';

import Button from '../../Button';
import TextBox from '../../TextBox';
import TextArea from '../../TextArea';

import AuthContext from '../../modules/AuthContext';
import ApplyModifyGlobalBanPopup from '../../popups/ApplyModifyGlobalBan';
import * as DiscordModeration from '../../modules/DiscordModerations';
import { convertToLocal, filterString } from '../../../../shared';

function ManageGlobalBansRow({ban}) {
    const [editorState, setEditorState] = useState('hidden');
    const [state, setState] = useState('available');
    const [applyModifyPopup, setApplyModifyPopup] = useState('hidden');
    const [popupState, setPoupState] = useState('available');
    const [actionState, setActionState] = useState('none');

    const authContext = useContext(AuthContext);

    const editedBan = useRef();
    const changed = useRef({});

    const deleteTrigger = () => {
        DiscordModeration.deleteGlobalBan(ban.discordID)
            .then(response => {
                if (response.message != 'Success') {
                    Swal.fire({title: 'Error', icon: 'error', text: `There was a problem while trying to update this ban.`, confirmButtonText: 'Ok'});
                } else {
                    Swal.fire({title: 'Success', text: 'Discord Automation has been sent the request to delete this ban. If it is not gone in the next 5 minutes, retry.', icon: 'success', confirmButtonText: 'Ok'});
                    setEditorState('hidden');
                    setActionState('deleted');
                }
            }).catch(console.log);
    };

    return (
        <>
            {applyModifyPopup == 'open' && <ApplyModifyGlobalBanPopup editedBan={editedBan.current} setState={setApplyModifyPopup} setActionState={setActionState} setEditorState={setEditorState} changed={changed}/>}
            <div onClick={(e) => {if ((e.target.classList.contains('textarea') || popupState == 'loading')) return; if (editorState == 'open' || actionState != 'none') return; setEditorState('open'); editedBan.current = JSON.parse(JSON.stringify(ban));}} className='manage-roblox-bans-container-row'>
                {editorState == 'open' &&
                    <>
                        <div className='ban-editor-container fade-in'>
                            <div style={{'alignItems': 'start', 'marginBottom': '10px'}} className='ban-editor-row-edit-info'>
                                {authContext.user.permissions.Flags.UPDATE_GLOBAL_BANS &&
                                    <Button animation='raise' scheme='btn-confirm' onClick={(e) => {if (changed.current.moderator || changed.current.reason) {setApplyModifyPopup('open');}}}>{state != 'loading' && <><i class="fa-solid fa-gear"></i> Save</> || <><i className='fa-solid fa-spinner loader'/> Saving...</>}</Button>
                                }

                                {state != 'loading' &&
                                    <>
                                        <Button animation='raise' scheme='btn-cancel' onClick={(e) => {setEditorState('hidden'); setState('available'); changed.current = {};}}><i class="fa-solid fa-ban"></i> Close</Button>
                                        {authContext.user.permissions.Flags.DELETE_GLOBAL_BANS &&
                                            <Button animation='raise' scheme='btn-cancel' onClick={(e) => {deleteTrigger();}}><i class="fa-solid fa-trash"></i> Delete</Button>
                                        }
                                    </>
                                }
                            </div>

                            <div style={{'gap': '15px'}} className='ban-editor-row-edit-info'>
                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-user"/> Discord ID</span></strong>
                                    <TextBox defaultValue={editedBan.current.discordID} disabled={true}/>
                                </div>

                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-user"/> Roblox ID</span></strong>
                                    <TextBox defaultValue={editedBan.current.robloxID} disabled={true}/>
                                </div>
                            </div>

                            <div style={{'gap': '15px'}} className='ban-editor-row-edit-info'>
                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-user"/> Moderator ID</span></strong>
                                    <TextBox setState={(newState) => {
                                        changed.current.moderator = {new: newState, old: ban.moderator};
                                        editedBan.current.moderator = newState;
                                        setState('changedModerator');
                                    }} defaultValue={editedBan.current.moderator} disabled={!authContext.user.permissions.Flags.UPDATE_GLOBAL_BANS}/>
                                </div>
                            </div>

                            <div style={{'gap': '15px'}} className='ban-editor-row-edit-info'>
                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-file"/> Reason</span></strong>
                                    <TextArea setState={(newState) => {
                                        changed.current.reason = {new: newState, old: ban.reason};
                                        editedBan.current.reason = newState;
                                        setState('changedReason');
                                    }} defaultValue={editedBan.current.reason} disabled={!authContext.user.permissions.Flags.UPDATE_GLOBAL_BANS}/>
                                </div>
                            </div>

                            {(changed.current.moderator || changed.current.reason) &&
                                <span style={{'color': '#f0be48', 'paddingLeft': '13px', 'marginTop': '8px'}}><i style={{'marginRight': '2px'}} className='fa-solid fa-circle-exclamation'/> You have made unsaved changes</span>
                            }
                        </div>
                    </>
                }

                {actionState != 'none' &&
                    <div className='action-state-overlay'>
                        <span style={{'color': '#349fc9', 'fontWeight': '600'}}><i style={{'marginRight': '2px'}} class="fa-solid fa-circle-info"></i> You have made modifications to this ban that require Roman Systems Automation to complete.</span>
                        <span>If you refresh and the expected changes haven't been made, wait 5 minutes before retrying.</span>
                    </div>
                }

                {editorState == 'hidden' &&
                    <>
                        <div className='row-grouping'>
                            <span><span style={{'color': '#f0be48'}}>Type:</span> Permanent Global Ban</span>
                            <span><span style={{'color': '#349fc9'}}><i class="fa-regular fa-calendar-xmark"></i> Banned on </span> {convertToLocal(ban.timestamp)}</span>
                        </div>

                        <div className='row-grouping'>
                            <span><span style={{'color': '#f0be48'}}>DiscordID:</span> {ban.discordID}</span>
                            <span><span style={{'color': '#f0be48'}}>RobloxID:</span> {ban.robloxID || 'None provided'}</span>
                            <span><span style={{'color': '#f0be48'}}>ModeratorID:</span> {ban.moderator || 'None provided'}</span>
                        </div>

                        <div className='row-grouping'>
                            <span style={{'color': '#f0be48'}}>Reason</span>
                            <TextArea onClick={(e) => {navigator.clipboard.writeText(ban.reason);}} style={{'resize': 'none', 'cursor': 'pointer', 'width': '75%'}} disabled={true} children={ban.reason || 'None provided'}/>
                        </div>

                        <div className='row-grouping'>
                            {ban.robloxID &&
                                <span style={{'color': '#34c939'}}><i style={{'marginRight': '8px'}} className='fa-solid fa-gavel'/>Roblox Banned</span>
                            }
                            {!ban.robloxID &&
                                <span style={{'color': '#c93434'}}><i style={{'marginRight': '8px'}} className='fa-solid fa-gavel'/>Not Roblox Banned</span>
                            }
                        </div>
                    </>
                }
            </div>
        </>
    );
};

export default ManageGlobalBansRow;