import React, { useState } from 'react';
import { login, search } from '../js/modules/User';
import Swal from 'sweetalert2';
import config from '../../config.json';

import '../css/Login.css';

import Button from '../js/Button';
import TextBox from '../js/TextBox';

function Login() {
    const [state, setState] = useState('available')
    const [viewState, setViewState] = useState('username');

    const [identity, setIdentity] = useState();
    const [password, setPassword] = useState();

    const [user, setUser] = useState();
    const moveToPassword = () => {
        if (!identity) return setState('available');
        search(identity)
            .then(response => {
                if (response.message == 'Success') {
                    setUser(response.data);
                    setViewState('password');
                } else if (response.message == 'Error' || response.message == 'Not Found') {
                    Swal.fire({title: 'Account Not Found', text: 'Did you mean to create an account?', icon: 'question', showDenyButton: true, confirmButtonText: 'Create Account', denyButtonColor: 'Cancel'})
                        .then((result) => {
                            if (result.isConfirmed) window.location = './signup';
                        });
                }
                setState('available');
            }).catch(console.log);
    };

    const triggerLogin = () => {
        if (!user || !identity || !password) return setState('available');
        login(identity, password)
            .then(response => {
                if (response.message == 'Success') {
                    Swal.fire({title: 'Success', text: `You have been logged into the ${config.communityName} Admin Portal as ${user.rbxUser.username} (${user.permissions.Name}).`, icon: 'success', confirmButtonText: 'Ok'})
                        .then((result) => {
                            if (result.isConfirmed) {
                                localStorage.setItem('signOn', (Date.now() / 1000));
                                window.location = './portal';
                            }
                        });
                } else if (response.message == 'Invalid Credentials') {
                    Swal.fire({title: 'Error', text: 'Improper Credentials.', icon: 'error', confirmButtonText: 'Ok'});
                } else if (response.message == 'Verify') {
                    Swal.fire({title: 'Pending Access', text: 'A system administrator has not approved your account for access! Please contact one if you believe this is a mistake.', icon: 'error', confirmButtonText: "Ok"});
                }
                setState('available');
            }).catch(console.log);
    }

    return (
        <>
            <div className='login-container'>
                <h2>Login to {config.communityName} Admin Portal</h2>

                <form onSubmit={(e) => {e.preventDefault(); setState('loading'); moveToPassword();}} className={viewState == 'username' ? 'login-fields-username' : 'login-fields-username-hidden'}>
                    <div id='login-identity-field'>
                        <span><i style={{'marginRight': '3px'}} class='fa-solid fa-user'/> Enter Account Identifier</span>
                        <TextBox style={{'width': '100%', 'text-align': 'center'}} placeholder='Input Username or Email' setState={setIdentity}>{identity}</TextBox>
                    </div>
                    <Button animation='raise' type='submit' style={{'width': '100%'}} scheme='btn-confirm'>{state == 'available' && <>Continue <i class='fa-solid fa-arrow-right'/></> || state == 'loading' && <i className='fa-solid fa-spinner loader'/>}</Button>
                    <Button animation='color pop-out' style={{'width': '100%'}} onClick={(e) => {window.location = './signup'}} scheme='btn-clear'>Need a portal account? Signup <i class='fa-solid fa-arrow-right'/></Button>
                </form>

                {user &&
                    <form onSubmit={(e) => {e.preventDefault(); setState('loading'); triggerLogin();}} className={viewState == 'password' ? 'login-fields-password' : 'login-fields-password-hidden'}>
                        <div className='login-fields-password-info'>
                            <h>Welcome back {user.rbxUser.username}!</h>
                            <h style={{'color': '#f0be48', 'font-weight': '800'}}>{user.permissions.Name}</h>
                            <img src={user.rbxUser.imageUrl}/>
                        </div>

                        <div id='password-identity-field'>
                            <span><i style={{'marginRight': '3px'}} class='fa-solid fa-lock'/> Enter Password</span>
                            <TextBox style={{'width': '100%', 'text-align': 'center'}} type='password' placeholder='Input Password' setState={setPassword}>{password}</TextBox>
                            <span id='info'>To continue on, please authenticate your account by entering your password above.</span>
                        </div>

                        <div id='password-identity-btns'>
                            <Button animation='raise' type='submit' scheme='btn-confirm'>{state == 'available' && <>Login <i class='fa-solid fa-arrow-right'/></> || state == 'loading' && <i className='fa-solid fa-spinner loader'/>}</Button>
                            <Button animation='raise' onClick={(e) => {setViewState('username');}} scheme='btn-cancel'>Back <i class='fa-solid fa-arrow-right'/></Button>
                        </div>
                    </form>
                }
            </div>
        </>
    );
};

export default Login;