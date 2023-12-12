import React, { useContext, useEffect, useRef, useState } from "react";

import '../../../App.css';

import AuthContext from "../modules/AuthContext";
import { getConfiguration } from '../modules/Configuration';

function DevNotice() {
    const authContext = useContext(AuthContext);

    const [state, setState] = useState('loading');
    const configuration = useRef();

    useEffect(() => {
        getConfiguration()
            .then(config => {
                configuration.current = config;
                setState('available');
            }).catch(console.log);
    }, []);

    return (
        <>
            {state == 'available' && configuration.current && configuration.current.DevNotice &&
                <div className='dev-notice-container'>
                    <span><i class="fa-solid fa-triangle-exclamation" style={{'marginRight': '4px'}}></i> {configuration.current.DevNotice}</span>
                </div>
            }
        </>
    );
};

export default DevNotice;
