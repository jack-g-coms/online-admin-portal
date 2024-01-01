import React, { useState, useContext, useRef, useEffect } from "react";
import '../../../css/portalComponents/BotAutomation/CreateEmbed.css';
import AuthContext from "../../modules/AuthContext";

import Button from "../../Button";
import TextArea from "../../TextArea";
import TextBox from "../../TextBox";
import Dropdown from "../../Dropdown";

const adjustState = (setState, stateElement) => {
    return (newState) => {
        setState((orgState) => {
            return Object.assign({}, orgState, {[stateElement]: newState})
        });
    }
}

function Embed({embedInfo}) {
    return <div className='embed'>
        <div style={{'backgroundColor': embedInfo.color || '#151515'}} className='embed-color'/>
        <div className='embed-content'>
            {embedInfo.emblemURL &&
                <img src={embedInfo.emblemURL}/>
            }

            {embedInfo.title &&
                <h2>{embedInfo.title}</h2>
            }
            {embedInfo.description &&
                <p>{embedInfo.description}</p>
            }

            {embedInfo.fields.map((info, _) => {
                return <div style={{'marginTop': '10px', 'gap': '2px'}} className='embed-page-vertical-grouping'>
                    {info.title &&
                        <span className='bodyTitle'>{info.title}</span>
                    }
                    {info.value &&
                        <span className='bodyContent'>{info.value}</span>
                    }
                </div>
            })}

            {embedInfo.footer &&
                <span className='footer'>{embedInfo.footer}</span>
            }
        </div>
    </div>
}

function Field({index, info, embedSetState}) {
    var [open, setOpen] = useState(false);
    var [fieldInfo, setFieldInfo] = useState(info);

    var deleteField = () => {
        embedSetState((orgState) => {
            var newFields = orgState.fields;
            newFields.splice(index, 1);
            return Object.assign({}, orgState, {fields: newFields});
        });
    }

    var updateField = () => {
        embedSetState((orgState) => {
            var newFields = orgState.fields;
            newFields[index] = fieldInfo
            return Object.assign({}, orgState, {fields: newFields});
        });
    }

    useEffect(() => {
        updateField();
    }, [fieldInfo]);

    return <div className='field'>
        {!open &&
            <div style={{'alignItems': 'center'}} className='embed-page-horizontal-grouping'>
                <i style={{'cursor': 'pointer'}} onClick={() => setOpen(true)} class="fa-solid fa-angle-right"></i>
                <span style={{'fontSize': '20px'}}>{fieldInfo.title || 'Field'}</span>
                <Button onClick={deleteField} style={{'padding': '5px 10px', 'marginLeft': 'auto'}} scheme='btn-cancel'>Delete</Button>
            </div>
        }
        
        {open &&
            <div className='embed-page-vertical-grouping'>
                <div style={{'alignItems': 'center'}} className='embed-page-horizontal-grouping'>
                    <i style={{'cursor': 'pointer'}} onClick={() => setOpen(false)} class="fa-solid fa-angle-down"></i>
                    <span style={{'fontSize': '20px'}}>{fieldInfo.title || 'Field'}</span>
                    <Button onClick={deleteField} style={{'padding': '5px 10px', 'marginLeft': 'auto'}} scheme='btn-cancel'>Delete</Button>
                </div>

                <div className='field-editor size-up'>
                    <div className='embed-page-vertical-grouping'>
                        <span className='title'>Title <em>{fieldInfo.title && fieldInfo.title.length || 0}/256</em></span>
                        <TextBox setState={adjustState(setFieldInfo, 'title')} placeholder='Input Text'/>
                    </div>

                    <div className='embed-page-vertical-grouping'>
                        <span className='title'>Value <em>{fieldInfo.value && fieldInfo.value.length || 0}/1024</em></span>
                        <TextArea setState={adjustState(setFieldInfo, 'value')} placeholder='Input Text'/>
                    </div>
                </div>
            </div>
        }
    </div>
}

