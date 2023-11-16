import React, { useState, useRef, useContext } from 'react';
import '../../../css/portalComponents/RobloxSystem/ManageBansRow.css';

import Button from '../../Button';
import TextBox from '../../TextBox';
import TextArea from '../../TextArea';

import AuthContext from '../../modules/AuthContext';
import { updateBan } from '../../modules/RobloxModerations';
import { convertToLocal } from '../../../../shared';

function ManageBansRow({ban}) {
    const [editorState, setEditorState] = useState('hidden');
    const authContext = useContext(AuthContext);
    console.log(ban);
    return (
        <>
            <div className='manage-roblox-bans-container-row'>
                <div className='row-grouping'>
                    <span><span style={{'color': '#f0be48'}}>Type:</span> {ban.banType.Type} Ban</span>
                    <span><span style={{'color': '#349fc9'}}><i class="fa-regular fa-calendar-xmark"></i> Banned on </span> {convertToLocal(ban.bannedOn)}</span>
                    {ban.banType.Type != 'Permanent' && 
                        <span><span style={{'color': '#c93434'}}><i class="fa-solid fa-stopwatch"></i> Unbanned on </span> {convertToLocal(ban.bannedOn + ban.banType.Time, true)}</span>
                    }
                </div>

                <div className='row-grouping'>
                    <span><span style={{'color': '#f0be48'}}>RbxID:</span> {ban.rbxID}</span>
                    <span><span style={{'color': '#f0be48'}}>ModeratorID:</span> {ban.moderator}</span>
                </div>

                <div className='row-grouping'>
                    <span style={{'color': '#f0be48'}}>Reason</span>
                    <TextArea style={{'resize': 'none', 'width': '75%'}} disabled={true} children={ban.reason}/>
                </div>

                <div className='row-grouping'>
                    <span style={{'color': '#f0be48'}}>Evidence</span>
                    <TextArea style={{'resize': 'none', 'width': '75%'}} disabled={true} children={ban.evidence.join(', ')}/>
                </div>
            </div>
        </>
    );
};

export default ManageBansRow;