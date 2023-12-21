import React, { useState, useContext, useRef, useEffect } from 'react';

import '../../css/portalComponents/ManageUsers.css';

import Button from '../Button';
import Loader from '../Loader';
import TextBox from '../TextBox';
import PortalUser from './portalUser';

import AuthContext from '../modules/AuthContext';
import { getUsers } from '../modules/User';
import { convertToLocal } from '../../../shared';

function ManageUsers({hidden}) {
    const [state, setState] = useState('loading');
    const [actionsVisible, setActionsVisible] = useState('hidden');

    const users = useRef();
    const authContext = useContext(AuthContext);

    useEffect(() => {
        if (!hidden) {
            getUsers()
                .then(portalUsers => {
                    users.current = portalUsers.data || {};
                    setState('available');
                }).catch(console.log);
        }
    }, [hidden]);

    return (
        <>
            <div className='manage-users-page'>
                {state == 'loading' && !users.current &&
                    <Loader style={{'margin': 'auto'}}/>
                }

                <div className={state == 'available' && !hidden ? 'manage-users-container' : 'manage-users-container-hidden'}>
                    <div className='manage-users-container-header'>
                        <h1><i style={{'marginRight': '4px'}} class='fa-solid fa-user'/> Portal Users</h1>
                    </div>

                    <div className='manage-users-container-header-notice'>
                        <span><i style={{'marginRight': '4px'}} className='fa-solid fa-circle-exclamation'/> All Portal Users are at the final discretion of the Head of Technical Services</span>
                    </div>

                    {users.current && users.current.length > 0 &&
                        <div className='manage-users-table'>
                             {users.current.map((user, i) => {
                                return (<PortalUser user={user}/>);
                             })}
                        </div>
                    }
                </div>
            </div>
        </>
    );
};

export default ManageUsers;