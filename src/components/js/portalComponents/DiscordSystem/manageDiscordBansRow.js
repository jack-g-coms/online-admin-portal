import React, { useState, useRef, useContext } from 'react';
import '../../../css/portalComponents/RobloxSystem/ManageBansRow.css';

import Swal from 'sweetalert2';

import Button from '../../Button';
import TextBox from '../../TextBox';
import TextArea from '../../TextArea';

import AuthContext from '../../modules/AuthContext';
import ApplyModifyDiscordBanPopup from '../../popups/ApplyModifyDiscordBan';
import { updateBan, deleteBan } from '../../modules/DiscordModerations';
import { convertToLocal, filterString } from '../../../../shared';

function ManageBansRow({ban}) {
    const [editorState, setEditorState] = useState('hidden');
    const [state, setState] = useState('available');
    const [applyModifyPopup, setApplyModifyPopup] = useState('hidden');
    const [popupState, setPoupState] = useState('available');
    const [actionState, setActionState] = useState('none');

    const authContext = useContext(AuthContext);

    const editedBan = useRef();
    const changed = useRef({});

    const deleteTrigger = () => {
        deleteBan(ban.discordID)
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
            {applyModifyPopup == 'open' && <ApplyModifyDiscordBanPopup editedBan={editedBan.current} setState={setApplyModifyPopup} setActionState={setActionState} setEditorState={setEditorState} changed={changed}/>}
            <div onClick={(e) => {if ((e.target.classList.contains('textarea') || popupState == 'loading')) return; if (editorState == 'open' || actionState != 'none') return; setEditorState('open'); editedBan.current = JSON.parse(JSON.stringify(ban));}} className='manage-roblox-bans-container-row'>
                {editorState == 'open' &&
                    <>
                        <div className='ban-editor-container fade-in'>
                            <div style={{'alignItems': 'start', 'marginBottom': '10px'}} className='ban-editor-row-edit-info'>
                                {authContext.user.permissions.Flags.UPDATE_DISCORD_BANS &&
                                    <Button animation='raise' scheme='btn-confirm' onClick={(e) => {if (changed.current.moderator || changed.current.reason || changed.current.evidence || changed.current.duration) {setApplyModifyPopup('open');}}}>{state != 'loading' && <><i class="fa-solid fa-gear"></i> Save</> || <><i className='fa-solid fa-spinner loader'/> Saving...</>}</Button>
                                }

                                {state != 'loading' &&
                                    <>
                                        <Button animation='raise' scheme='btn-cancel' onClick={(e) => {setEditorState('hidden'); setState('available'); changed.current = {};}}><i class="fa-solid fa-ban"></i> Close</Button>
                                        {authContext.user.permissions.Flags.DELETE_DISCORD_BANS &&
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
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-user"/> Moderator ID</span></strong>
                                    <TextBox setState={(newState) => {
                                        changed.current.moderator = {new: newState, old: ban.moderator};
                                        editedBan.current.moderator = newState;
                                        setState('changedModerator');
                                    }} defaultValue={editedBan.current.moderator} disabled={!authContext.user.permissions.Flags.UPDATE_DISCORD_BANS}/>
                                </div>
                            </div>

                            <div style={{'gap': '15px'}} className='ban-editor-row-edit-info'>
                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-file"/> Reason</span></strong>
                                    <TextArea setState={(newState) => {
                                        changed.current.reason = {new: newState, old: ban.reason};
                                        editedBan.current.reason = newState;
                                        setState('changedReason');
                                    }} defaultValue={editedBan.current.reason} disabled={!authContext.user.permissions.Flags.UPDATE_DISCORD_BANS}/>
                                </div>

                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-file"/> Evidence</span></strong>
                                    <TextArea setState={(newState) => {
                                        changed.current.evidence = {new: newState.split(' ').join(', '), old: ban.evidence.join(', ')};
                                        editedBan.current.evidence = newState.split(' ');
                                        setState('changedEvidence');
                                    }} defaultValue={editedBan.current.evidence.join(' ')} disabled={!authContext.user.permissions.Flags.UPDATE_DISCORD_BANS}/>
                                </div>
                            </div>

                            <div style={{'gap': '15px'}} className='ban-editor-row-edit-info'>
                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-clock"/> Duration</span></strong>
                                    <TextBox setState={(newText) => {
                                        const final_banType = {};
                                        const newState = filterString(newText, ['day', 'Day', 'Days', 's', 'week'], ''); 

                                        if (newState.toLowerCase() == 'permanent' || (Number(newState) == 0)) {
                                            final_banType.Type = 'Permanent';
                                        } else if (Number(newState) && Number(newState) > 0) {
                                            final_banType.Type = newState + ' Day';
                                            final_banType.Time = Number(newState) * 86400;
                                        }

                                        if (!final_banType.Type) return;

                                        changed.current.duration = {new: final_banType.Type, old: ban.banType.Type};
                                        editedBan.current.banType = final_banType;

                                        setState('changedType');
                                    }} defaultValue={ban.banType.Type} disabled={!authContext.user.permissions.Flags.UPDATE_DISCORD_BANS}/>
                                </div>
                            </div>

                            {(changed.current.moderator || changed.current.reason || changed.current.evidence || changed.current.duration) &&
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
                            <span><span style={{'color': '#f0be48'}}>Type:</span> {ban.banType.Type} Ban</span>
                            <span><span style={{'color': '#349fc9'}}><i class="fa-regular fa-calendar-xmark"></i> Banned on </span> {convertToLocal(ban.bannedOn)}</span>
                            {ban.banType.Type != 'Permanent' && 
                                <span><span style={{'color': '#c93434'}}><i class="fa-solid fa-stopwatch"></i> Unbanned on </span> {convertToLocal(ban.bannedOn + ban.banType.Time, true)}</span>
                            }
                            {ban.linkedModeration &&
                                <span><span style={{'color': '#34c939'}}><i class="fa-solid fa-file"></i> Linked Moderation </span> {ban.linkedModeration.moderationID}</span>
                            }
                        </div>

                        <div className='row-grouping'>
                            <span><span style={{'color': '#f0be48'}}>DiscordID:</span> {ban.discordID}</span>
                            <span><span style={{'color': '#f0be48'}}>ModeratorID:</span> {ban.moderator}</span>
                        </div>

                        <div className='row-grouping'>
                            <span style={{'color': '#f0be48'}}>Reason</span>
                            <TextArea onClick={(e) => {navigator.clipboard.writeText(ban.reason);}} style={{'resize': 'none', 'cursor': 'pointer', 'width': '75%'}} disabled={true} children={ban.reason}/>
                        </div>

                        <div className='row-grouping'>
                            <span style={{'color': '#f0be48'}}>Evidence</span>
                            <TextArea style={{'resize': 'none', 'width': '75%'}} disabled={true} children={ban.evidence.join(', ')}/>
                        </div>
                    </>
                }
            </div>
        </>
    );
};

export default ManageBansRow;