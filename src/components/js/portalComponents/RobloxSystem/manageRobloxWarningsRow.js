import React, { useState, useRef, useContext } from 'react';
import '../../../css/portalComponents/RobloxSystem/ManageBansRow.css';

import Swal from 'sweetalert2';

import Button from '../../Button';
import TextBox from '../../TextBox';
import TextArea from '../../TextArea';

import AuthContext from '../../modules/AuthContext';
import ApplyModifyRobloxWarningPopup from '../../popups/ApplyModifyRobloxWarning';
import { updateWarning, deleteWarning, newWarning } from '../../modules/RobloxModerations';
import { convertToLocal, filterString } from '../../../../shared';

function ManageWarningsRow({warning}) {
    const [editorState, setEditorState] = useState('hidden');
    const [state, setState] = useState('available');
    const [applyModifyPopup, setApplyModifyPopup] = useState('hidden');
    const [popupState, setPoupState] = useState('available');

    const authContext = useContext(AuthContext);

    const editedWarning = useRef();
    const changed = useRef({});

    const deleteTrigger = () => {
        deleteWarning(warning.warnID)
            .then(response => {
                if (response.message != 'Success') {
                    Swal.fire({title: 'Error', icon: 'error', text: `There was a problem while trying to update this warning.`, confirmButtonText: 'Ok'});
                } else {
                    Swal.fire({title: 'Success', text: 'Warning has been successfully deleted.', icon: 'success', confirmButtonText: 'Ok'})
                        .then(() => {
                            window.location.reload();
                        });
                }
            }).catch(console.log);
    };

    return (
        <>
            {applyModifyPopup == 'open' && <ApplyModifyRobloxWarningPopup editedWarning={editedWarning.current} setState={setApplyModifyPopup} changes={changed.current}/>}
            <div onClick={(e) => {if ((e.target.classList.contains('textarea') || popupState == 'loading')) return; if (editorState == 'open') return; setEditorState('open'); editedWarning.current = JSON.parse(JSON.stringify(warning));}} className='manage-roblox-bans-container-row'>
                {editorState == 'open' &&
                    <>
                        <div className='ban-editor-container fade-in'>
                            <div style={{'alignItems': 'start', 'marginBottom': '10px'}} className='ban-editor-row-edit-info'>
                                {authContext.user.permissions.Flags.UPDATE_ROBLOX_WARNINGS &&
                                    <Button animation='raise' scheme='btn-confirm' onClick={(e) => {if (changed.current.moderator || changed.current.reason || changed.current.evidence || changed.current.duration) {setApplyModifyPopup('open');}}}>{state != 'loading' && <><i class="fa-solid fa-gear"></i> Save</> || <><i className='fa-solid fa-spinner loader'/> Saving...</>}</Button>
                                }

                                {state != 'loading' &&
                                    <>
                                        <Button animation='raise' scheme='btn-cancel' onClick={(e) => {setEditorState('hidden'); setState('available'); changed.current = {};}}><i class="fa-solid fa-ban"></i> Close</Button>
                                        {authContext.user.permissions.Flags.DELETE_ROBLOX_WARNINGS &&
                                            <Button animation='raise' scheme='btn-cancel' onClick={(e) => {deleteTrigger();}}><i class="fa-solid fa-trash"></i> Delete</Button>
                                        }
                                    </>
                                }
                            </div>

                            <div style={{'gap': '15px'}} className='ban-editor-row-edit-info'>
                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-user"/> Roblox ID</span></strong>
                                    <TextBox defaultValue={editedWarning.current.rbxID} disabled={true}/>
                                </div>

                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-user"/> Moderator ID</span></strong>
                                    <TextBox setState={(newState) => {
                                        changed.current.moderator = {new: newState, old: warning.moderator};
                                        editedWarning.current.moderator = newState;
                                        setState('changedModerator');
                                    }} defaultValue={editedWarning.current.moderator} disabled={!authContext.user.permissions.Flags.UPDATE_ROBLOX_WARNINGS}/>
                                </div>
                            </div>

                            <div style={{'gap': '15px'}} className='ban-editor-row-edit-info'>
                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-file"/> Reason</span></strong>
                                    <TextArea setState={(newState) => {
                                        changed.current.reason = {new: newState, old: warning.reason};
                                        editedWarning.current.reason = newState;
                                        setState('changedReason');
                                    }} defaultValue={editedWarning.current.reason} disabled={!authContext.user.permissions.Flags.UPDATE_ROBLOX_WARNINGS}/>
                                </div>

                                <div className='ban-editor-row-edit-grouping'>
                                    <strong><span><i style={{'fontSize': '15px'}} class="fa-solid fa-file"/> Evidence</span></strong>
                                    <TextArea setState={(newState) => {
                                        changed.current.evidence = {new: newState.split(' ').join(', '), old: warning.evidence.join(', ')};
                                        editedWarning.current.evidence = newState.split(' ');
                                        setState('changedEvidence');
                                    }} defaultValue={editedWarning.current.evidence.join(' ')} disabled={!authContext.user.permissions.Flags.UPDATE_ROBLOX_WARNINGS}/>
                                </div>
                            </div>

                            {(changed.current.moderator || changed.current.reason || changed.current.evidence) &&
                                <span style={{'color': '#f0be48', 'paddingLeft': '13px', 'marginTop': '8px'}}><i style={{'marginRight': '2px'}} className='fa-solid fa-circle-exclamation'/> You have made unsaved changes</span>
                            }
                        </div>
                    </>
                }

                {editorState == 'hidden' &&
                    <>
                        <div className='row-grouping'>
                            <span><span style={{'color': '#f0be48'}}>ID:</span> {warning.warnID}</span>
                            <span><span style={{'color': '#349fc9'}}><i class="fa-regular fa-calendar-xmark"></i> Warned on </span> {convertToLocal(warning.warnedOn)}</span>
                            {warning.acknowledged == 0 &&
                                <span style={{'color': '#c93434'}}><i class="fa-solid fa-stopwatch"></i> Not Acknowledged</span>
                            }
                            {warning.acknowledged == 1 &&
                                <span style={{'color': '#34c939'}}><i class="fa-solid fa-stopwatch"></i> Acknowledged</span>
                            }
                        </div>

                        <div className='row-grouping'>
                            <span><span style={{'color': '#f0be48'}}>RbxID:</span> {warning.rbxID}</span>
                            <span><span style={{'color': '#f0be48'}}>ModeratorID:</span> {warning.moderator}</span>
                        </div>

                        <div className='row-grouping'>
                            <span style={{'color': '#f0be48'}}>Reason</span>
                            <TextArea onClick={(e) => {navigator.clipboard.writeText(warning.reason);}} style={{'resize': 'none', 'cursor': 'pointer', 'width': '75%'}} disabled={true} children={warning.reason}/>
                        </div>

                        <div className='row-grouping'>
                            <span style={{'color': '#f0be48'}}>Evidence</span>
                            <TextArea style={{'resize': 'none', 'width': '75%'}} disabled={true} children={warning.evidence.join(', ')}/>
                        </div>
                    </>
                }
            </div>
        </>
    );
};

export default ManageWarningsRow;