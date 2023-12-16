import React, { useState, useRef, useEffect, useContext } from 'react';
import { getConfiguration, updateConfiguration } from '../modules/Configuration';
import Swal from 'sweetalert2';

import '../../css/popups/PortalNotice.css';
import '../../css/Popup.css';

import Button from '../Button';
import TextBox from '../TextBox';
import Loader from '../Loader';
import TextArea from '../TextArea';

import AuthContext from '../modules/AuthContext';
import { convertToLocal } from '../../../shared';

function DevNoticePopup({setState}) {
    const authContext = useContext(AuthContext);

    const [popupState, setPopupState] = useState('loading');
    const [actionState, setActionState] = useState('available');
    const [notice, setNotice] = useState();

    const configuration = useRef();

    const updateNotice = (toSet) => {
        updateConfiguration(null, toSet)
            .then(() => {
                Swal.fire({title: 'Success', icon: 'success', text: `Successfully set notice.`, confirmButtonText: 'Ok'})
                    .then((res) => {
                        if (res.isConfirmed) {
                            setState('closed');
                            setActionState('available');
                            setNotice(toSet);
                        }
                    });
            });
    }

    useEffect(() => {
        getConfiguration()
            .then(config => {
                configuration.current = config;
                setPopupState('available');

                if (configuration.current.DevNotice) {
                    setNotice(configuration.current.DevNotice);
                }
            });
    }, []);

    return (
        <>
            <div className='popup-background-center' onClick={(e) => {if (e.target != e.currentTarget || popupState == 'loading') return; setState('closed');}}>
                <div className='popup-container'>
                    <h2>Development Notice Setup</h2>

                    <div style={{'alignItems': popupState == 'loading' && 'center', 'marginTop': '-1px'}} className='content'>
                        {popupState == 'loading' &&
                            <Loader style={{'border': 'none', 'backgroundColor': 'transparent', 'width': '200px', 'height': '200px'}}/>
                        }
                        {popupState == 'available' &&
                            <>
                                <div className='vertical-grouping-portal-notice search-container'>
                                    <div>
                                        <span><i style={{'marginRight': '1px'}} class='fa-solid fa-hammer'/> Development Notice</span>
                                        <TextBox placeholder='Enter a valid and appropriate notice' style={{'marginTop': '6px'}} setState={setNotice} defaultValue={notice}/>

                                        <div className='row-portal-notice' style={{'justifyContent': 'center', 'gap': '10px'}}>
                                            <Button style={{'marginTop': '10px', 'width': configuration.current.DevNotice ? '50%' : '100%'}} animation='raise' scheme='btn-confirm' onClick={(e) => {if (actionState == 'available') {setActionState('loading'); updateNotice(notice);}}}><i class="fa-solid fa-gear"></i> Save</Button>
                                            {configuration.current.DevNotice && <Button style={{'marginTop': '10px', 'width': '50%'}} animation='raise' scheme='btn-cancel' onClick={(e) => {if (actionState == 'available') {setActionState('loading'); updateNotice('');}}}><i class="fa-solid fa-trash"></i> Clear</Button>}
                                        </div>
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </div>
            </div>
        </>
    );
};

export default DevNoticePopup;