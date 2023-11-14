import React, { useContext } from 'react';
import { logout } from './modules/User';
import '../css/Navbar.css';

import Button from './Button';
import AuthContext from './modules/AuthContext';

function Navbar() {
    const authContext = useContext(AuthContext);

    return (
        <>
            <div className='nav-container'>
                <div className='nav-items'>
                    <img src='/media/images/staff-logo.png'></img>
                    <div className='text-column'>
                        <h2 style={{'padding': 0}}>Rome Admin Portal</h2>
                        <span>Rome Staff Technical Services</span>
                    </div>
                </div>

                <div className='nav-links'>
                    <i onClick={(e) => {window.location = './'}} class='fa-regular fa-circle-question fa-xl'/>

                    {authContext.user &&
                        <Button onClick={(e) => {
                            logout()
                                .then(() => {
                                    window.location = './'
                                });
                        }} animation='raise' scheme='btn-outline'>Logout</Button>
                    }
                    {!authContext.user &&
                        <Button path='/login' animation='raise' scheme='btn-outline'>Login</Button>
                    }
                </div>
            </div>
        </>  
    );
};

export default Navbar;