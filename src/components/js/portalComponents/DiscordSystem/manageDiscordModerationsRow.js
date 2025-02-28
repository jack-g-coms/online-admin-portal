import React, { useState, useRef, useContext } from 'react';
import '../../../css/portalComponents/RobloxSystem/ManageBansRow.css';

import Swal from 'sweetalert2';

import Button from '../../Button';
import TextBox from '../../TextBox';
import TextArea from '../../TextArea';

import AuthContext from '../../modules/AuthContext';
import ApplyModifyDiscordModerationPopup from '../../popups/ApplyModifyDiscordModeration';
import { updateModeration, deleteModeration, newModeration } from '../../modules/DiscordModerations';
import { convertToLocal, filterString } from '../../../../shared';

function ManageModerationsRow({moderation}) {
    const [editorState, setEditorState] = useState('hidden');
    const [state, setState] = useState('available');
    const [applyModifyPopup, setApplyModifyPopup] = useState('hidden');
    const [popupState, setPoupState] = useState('available');
    const [actionState, setActionState] = useState('none');

    const authContext = useContext(AuthContext);

    const editedModeration = useRef();
    const changed = useRef({});

    const deleteTrigger = () => {
        deleteModeration(moderation.moderationID)
            .then(response => {
                if (response.message != 'Success') {
                    Swal.fire({title: 'Error', icon: 'error', text: `There was a problem while trying to update this moderation.`, confirmButtonText: 'Ok'});
                } else {
                    Swal.fire({title: 'Success', text: 'Discord Automation has been sent the request to delete this moderation. If it is not gone in the next 5 minutes, retry.', icon: 'success', confirmButtonText: 'Ok'});
                    setActionState('deleted');
                    setEditorState('hidden');
                }
            }).catch(console.log);
    };

    return (
        <>
            {applyModifyPopup == 'open' && <ApplyModifyDiscordModerationPopup editedModeration={editedModeration.current} setState={setApplyModifyPopup} setActionState={setActionState} setEditorState={setEditorState} changed={changed}/>}

            <div onClick={(e) => {if ((e.target.classList.contains('textarea') || popupState == 'loading')) return; if (editorState == 'open' || actionState != 'none') return; setEditorState('open'); editedModeration.current = JSON.parse(JSON.stringify(moderation));}} className='manage-roblox-bans-container-row'>
                {editorState == 'open' &&
                    <>
                        <div className='ban-editor-container fade-in'>
                            <div style={{'alignItems': 'start', 'marginBottom': '10px'}} className='ban-editor-row-edit-info'>
                                {authContext.user.permissions.Flags.UPDATE_DISCORD_MODERATIONS && (!moderation.isActive || (moderation.isActive && moderation.moderationType != 'Ban' && moderation.moderationType != 'Permanent Ban')) &&
                                    <Button animation='raise' scheme='btn-confirm' onClick={(e) => {if (changed.current.moderator || changed.current.reason || changed.current.evidence || changed.current.duration) {setApplyModifyPopup('open');}}}>{state != 'loading' && <><i class="fa-solid fa-gear"></i> Save</> || <><i className='fa-solid fa-spinner loader'/> Saving...</>}</Button>
                                }

                                {state != 'loading' &&
                                    <>
                                        <Button animation='raise' scheme='btn-cancel' onClick={(e) => {setEditorState('hidden'); setState('available'); changed.current = {};}}><i class="fa-solid fa-ban"></i> Close</Button>
                                        {authContext.user.permissions.Flags.DELETE_DISCORD_MODERATIONS && (!moderation.isActive || (moderation.isActive && moderation.moderationType != 'Ban' && moderation.moderationType != 'Permanent Ban')) &&
                                            <Button animation='raise' scheme='btn-cancel' onClick={(e) => {deleteTrigger();}}><i class="fa-solid fa-trash"></i> Delete</Button>
                                        }
                                    </>
                                }
                            </div>

                            <div style={{'gap': '15px'}} className='ban-editor-row-edit-info'>
                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-user"/> Discord ID</span></strong>
                                    <TextBox defaultValue={editedModeration.current.discordID} disabled={true}/>
                                </div>

                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-user"/> Moderator ID</span></strong>
                                    <TextBox setState={(newState) => {
                                        changed.current.moderator = {new: newState, old: moderation.moderator};
                                        editedModeration.current.moderator = newState;
                                        setState('changedModerator');
                                    }} defaultValue={editedModeration.current.moderator} disabled={!authContext.user.permissions.Flags.UPDATE_DISCORD_MODERATIONS || (moderation.isActive && (moderation.moderationType == 'Permanent Ban' || moderation.moderationType == 'Ban'))}/>
                                </div>
                            </div>

                            <div style={{'gap': '15px'}} className='ban-editor-row-edit-info'>
                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-file"/> Reason</span></strong>
                                    <TextArea setState={(newState) => {
                                        changed.current.reason = {new: newState, old: moderation.reason};
                                        editedModeration.current.reason = newState;
                                        setState('changedReason');
                                    }} defaultValue={editedModeration.current.reason} disabled={!authContext.user.permissions.Flags.UPDATE_DISCORD_MODERATIONS || (moderation.isActive && (moderation.moderationType == 'Permanent Ban' || moderation.moderationType == 'Ban'))}/>
                                </div>

                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-file"/> Evidence</span></strong>
                                    <TextArea setState={(newState) => {
                                        changed.current.evidence = {new: newState.split(' ').join(', '), old: moderation.evidence.join(', ')};
                                        editedModeration.current.evidence = newState.split(' ');
                                        setState('changedEvidence');
                                    }} defaultValue={editedModeration.current.evidence.join(' ')} disabled={!authContext.user.permissions.Flags.UPDATE_DISCORD_MODERATIONS || (moderation.isActive && (moderation.moderationType == 'Permanent Ban' || moderation.moderationType == 'Ban'))}/>
                                </div>
                            </div>

                            {moderation.extraInfo.length && moderation.extraInfo.expires && moderation.moderationType == 'Mute' &&
                                <div style={{'gap': '15px'}} className='ban-editor-row-edit-info'>
                                    <div className='ban-editor-row-edit-grouping'>
                                        <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-clock"/> Duration</span></strong>
                                        <TextBox setState={(newText) => {
                                            var extraInfo = {};
                                            var modTime;
                                            const newState = filterString(newText, ['hour', 'Hour', 'Hours', 's'], ''); 

                                            if (newState && Number(newState) && Number(newState) > 0) {
                                                extraInfo.length = Number(newState) * 3600;
                                                extraInfo.expires = moderation.moderatedOn + extraInfo.length
                                            }
                                            if (!extraInfo.length && !extraInfo.expires) return;

                                            changed.current.duration = {new: newState + ' Hours', old: Math.ceil((moderation.extraInfo.length / 60) / 60) + ' Hours'};
                                            editedModeration.current.extraInfo = extraInfo;

                                            setState('changedType');
                                        }} defaultValue={Math.ceil((moderation.extraInfo.length / 60) / 60) + ' Hours'} disabled={!authContext.user.permissions.Flags.UPDATE_DISCORD_MODERATIONS}/>
                                    </div>
                                </div>
                            }

                            {(changed.current.moderator || changed.current.reason || changed.current.evidence || changed.current.duration) &&
                                <span style={{'color': '#f0be48', 'paddingLeft': '13px', 'marginTop': '8px'}}><i style={{'marginRight': '2px'}} className='fa-solid fa-circle-exclamation'/> You have made unsaved changes</span>
                            }

                            {(moderation.isActive && (moderation.moderationType == 'Permanent Ban' || moderation.moderationType == 'Ban')) &&
                                 <span style={{'color': '#f0be48', 'paddingLeft': '13px', 'marginTop': '8px'}}><i style={{'marginRight': '2px'}} className='fa-solid fa-circle-exclamation'/> This moderation type is read only on this page. Please update bans on the discord bans page of the portal.</span>
                            }
                        </div>
                    </>
                }

                {actionState != 'none' &&
                    <div className='action-state-overlay'>
                        <span style={{'color': '#349fc9', 'fontWeight': '600'}}><i style={{'marginRight': '2px'}} class="fa-solid fa-circle-info"></i> You have made modifications to this moderation that require Discord Bot Automation to complete.</span>
                        <span>If you refresh and the expected changes haven't been made, wait 5 minutes before retrying.</span>
                    </div>
                }

                {editorState == 'hidden' &&
                    <>
                        <div className='row-grouping'>
                            <span><span style={{'color': '#f0be48'}}>ID:</span> {moderation.moderationID}</span>
                            <span><span style={{'color': '#f0be48'}}>Type:</span> {moderation.moderationType}</span>
                            <span><span style={{'color': '#349fc9'}}><i class="fa-regular fa-calendar-xmark"></i> Moderated on </span> {convertToLocal(moderation.moderatedOn)}</span>
                            {moderation.isActive && moderation.extraInfo.length &&
                                <span><span style={{'color': '#c93434'}}><i class="fa-solid fa-stopwatch"></i> Revoked on </span> {convertToLocal(moderation.moderatedOn + moderation.extraInfo.length, true)}</span>                            
                            }
                            {moderation.isActive && !moderation.extraInfo.length &&
                                <span style={{'color': '#34c939'}}><i class="fa-solid fa-file"></i> Active Moderation</span>
                            }
                        </div>

                        <div className='row-grouping'>
                            <span><span style={{'color': '#f0be48'}}>DiscordID:</span> {moderation.discordID}</span>
                            <span><span style={{'color': '#f0be48'}}>ModeratorID:</span> {moderation.moderator}</span>
                        </div>

                        <div className='row-grouping'>
                            <span style={{'color': '#f0be48'}}>Reason</span>
                            <TextArea onClick={(e) => {navigator.clipboard.writeText(moderation.reason);}} style={{'resize': 'none', 'cursor': 'pointer', 'width': '75%'}} disabled={true} children={moderation.reason}/>
                        </div>

                        <div className='row-grouping'>
                            <span style={{'color': '#f0be48'}}>Evidence</span>
                            <TextArea style={{'resize': 'none', 'width': '75%'}} disabled={true} children={moderation.evidence.join(', ')}/>
                        </div>
                    </>
                }
            </div>
        </>
    );
};

export default ManageModerationsRow;