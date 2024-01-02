import React, { useState, useContext, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import '../../../css/portalComponents/BotAutomation/CreateEmbed.css';
import AuthContext from "../../modules/AuthContext";

import Button from "../../Button";
import TextArea from "../../TextArea";
import TextBox from "../../TextBox";
import Dropdown from "../../Dropdown";

const adjustState = (setState, stateElement, next) => {
    return (newState) => {
        setState((orgState) => {
            if (next) return next(orgState, newState);
            return Object.assign({}, orgState, {[stateElement]: newState});
        });
    }
}

const maxLengths = {
    title: 256,
    description: 4096,
    footer: 2048,
    fields: 25,
    value: 1024
};

function Embed({embedInfo}) {
    return <div className='embed'>
        <div style={{'backgroundColor': embedInfo.color || '#151515'}} className='embed-color'/>
        <div style={{'gap': '15px'}} className='embed-content embed-page-horizontal-grouping'>
            <div className='embed-page-vertical-grouping'>
                {embedInfo.title &&
                    <h2>{embedInfo.title}</h2>
                }
                {embedInfo.description &&
                    <span style={{'whiteSpace': 'pre-wrap'}}>{embedInfo.description.replace(/\r?\n/g, '\n')}</span>
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
            
            {embedInfo.emblemURL &&
                <img src={embedInfo.emblemURL}/>
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
                <Button animation='raise' onClick={deleteField} style={{'padding': '5px 10px', 'marginLeft': 'auto'}} scheme='btn-cancel'>Delete</Button>
            </div>
        }
        
        {open &&
            <div className='embed-page-vertical-grouping'>
                <div style={{'alignItems': 'center'}} className='embed-page-horizontal-grouping'>
                    <i style={{'cursor': 'pointer'}} onClick={() => setOpen(false)} class="fa-solid fa-angle-down"></i>
                    <span style={{'fontSize': '20px'}}>{fieldInfo.title || 'Field'}</span>
                    <Button animation='raise' onClick={deleteField} style={{'padding': '5px 10px', 'marginLeft': 'auto'}} scheme='btn-cancel'>Delete</Button>
                </div>

                <div className='field-editor size-up'>
                    <div className='embed-page-vertical-grouping'>
                        <span className='title'>Title <em>{(fieldInfo.title && ((fieldInfo.title.length || 0) > 256)) ? <span style={{'color': '#c93434'}}>{fieldInfo.title.length}</span> : fieldInfo.title && fieldInfo.title.length || 0}/256</em></span>
                        <TextBox setState={adjustState(setFieldInfo, 'title')} placeholder='Input Text'/>
                    </div>

                    <div className='embed-page-vertical-grouping'>
                        <span className='title'>Value <em>{(fieldInfo.value && ((fieldInfo.value.length) > 1024)) ? <span style={{'color': '#c93434'}}>{fieldInfo.value.length}</span> : fieldInfo.value && fieldInfo.value.length || 0}/1024</em></span>
                        <TextArea setState={adjustState(setFieldInfo, 'value')} placeholder='Input Text'/>
                    </div>
                </div>
            </div>
        }
    </div>
}

function CreateEmbed() {
    var [state, setState] = useState({available: true, fields: []});

    var lengthValidation = async (info) => {
        console.log(info);
        var valid = true;
        for (const key in info) {
            var value = info[key];
            if (typeof value == 'string' || value instanceof Array) {
                if (maxLengths[key] && maxLengths[key] < value.length) {
                    valid = false;
                    break;
                }
            }

            if (value instanceof Array) {
                for (var i = 0; i < value.length; i++) {
                    if (value[i] instanceof Object && !(await lengthValidation(value[i]))) {
                        valid = false;
                        break;
                    }
                } 
            }
        }
        return valid;
    }

    var sendEmbed = async () => {
        var embedInfo = state;
        if (!state.available) return;

        if (!embedInfo.messageSendType || (embedInfo.messageSendType == 'User' && !embedInfo.userID) || (embedInfo.messageSendType == 'Channel' && (!embedInfo.serverID || !embedInfo.channelID))) {
            Swal.fire({title: 'Error', icon: 'error', text: `Your Embed does not have a destination.`, confirmButtonText: 'Ok'});
            return;
        }
        if (!embedInfo.color) {
            embedInfo.color = '#000000';
        }
        if (!embedInfo.title) {
            Swal.fire({title: 'Error', icon: 'error', text: `Your Embed does not have a title.`, confirmButtonText: 'Ok'});
            return;
        }
        if (embedInfo.fields) {
            var validFields = true;
            for (var i = 0; i < embedInfo.fields.length; i++) {
                if (!embedInfo.fields[i].title || !embedInfo.fields[i].value) {
                    validFields = false;
                    break;
                }
            }

            if (!validFields) {
                Swal.fire({title: 'Error', icon: 'error', text: `One or more of your fields are missing arguments.`, confirmButtonText: 'Ok'});
                return;
            }
        }
        if (!(await lengthValidation(embedInfo))) {
            Swal.fire({title: 'Error', icon: 'error', text: `One or more of your Embed arguments have failed length validation. Ensure you have not exceeded the allowed length in one of your Embed arguments.`, confirmButtonText: 'Ok'});
            return;
        }

        setState((orgState) => {
            return Object.assign({}, orgState, {available: true});
        });
    }

    return (
        <>
            <div className='embed-page'>
                <div className='editor'>
                    <h2>Editor</h2>
                    <div className='embed-page-vertical-grouping'>
                        <span className='requiredTitle'>Select the destination of your Embed</span>
                        <Dropdown setState={(newState) => {setState({messageSendType: newState, available: true, fields: []})}} options={[
                            <option value='' disabled selected>Select</option>,
                            <option value='Channel'>Channel</option>,
                            <option value='User'>User</option>
                        ]}/>
                    </div>

                    {state.messageSendType == 'Channel' &&
                        <div className='embed-page-horizontal-grouping'>
                            <div className='embed-page-vertical-grouping'>
                                <span className='requiredTitle'>Server ID</span>
                                <TextBox setState={(newState) => {
                                    if (newState == '') {
                                        setState({messageSendType: 'Channel', channelID: state.channelID, available: true, fields: []});
                                    } else {
                                        setState(Object.assign({}, state, {serverID: newState}));
                                    }
                                }} placeholder='Input a Valid Discord Server ID'/>
                            </div>

                            <div className='embed-page-vertical-grouping'>
                                <span className='requiredTitle'>Channel ID</span>
                                <TextBox setState={(newState) => {
                                    if (newState == '') {
                                        setState({messageSendType: 'Channel', serverID: state.serverID, available: true, fields: []});
                                    } else {
                                        setState(Object.assign({}, state, {channelID: newState}));
                                    }
                                }} placeholder='Input a Valid Discord Channel ID'/>
                            </div>
                        </div>
                    }

                    {state.messageSendType == 'User' &&
                        <div className='embed-page-vertical-grouping'>
                            <span className='requiredTitle'>User ID</span>
                            <TextBox setState={(newState) => {
                                if (newState == '') {
                                    setState({messageSendType: 'User', available: true, fields: []});
                                } else {
                                    setState(Object.assign({}, state, {userID: newState}));
                                }
                            }} placeholder='Input a Valid Discord ID'/>
                        </div>
                    }

                    {((state.serverID && state.channelID && state.messageSendType == 'Channel') || (state.userID && state.messageSendType == 'User')) &&
                        <>
                            <div className='embed-page-vertical-grouping'>
                                <span className='title'>Title <em>{(state.title && ((state.title.length) > 256)) ? <span style={{'color': '#c93434'}}>{state.title.length}</span> : state.title && state.title.length || 0}/256</em></span>
                                <TextBox setState={adjustState(setState, 'title')} placeholder='Input Text'/>
                            </div>

                            <div className='embed-page-vertical-grouping'>
                                <span className='title'>Color</span>
                                <TextBox setState={adjustState(setState, 'color')} placeholder='Input Hex'/>
                            </div>

                            <div className='embed-page-vertical-grouping'>
                                <span className='title'>Description <em>{(state.description && ((state.description.length) > 4096)) ? <span style={{'color': '#c93434'}}>{state.description.length}</span> : state.description && state.description.length || 0}/4096</em></span>
                                <TextArea setState={adjustState(setState, 'description')} placeholder='Input Text'/>
                            </div>

                            <div className='embed-page-horizontal-grouping'>
                                <div className='embed-page-vertical-grouping'>
                                    <span className='title'>Emblem URL</span>
                                    <TextBox setState={adjustState(setState, 'emblemURL')} placeholder='Input URL'/>
                                </div>
                                <div className='embed-page-vertical-grouping'>
                                    <span className='title'>Footer <em>{(state.footer && ((state.footer.length) > 2048)) ? <span style={{'color': '#c93434'}}>{state.footer.length}</span> : state.footer && state.footer.length || 0}/2048</em></span>
                                    <TextBox setState={adjustState(setState, 'footer')} placeholder='Input Text'/>
                                </div>
                            </div>

                            <div className='embed-page-vertical-grouping'>
                                <span className='title'>Fields <em>{(state.fields && ((state.fields.length) > 25)) ? <span style={{'color': '#c93434'}}>{state.fields.length}</span> : state.fields && state.fields.length || 0}/25</em></span>
                                <Button style={{'marginTop': '5px', 'padding': '8px 10px', 'width': 'fit-content'}} animation='raise' onClick={() => setState(Object.assign({}, state, {fields: [...state.fields, {}]}))} scheme='btn-info'><i style={{'marginRight': '5px'}} class="fa-solid fa-plus"></i> Add Field</Button>

                                {state.fields && 
                                    <div className='fields'>
                                        {state.fields.map((info, index) => {
                                            return <Field embedSetState={setState} index={index} info={info}/>
                                        })}
                                    </div>
                                }
                            </div>

                            <Button onClick={sendEmbed} style={{'marginTop': '25px', 'width': 'fit-content'}} animation='raise' scheme='btn-confirm'><i style={{'marginRight': '5px', 'fontSize': '15px'}} class="fa-brands fa-discord"/> Send Embed</Button>
                        </>
                    }
                </div>

                <div className='preview'>
                    <h2>Preview</h2>
                    <span style={{'color': '#f0be48'}}>Your embed may look like this. Do keep in mind, this message is sent by Roman Systems, a symbol of the Staff Team, all messages should be mature and formal.</span>
                    <Embed embedInfo={state}/>
                </div>
            </div>
        </>
    );
}

export default CreateEmbed;