function CreateEmbed() {
    // messageSendType, title, color, description, thumbnail, footer, fields
    var [state, setState] = useState({available: true, fields: []});

    return (
        <>
            <div className='embed-page'>
                <div className='editor'>
                    <h2>Editor</h2>
                    <div className='embed-page-vertical-grouping'>
                        <span className='requiredTitle'>Select the destination of your Embed</span>
                        <Dropdown setState={adjustState(setState, 'messageSendType')} options={[
                            <option value='' disabled selected>Select</option>,
                            <option value='Channel'>Channel</option>,
                            <option value='User'>User</option>
                        ]}/>
                    </div>

                    {state.messageSendType == 'Channel' &&
                        <div className='embed-page-horizontal-grouping'>
                            <div className='embed-page-vertical-grouping'>
                                <span className='requiredTitle'>Server ID</span>
                                <TextBox setState={adjustState(setState, 'serverID')} placeholder='Input a Valid Discord Server ID'/>
                            </div>

                            <div className='embed-page-vertical-grouping'>
                                <span className='requiredTitle'>Channel ID</span>
                                <TextBox setState={adjustState(setState, 'channelID')} placeholder='Input a Valid Discord Channel ID'/>
                            </div>
                        </div>
                    }

                    {state.messageSendType == 'User' &&
                        <div className='embed-page-vertical-grouping'>
                            <span className='requiredTitle'>User ID</span>
                            <TextBox setState={adjustState(setState, 'userID')} placeholder='Input a Valid Discord ID'/>
                        </div>
                    }

                    {((state.serverID && state.channelID && state.messageSendType == 'Channel') || (state.userID && state.messageSendType == 'User')) &&
                        <>
                            <div className='embed-page-vertical-grouping'>
                                <span className='title'>Title <em>{state.title && state.title.length || 0}/256</em></span>
                                <TextBox setState={adjustState(setState, 'title')} placeholder='Input Text'/>
                            </div>

                            <div className='embed-page-vertical-grouping'>
                                <span className='title'>Color</span>
                                <TextBox setState={adjustState(setState, 'color')} placeholder='Input Hex'/>
                            </div>

                            <div className='embed-page-vertical-grouping'>
                                <span className='title'>Description <em>{state.description && state.description.length || 0}/4096</em></span>
                                <TextArea setState={adjustState(setState, 'description')} placeholder='Input Text'/>
                            </div>

                            <div className='embed-page-horizontal-grouping'>
                                <div className='embed-page-vertical-grouping'>
                                    <span className='title'>Emblem URL</span>
                                    <TextBox setState={adjustState(setState, 'emblemURL')} placeholder='Input URL'/>
                                </div>
                                <div className='embed-page-vertical-grouping'>
                                    <span className='title'>Footer <em>{state.footer && state.footer.length || 0}/2048</em></span>
                                    <TextBox setState={adjustState(setState, 'footer')} placeholder='Input Text'/>
                                </div>
                            </div>

                            <div className='embed-page-vertical-grouping'>
                                <span className='title'>Fields <em>{state.fields && state.fields.length || 0}/25</em></span>
                                <Button style={{'padding': '8px 5px', 'width': '20%'}} onClick={() => setState(Object.assign({}, state, {fields: [...state.fields, {}]}))} scheme='btn-confirm'><i style={{'marginRight': '5px'}} class="fa-solid fa-plus"></i> Add Field</Button>

                                {state.fields && 
                                    <div className='fields'>
                                        {state.fields.map((info, index) => {
                                            return <Field embedSetState={setState} index={index} info={info}/>
                                        })}
                                    </div>
                                }
                            </div>
                        </>
                    }
                </div>

                <div className='preview'>
                    <h2>Preview</h2>
                    <Embed embedInfo={state}/>
                </div>
            </div>
        </>
    );
}

export default CreateEmbed;